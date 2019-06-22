<?php

namespace App\Http\Controllers;

use App\Contracts\Repositories\ShoppingCenterRepository;
use App\Exceptions\Repositories\FileNotFoundException;
use App\Http\Requests\CouponRequest;
use App\Models\CouponFile;
use App\Models\Merchant;
use App\Utilities\FirebasePushNotifications;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Contracts\Repositories\MerchantRepository;
use App\Contracts\Repositories\CouponRepository;
use App\Exceptions\Repositories\MerchantNotFoundException;
use App\Exceptions\Repositories\ShoppingCenterNotFoundException;
use App\Contracts\Repositories\UserRepository;
use App\Exceptions\Repositories\CouponStateException;
use App\Exceptions\Repositories\CouponDateException;
use App\Exceptions\Repositories\UserNotFoundException;
use App\Http\Requests\MerchantCouponsRequest;
use App\Http\Requests\UploadFileRequest;
use App\Exceptions\Repositories\CouponNotFoundException;
use \Firebase\JWT\JWT;

class CouponsController extends ApiController
{
    private $merchantRepository;
    private $couponRepository;
    private $shoppingCenterRepository;
    private $userId;
    private $role;

    public function __construct(ShoppingCenterRepository $shoppingCenterRepository, CouponRepository $couponRepository, MerchantRepository $merchantRepository, Request $request, UserRepository $userRepository)
    {
        $this->couponRepository = $couponRepository;
        $this->merchantRepository = $merchantRepository;
        $this->shoppingCenterRepository = $shoppingCenterRepository;
        $this->role = '';
        try {
            $key = config('app.JWT_key');

            $token = $request->header('Authorization');

            $decoded = (array) JWT::decode($token, $key, array('HS256'));

            $user = $userRepository->getByEmail($decoded['email']);

            $this->userId = $user->id;
            $this->role = $decoded['role'];
        } catch (UserNotFoundException $userNotFoundException) {
            $this->userId = 0;
        } catch (\UnexpectedValueException $unexpectedValueException) {
            $this->userId = 0;
        }
    }

    /**
     * Display a listing of the users coupons.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/coupons",
     *     description="Returns all coupons associated with users merchant.",
     *     produces={"application/json"},
     *     tags={"coupons"},
     *      @SWG\Parameter(
     *          description="Id of users merchant.",
     *          in="query",
     *          name="merchant_id",
     *          required=true,
     *          type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="How many results want per page.",
     *         in="query",
     *         name="limit",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Page number.",
     *         in="query",
     *         name="page",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Active (value 0 - for inactive, 1 - for active)",
     *         in="query",
     *         name="active",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Retrurns all users coupons."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Merchant not found."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation Errors."
     *     ),
     * )
     */
    public function index(MerchantCouponsRequest $request)
    {
        $merchantId = $request->input('merchant_id');
        if ($this->role == 'admin') {
            $coupons = $this->couponRepository->getCoupons($request, $merchantId);

            return response()->json($coupons, 200);
        } else if ($this->role == 'sc-user') {
            $coupons = $this->couponRepository->getCoupons($request, $merchantId, $this->userId);

            return response()->json($coupons, 200);
        } else if ($this->role == 'user') {
            try {
                $this->merchantRepository->checkMerchantOwner($merchantId, $this->userId);
            } catch (MerchantNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }

            $coupons = $this->couponRepository->getCouponsByUserIdAndMerchantId($this->userId, $request);

            return response()->json($coupons, 200);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }

    /**
     * Creates coupon.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/coupons",
     *     description="Creates coupon. If user specifies merchant that is not associated with him/her, 404 will be responded.",
     *     produces={"application/json"},
     *     tags={"coupons"},
     *      @SWG\Parameter(
     *          description="Title of coupon.",
     *          in="formData",
     *          name="title",
     *          required=true,
     *          type="string",
     *     ),
     *      @SWG\Parameter(
     *          description="Description of coupon.",
     *          in="formData",
     *          name="description",
     *          required=true,
     *          type="string",
     *     ),
     *      @SWG\Parameter(
     *          description="Merchant id to which will coupon be bound for.",
     *          in="formData",
     *          name="merchant_id",
     *          required=true,
     *          type="integer",
     *     ),
     *      @SWG\Parameter(
     *          description="Start date. Date format must be ISO8601.",
     *          in="formData",
     *          name="start_date",
     *          required=true,
     *          type="string",
     *     ),
     *      @SWG\Parameter(
     *          description="End date. Date format must be ISO8601.",
     *          in="formData",
     *          name="end_date",
     *          required=true,
     *          type="string",
     *     ),
     *      @SWG\Parameter(
     *          description="Array of coupon images od pdfs.",
     *          in="formData",
     *          name="files[]",
     *          required=false,
     *          type="file",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns new coupon."
     *     ),
     *     @SWG\Response(
     *         response=403,
     *         description="User can only add coupons to his/hers merchants."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function store(CouponRequest $request, FirebasePushNotifications $firebasePushNotifications)
    {
        if ($this->role == 'admin') {
            $coupon = $this->couponRepository->store($request);

            $coupon = $this->couponRepository->getById($coupon->id, false);

            $merchant = Merchant::find($request->input('merchant_id'));

            $body = str_replace('{coupon_name}', $coupon->name, str_replace('{merchant_name}', $merchant->name, $request->input('notification_body')));
            $title = str_replace('{coupon_name}', $coupon->name, str_replace('{merchant_name}', $merchant->name, $request->input('notification_title')));

            if ($body == '') {
                $body = 'Coupon added.';
            }
            if ($title == '') {
                $title = 'Coupon added.';
            }

            $couponImage = CouponFile::where('coupon_id', $coupon->id)->first();
            $couponImageUrl = null;
            if ($couponImage) {
                $couponImageUrl = $couponImage->url;
            }
            $firebasePushNotifications->sendNotificationToTopic(sprintf('merchant-%s', $merchant->id), $title, $body, ['action' => 'new_coupon', 'merchant_id' => $merchant->id, 'action_id' => $coupon->id], $couponImageUrl);

            return response()->json($coupon, 200);
        } else if ($this->role == 'user' || $this->role == 'sc-user') {
            try {
                if ($this->role == 'user') {
                    $this->merchantRepository->checkMerchantOwner($request->input('merchant_id'), $this->userId);
                } else {
                    $this->merchantRepository->checkMerchantOwner($request->input('merchant_id'), $this->userId, true);
                }
            } catch (MerchantNotFoundException $e) {
                return response()->json(['status' => 403, 'message' => 'User can only add coupons to his/hers merchants.', 'timestamp' => Carbon::now()->toDateTimeString()], 403);
            }

            $coupon = $this->couponRepository->store($request);

            $coupon = $this->couponRepository->getById($coupon->id, false);

            $merchant = Merchant::find($request->input('merchant_id'));

            $body = str_replace('{coupon_name}', $coupon->name, str_replace('{merchant_name}', $merchant->name, $request->input('notification_body')));
            $title = str_replace('{coupon_name}', $coupon->name, str_replace('{merchant_name}', $merchant->name, $request->input('notification_title')));

            $couponImage = CouponFile::where('coupon_id', $coupon->id)->first();
            $couponImageUrl = null;
            if ($couponImage) {
                $couponImageUrl = $couponImage->url;
            }

            if ($body == '') {
                $body = 'Coupon added.';
            }
            if ($title == '') {
                $title = 'Coupon added.';
            }

            $firebasePushNotifications->sendNotificationToTopic(sprintf('merchant-%s', $merchant->id), $title, $body, ['action' => 'new_coupon', 'merchant_id' => $merchant->id, 'action_id' => $coupon->id], $couponImageUrl);

            return response()->json($coupon, 200);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }

    /**
     * Display Coupon.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/coupons/{id}",
     *     description="Returns requested coupon and associated merchant. If coupon doesn't exist or coupon isn't in users property 404 will be responded. ",
     *     produces={"application/json"},
     *     tags={"coupons"},
     *     @SWG\Parameter(
     *         description="Coupon Id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns requested coupon."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Coupon not found."
     *     )
     * )
     *
     */
    public function show($id)
    {
        if ($this->role == 'admin') {
            try {
                $coupon = $this->couponRepository->getById($id);
            } catch (CouponNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Coupon not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else if ($this->role == 'user') {
            try {
                $coupon = $this->couponRepository->getCouponByIdAndUserId($this->userId, $id);
            } catch (CouponNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Coupon not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else if ($this->role == 'sc-user') {
            try {
                $coupon = $this->couponRepository->getCouponByIdAndUserId($this->userId, $id, true, true);
            } catch (CouponNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Coupon not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        }
        else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

        return response()->json($coupon, 200);
    }


    /**
     * Update Coupon.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\PUT(
     *     path="/coupons/{id}",
     *     description="Updates requested coupon if it exist. Otherwise 404 will be responded.",
     *     produces={"application/json"},
     *     tags={"coupons"},
     *     @SWG\Parameter(
     *         description="Coupons Id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *          description="Title of coupon.",
     *          in="formData",
     *          name="title",
     *          required=true,
     *          type="string",
     *     ),
     *      @SWG\Parameter(
     *          description="Description of coupon.",
     *          in="formData",
     *          name="description",
     *          required=true,
     *          type="string",
     *     ),
     *      @SWG\Parameter(
     *          description="Merchant id to which will coupon be bound for.",
     *          in="formData",
     *          name="merchant_id",
     *          required=true,
     *          type="integer",
     *     ),
     *      @SWG\Parameter(
     *          description="Start date. Date format must be ISO8601.",
     *          in="formData",
     *          name="start_date",
     *          required=true,
     *          type="string",
     *     ),
     *      @SWG\Parameter(
     *          description="End date. Date format must be ISO8601.",
     *          in="formData",
     *          name="end_date",
     *          required=true,
     *          type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns requested coupon."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Coupon not found."
     *     ),
     *     @SWG\Response(
     *         response=403,
     *         description="User can only add coupons to his/hers merchants."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        if ($this->role == 'admin') {
            try {
                $coupon = $this->couponRepository->getById($id);
            } catch (CouponNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Coupon not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }

            $coupon = $this->couponRepository->update($id, $request);

            $coupon = $this->couponRepository->getById($coupon->id, false);

            return response()->json($coupon, 200);

        } else if ($this->role == 'user' || $this->role == 'sc-user') {
            try {
                if ($this->role == 'user') {
                    $this->merchantRepository->checkMerchantOwner($request->input('merchant_id'), $this->userId);
                } else {
                    $this->merchantRepository->checkMerchantOwner($request->input('merchant_id'), $this->userId, true);
                }
            } catch (MerchantNotFoundException $e) {
                return response()->json(['status' => 403, 'message' => 'User can only add coupons to his/hers merchants.', 'timestamp' => Carbon::now()->toDateTimeString()], 403);
            }

            try {
                $coupon = $this->couponRepository->getById($id);
            } catch (CouponNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Coupon not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }

            $coupon = $this->couponRepository->update($id, $request);

            $coupon = $this->couponRepository->getById($coupon->id, false);

            return response()->json($coupon, 200);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

    }

    /**
     * Removes coupon.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\DELETE(
     *     path="/coupons/{id}",
     *     description="Deletes coupon if it exists and if it is associated with user. Otherwise 400 will be responded. ",
     *     produces={"application/json"},
     *     tags={"coupons"},
     *      @SWG\Parameter(
     *          description="Coupon Id",
     *          in="path",
     *          name="id",
     *          required=true,
     *          type="string",
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Coupon not found."
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Coupon has been successfully deleted."
     *     )
     * )
     */
    public function destroy($id)
    {
        if ($this->role == 'admin') {
            try {
                $this->couponRepository->delete($id);
            } catch (CouponNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Coupon not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }

            return response()->json('Coupon has been successfully deleted.', 200);
        } else if ($this->role == 'user' || $this->role == 'sc-user') {
            try {
                if ($this->role == 'user') {
                    $this->couponRepository->getCouponByIdAndUserId($this->userId, $id);
                } else {
                    $this->couponRepository->getCouponByIdAndUserId($this->userId, $id, true, true);
                }
            } catch (CouponNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Coupon not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }

            $this->couponRepository->delete($id);

            return response()->json('Coupon has been successfully deleted.', 200);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

    }

    /**
     * Activates Coupon.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/coupons/{id}/activate",
     *     description="Activates coupon, if it isn't already active and if the coupon dates are correct. ",
     *     produces={"application/json"},
     *     tags={"coupons"},
     *     @SWG\Parameter(
     *         description="Coupon Id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Coupon has been successfully activated."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Coupon not found."
     *     ),
     *     @SWG\Response(
     *         response=409,
     *         description="Coupon is already active."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Coupon can not be activated. Check the dates."
     *     ),
     * )
     *
     */

    public function activateCoupon($id, FirebasePushNotifications $firebasePushNotifications)
    {
        if ($this->role == 'admin' || $this->role == 'user' || $this->role == 'sc-user') {
            try {
                if ($this->role == 'admin') {
                    $coupon = $this->couponRepository->getById($id, false);
                } else if ($this->role == 'sc-user') {
                    $coupon = $this->couponRepository->getCouponByIdAndUserId($this->userId, $id, false, true);
                }else {
                    $coupon = $this->couponRepository->getCouponByIdAndUserId($this->userId, $id, false);
                }
            } catch (CouponNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Coupon not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }

            try {
                $this->couponRepository->activateCoupon($coupon);

                $merchant = Merchant::find($coupon->merchant_id);

                $couponImage = CouponFile::where('coupon_id', $coupon->id)->first();
                $couponImageUrl = null;
                if ($couponImage) {
                    $couponImageUrl = $couponImage->url;
                }

                $body = 'Coupon activated.';
                $title = 'Coupon activated.';

                $firebasePushNotifications->sendNotificationToTopic(sprintf('merchant-%s', $merchant->id), $title, $body, ['action' => 'coupon_activated', 'merchant_id' => $merchant->id, 'action_id' => $coupon->id], $couponImageUrl);
            } catch (CouponStateException $e) {
                return response()->json(['status' => 409, 'message' => 'Coupon is already active.', 'timestamp' => Carbon::now()->toDateTimeString()], 409);
            } catch (CouponDateException $e) {
                return response()->json(['status' => 422, 'message' => 'Coupon can not be activated. Check the dates.', 'timestamp' => Carbon::now()->toDateTimeString()], 422);
            }
            return response()->json('Coupon has been successfully activated.', 200);
        } else  {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }

    /**
     * Deactivates Coupon.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/coupons/{id}/deactivate",
     *     description="Deactivates coupon, if it isn't already deactive. ",
     *     produces={"application/json"},
     *     tags={"coupons"},
     *     @SWG\Parameter(
     *         description="Coupon Id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Coupon has been successfully deactivated."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Coupon not found."
     *     ),
     *     @SWG\Response(
     *         response=409,
     *         description="Coupon is already deactive."
     *     )
     * )
     *
     */
    public function deactivateCoupon($id)
    {
        if ($this->role == 'admin' || $this->role == 'user' || $this->role == 'sc-user') {
            try {
                if ($this->role == 'admin') {
                    $coupon = $this->couponRepository->getById($id, false);
                } else if ($this->role == 'sc-user') {
                    $coupon = $this->couponRepository->getCouponByIdAndUserId($this->userId, $id, false, true);
                }else {
                    $coupon = $this->couponRepository->getCouponByIdAndUserId($this->userId, $id, false);
                }
            } catch (CouponNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Coupon not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
            try {
                $this->couponRepository->deactivateCoupon($coupon);
            } catch (CouponStateException $e) {
                return response()->json(['status' => 409, 'message' => 'Coupon is already deactive.', 'timestamp' => Carbon::now()->toDateTimeString()], 409);
            }
            return response()->json('Coupon has been successfully deactivated.', 200);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }


    }

    /**
     * Upload file.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/coupons/{coupon_id}/upload-file",
     *     description="Upload file.",
     *     produces={"application/json"},
     *     tags={"coupons"},
     *     @SWG\Parameter(
     *         description="Coupon Id",
     *         in="path",
     *         name="coupon_id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="File",
     *         in="formData",
     *         name="file",
     *         required=true,
     *         type="file",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="File uploaded."
     *     ),
     *     @SWG\Response(
     *         response=403,
     *         description="User can only add file to his/hers coupons."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation error."
     *     )
     * )
     *
     */
    public function uploadFile($id, UploadFileRequest $request)
    {
        if ($this->role == 'admin') {
            try {
                $coupon = $this->couponRepository->getById($id, false);
            } catch (CouponNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Coupon not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }

            $couponFile = $this->couponRepository->uploadFile($request, $coupon);

            return response()->json($couponFile, 200);
        } else if ($this->role == 'sc-user') {
            try {
                $coupon = $this->couponRepository->getCouponByIdAndUserId($this->userId, $id, true, true);
            } catch (CouponNotFoundException $e) {
                return response()->json(['status' => 403, 'message' => 'User can only add file to his/hers coupons.', 'timestamp' => Carbon::now()->toDateTimeString()], 403);
            }

            $couponFile = $this->couponRepository->uploadFile($request, $coupon['coupon']);

            return response()->json($couponFile, 200);
        } else if ($this->role == 'user') {
            try {
                $coupon = $this->couponRepository->getCouponByIdAndUserId($this->userId, $id);
            } catch (CouponNotFoundException $e) {
                return response()->json(['status' => 403, 'message' => 'User can only add file to his/hers coupons.', 'timestamp' => Carbon::now()->toDateTimeString()], 403);
            }

            $couponFile = $this->couponRepository->uploadFile($request, $coupon['coupon']);

            return response()->json($couponFile, 200);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

    }

    /**
     * Remove file.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Delete(
     *     path="/coupons/{coupon_id}/remove-file/{file_id}",
     *     description="Upload file.",
     *     produces={"application/json"},
     *     tags={"coupons"},
     *     @SWG\Parameter(
     *         description="Coupon id",
     *         in="path",
     *         name="coupon_id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="File Id",
     *         in="path",
     *         name="file_id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="File has been successfully deleted."
     *     ),
     *     @SWG\Response(
     *         response=403,
     *         description="User can only remove file from his/hers coupons."
     *     )
     * )
     *
     */
    public function removeFile($couponId, $fileId)
    {
        if ($this->role == 'admin') {
            try {
                $this->couponRepository->checkIsFileExist($fileId);
            } catch (FileNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'File not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }

            $this->couponRepository->removeFile($fileId);

            return response()->json('File has been successfully deleted.', 200);
        } else if ($this->role == 'sc-user') {
            try {
                $this->couponRepository->getCouponByFileIdAndUserId($this->userId, $fileId, true);
            } catch (CouponNotFoundException $e) {
                return response()->json(['status' => 403, 'message' => 'User can only remove file from his/hers coupons.', 'timestamp' => Carbon::now()->toDateTimeString()], 403);
            }

            $this->couponRepository->removeFile($fileId);

            return response()->json('File has been successfully deleted.', 200);
        } else if ($this->role == 'user') {
            try {
                $this->couponRepository->getCouponByFileIdAndUserId($this->userId, $fileId);
            } catch (CouponNotFoundException $e) {
                return response()->json(['status' => 403, 'message' => 'User can only remove file from his/hers coupons.', 'timestamp' => Carbon::now()->toDateTimeString()], 403);
            }

            $this->couponRepository->removeFile($fileId);

            return response()->json('File has been successfully deleted.', 200);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }
}
