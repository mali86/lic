<?php

namespace App\Http\Controllers;

use App\Contracts\Repositories\CouponRepository;
use App\Contracts\Repositories\MerchantRepository;
use App\Contracts\Repositories\ShoppingCenterRepository;
use App\Exceptions\Repositories\MerchantNotFoundException;
use App\Http\Requests\LatLonRequest;
use App\Http\Requests\MerchantRequest;
use App\Models\MerchantCategory;
use App\Models\PushNotificationSubscriber;
use App\Utilities\FirebasePushNotifications;
use App\Utilities\NotificationsSendEmail;
use Carbon\Carbon;
use Geocode;
use Illuminate\Mail\Mailer;
use Illuminate\Http\Request;
use App\Exceptions\Repositories\ShoppingCenterNotFoundException;
use App\Models\ShoppingCenter;
use App\Exceptions\Repositories\UserNotFoundException;
use App\Http\Requests\LogoRequest;
use App\Contracts\Repositories\UserRepository;
use \Firebase\JWT\JWT;
use League\Flysystem\Exception;

class MerchantsController extends ApiController
{
    private $merchantRepository;
    private $couponRepository;
    private $shoppingCenterRepository;
    private $role;

    public function __construct(MerchantRepository $merchantRepository, CouponRepository $couponRepository, ShoppingCenterRepository $shoppingCenterRepository, UserRepository $userRepository, Request $request)
    {
        $this->merchantRepository = $merchantRepository;
        $this->couponRepository = $couponRepository;
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

    public function updateCoordinates(Request $request, $id)
    {
        try {
            $merchant = $this->merchantRepository->getById($id);

            $merchant->coordinates = $request->input('coordinates');
            $merchant->update();
        } catch (MerchantNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return response()->json($merchant);
    }

    /**
     * Display a listing of the merchants.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/merchants",
     *     description="Returns merchants.",
     *     produces={"application/json"},
     *     tags={"merchants"},
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
     *         description="Column name for sort. (- before name for desc)",
     *         in="query",
     *         name="sort_by",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Search by merchant name or shopping center name.",
     *         in="query",
     *         name="search",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Array with categories ids for filter merchants by category.",
     *         in="query",
     *         name="filters[]",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns merchants and count of merchants number."
     *     )
     * )
     */
    public function index(Request $request)
    {
        if ($this->role == 'admin'|| $this->role == 'sc-user') {
            $merchants = $this->merchantRepository->getMerchants($request);

            return response()->json($merchants, 200);
        } else if ($this->role == 'user' ) {
            $merchants = $this->merchantRepository->getMerchantsByUserId($this->userId, $request);

            return response()->json($merchants, 200);
        } else {
            $merchants = $this->merchantRepository->getMerchants($request);

            return response()->json($merchants, 200);
        }
    }

    /**
     * Returns merchant.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/merchants/{id}",
     *     description="Returns merchant.",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *     @SWG\Parameter(
     *         description="Merchant id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns merchant."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Merchant not found."
     *     )
     * )
     */
    public function show($id, Request $request)
    {
        if ($this->role == 'user') {
            try {
                $merchant = $this->merchantRepository->getById($id, $this->userId);
                $merchant->total_subscribers = PushNotificationSubscriber::where('merchant_id', $merchant->id)->count();
            } catch (MerchantNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }

            return response()->json($merchant, 200);
        } else if ($this->role == 'sc-user') {
            try {
                $merchant = $this->merchantRepository->getById($id, $this->userId, true, true);
                $merchant->total_subscribers = PushNotificationSubscriber::where('merchant_id', $merchant->id)->count();
            } catch (MerchantNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }

            return response()->json($merchant, 200);
        } else {
            try {
                $merchant = $this->merchantRepository->getById($id);
            } catch (MerchantNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
            $coupons = $this->couponRepository->getCouponsByMerchantId($id);

            if ($merchant->shopping_center_id && (!$merchant->shopping_center_name)) {
                $shoppingCenter = $this->shoppingCenterRepository->getById($merchant->shopping_center_id);
                $merchant->shopping_center_name = $shoppingCenter->name;
            }

            /*$data = [];
            $data['merchant'] = $merchant;
            $data['shopping_center'] = $shoppingCenter;
            $data['coupons'] = $coupons;*/

            $merchant->subscribe = 0;
            if ($request->unique_id) {
                $subscribe = PushNotificationSubscriber::where('merchant_id', $id)->where('unique_id', $request->unique_id)->first();
                if ($subscribe) {
                    $merchant->subscribe = 1;
                }
            }
            $merchant->coupons = count($coupons);

            if ($this->role == 'admin') {
                $merchant->total_subscribers = PushNotificationSubscriber::where('merchant_id', $merchant->id)->count();
            }

            return  response()->json($merchant, 200);
        }
    }

    /**
     * Returns count of merchants.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/merchants/count",
     *     description="Returns count of merchants.",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *     @SWG\Response(
     *         response=200,
     *         description="Returns count of merchants."
     *     )
     * )
     */
    public function count()
    {
        if ($this->role == 'admin' || $this->role == 'user' || $this->role == 'sc-user') {
            return response()->json($this->merchantRepository->count(), 200);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }

    /**
     * Creates merchant.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/merchants",
     *     description="Creates merchant.",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *      @SWG\Parameter(
     *         description="Merchant name",
     *         in="formData",
     *         name="name",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Area id",
     *         in="formData",
     *         name="area_id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="User id (required if role isn't user)",
     *         in="formData",
     *         name="user_id",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Shopping center id",
     *         in="formData",
     *         name="shopping_center_id",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Shopping center name (required without shopping center id)",
     *         in="formData",
     *         name="shopping_center_name",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="City name (required without shopping center id)",
     *         in="formData",
     *         name="city",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Address (required without shopping center id)",
     *         in="formData",
     *         name="address",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Zip code (required without shopping center id)",
     *         in="formData",
     *         name="zip",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Phone number",
     *         in="formData",
     *         name="phone",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Website url",
     *         in="formData",
     *         name="website",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Array of merchant category ids.",
     *         in="formData",
     *         name="categories[]",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Merchant suite number.",
     *         in="formData",
     *         name="suite_number",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Longitude.",
     *         in="formData",
     *         name="lon",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Latitude.",
     *         in="formData",
     *         name="lat",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Merchant Description.",
     *         in="formData",
     *         name="description",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns new merchant."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function store(MerchantRequest $merchantRequest, Mailer $mailer, NotificationsSendEmail $notificationsSendEmail, FirebasePushNotifications $firebasePushNotifications)
    {
        //If merchant is assigned to shopping center add lat and lon same as lat and lon for shopping center
        //If don't assigned find it by merchant zip code
        if ($merchantRequest->input('lat') && $merchantRequest->input('lon')) {
            $lat = $merchantRequest->input('lat');
            $lon = $merchantRequest->input('lon');

            $shoppingCenterId = 0;
        } else if ($merchantRequest->input('shopping_center_id')) {
            $shoppingCenter = $this->shoppingCenterRepository->getById($merchantRequest->input('shopping_center_id'));

            $lat = $shoppingCenter->lat;
            $lon = $shoppingCenter->lon;
            $shoppingCenterId = $shoppingCenter->id;
        } else {
            $responseData = Geocode::make()->address($merchantRequest->input('zip'));

            if ($responseData) {
                $lat = $responseData->latitude();
                $lon = $responseData->longitude();
            } else {
                $lat = 0;
                $lon = 0;
            }
 
            $shoppingCenter = new ShoppingCenter();
            $shoppingCenter->name = $merchantRequest->input('shopping_center_name');
            $shoppingCenter->area_id = $merchantRequest->input('area_id');
            $shoppingCenter->zip = $merchantRequest->input('zip');
            $shoppingCenter->lat = $lat;
            $shoppingCenter->lon = $lon;
            $shoppingCenter = $this->shoppingCenterRepository->store($shoppingCenter);

            $shoppingCenterId = $shoppingCenter->id;
        }

        if ($this->role == 'user') {
            $merchant = $this->merchantRepository->store($merchantRequest, $shoppingCenterId, $lat, $lon, $this->userId);
        } else {
            $merchant = $this->merchantRepository->store($merchantRequest, $shoppingCenterId, $lat, $lon, $merchantRequest->input('user_id'));
        }

        if ($merchantRequest->input('shopping_center_id')) {
            $merchant->shopping_center_id = $merchantRequest->input('shopping_center_id');
            $merchant->update();
        }

        $data = [
            'template' => 'notifications',
            'subject' => 'New merchant.',
            'merchant' => $merchant
        ];

        $notificationsSendEmail->sendEmail($mailer, $data);

        $body = str_replace('{merchant_name}', $merchant->name, $merchantRequest->input('notification_body'));
        $title = str_replace('{merchant_name}', $merchant->name, $merchantRequest->input('notification_title'));

        $firebasePushNotifications->sendNotificationToTopic(sprintf('merchant-%s', $merchant->id), $title, $body, ['action' => 'new_merchant', 'action_id' => $merchant->id]);

        return response()->json($merchant, 200);
    }

    /**
     * Updates merchant.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/merchants/{id}",
     *     description="Updates merchant.",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *     @SWG\Parameter(
     *         description="Merchant id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Merchant name",
     *         in="formData",
     *         name="name",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Area id",
     *         in="formData",
     *         name="area_id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="User id(requiered if role is user)",
     *         in="formData",
     *         name="user_id",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Shopping center id",
     *         in="formData",
     *         name="shopping_center_id",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Shopping center name (required without shopping center id)",
     *         in="formData",
     *         name="shopping_center_name",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="City name (required without shopping center id)",
     *         in="formData",
     *         name="city",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Address (required without shopping center id)",
     *         in="formData",
     *         name="address",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Zip code (required without shopping center id)",
     *         in="formData",
     *         name="zip",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Phone number",
     *         in="formData",
     *         name="phone",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Website url",
     *         in="formData",
     *         name="website",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Merchant has been successfully updated."
     *     ),
     *     @SWG\Parameter(
     *         description="Array of merchant category ids.",
     *         in="formData",
     *         name="categories[]",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Merchant suite number.",
     *         in="formData",
     *         name="suite_number",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Longitude.",
     *         in="formData",
     *         name="lon",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Latitude.",
     *         in="formData",
     *         name="lat",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Merchant Description.",
     *         in="formData",
     *         name="description",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Merchant not found."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function update(MerchantRequest $merchantRequest, $id)
    {
        if ($this->role == 'admin' || $this->role == 'user' || $this->role == 'sc-user') {
            //admin
            try {
                //if ($this->role == 'admin') {
                    $merchant = $this->merchantRepository->getById($id, null, false);
                /*} else if ($this->role == 'user') {
                    $merchant = $this->merchantRepository->getById($id, $this->userId, false);
                } else if ($this->role == 'sc-user') {
                    $merchant = $this->merchantRepository->getById($id, $this->userId, false, true);
                }*/
            } catch (MerchantNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
            if ($merchantRequest->input('shopping_center_id') && $merchantRequest->input('shopping_center_id') > 0) {
                $shopping_center = $this->shoppingCenterRepository->getById($merchantRequest->input('shopping_center_id'));

                $lat = $shopping_center->lat;
                $lon = $shopping_center->lon;
            } else {
                $lat = $merchantRequest->lat;
                $lon = $merchantRequest->lon;
            }

            $merchant = $this->merchantRepository->update($merchant, $merchantRequest);

            $categories = MerchantCategory::where('merchant_categories.merchant_id', $merchant->id)
                ->join('categories', 'categories.id', '=', 'merchant_categories.category_id')
                ->select('categories.id', 'categories.name', 'categories.logo')
                ->get();
            $merchant->categories = $categories;

            return response()->json($merchant, 200);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }


    }

    /**
     * Removes merchant.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Delete(
     *     path="/merchants/{id}",
     *     description="Deletes merchant.",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *      @SWG\Parameter(
     *          description="Merchant id",
     *          in="path",
     *          name="id",
     *          required=true,
     *          type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Merchant has been successfully deleted."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Merchant not found."
     *     )
     * )
     */
    public function destroy($id)
    {
        try {
            if ($this->role == 'admin') {
                $this->merchantRepository->delete($id);
            } else if ($this->role == 'sc-user') {
                $this->merchantRepository->delete($id, $this->userId, true);
            } else if ($this->role == 'user') {
                $this->merchantRepository->delete($id, $this->userId);
            } else {
                return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
            }
        } catch (MerchantNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return response()->json('Merchant has been successfully deleted.', 200);
    }

    /**
     * Returns all unapproved merchants.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/merchants/unapproved",
     *     description="Returns all unapproved merchants.",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *      @SWG\Parameter(
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
     *         description="Column name for sort. (- before name for desc)",
     *         in="query",
     *         name="sort_by",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Search by merchant name.",
     *         in="query",
     *         name="search",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns all unapproved merchants."
     *     )
     * )
     */
    public function unapprovedMerchants(Request $request)
    {
        if ($this->role == 'admin') {
            $unapprovedMerchants = $this->merchantRepository->getUnapprovedMerchants($request);

            return response()->json($unapprovedMerchants, 200);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }

    /**
     * Approve merchants.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/merchants/{id}/approve",
     *     description="Approve merchant.",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *     @SWG\Parameter(
     *         description="Merchant id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns merchant."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Merchant not found."
     *     )
     * )
     */
    public function approveMerchant($id)
    {
        if ($this->role == 'admin') {
            try {
                $merchant = $this->merchantRepository->getById($id, null, false);

                $merchant->approved = true;

                $merchant->update();

                return response()->json($merchant, 200);
            } catch (MerchantNotFoundException $exception) {
                return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }

    /**
     * Disapproved merchants.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/merchants/{id}/disapprove",
     *     description="Disapproved merchant.",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *     @SWG\Parameter(
     *         description="Merchant id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns success message."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Merchant not found."
     *     )
     * )
     */
    public function disapproveMerchant($id)
    {
        if ($this->role == 'admin') {
            try {
                $merchant = $this->merchantRepository->getById($id);

                $this->merchantRepository->delete($merchant->id);

                return response()->json('Merchant successfully disapproved.', 200);
            } catch (MerchantNotFoundException $exception) {
                return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }

    /**
     * Returns count of unapproved merchants.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/merchants/unapproved-count",
     *     description="Returns count of unapproved merchants.",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *     @SWG\Response(
     *         response=200,
     *         description="Returns count of unapproved merchants."
     *     )
     * )
     */
    public function unapprovedMerchantsCount(Request $request)
    {
        if ($this->role == 'admin') {
            $unapprovedMerchantsCount = $this->merchantRepository->getUnapprovedMerchants($request, true);

            return response()->json($unapprovedMerchantsCount, 200);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }

    /**
     * Upload logo.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/merchants/{id}/upload-file",
     *     description="Deletes merchant logo.",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *      @SWG\Parameter(
     *          description="Merchant id",
     *          in="path",
     *          name="id",
     *          required=true,
     *          type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Logo",
     *         in="formData",
     *         name="logo",
     *         required=true,
     *         type="file",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Logo has been successfully uploaded."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Merchant not found."
     *     )
     * )
     */
    public function uploadFile($id, LogoRequest $logoRequest)
    {
        if ($this->role == 'admin' || $this->role == 'user' || $this->role == 'sc-user') {
            try {
                if ($this->role == 'admin') {
                    $merchant = $this->merchantRepository->getById($id, null, false);
                } else if ($this->role == 'sc-user') {
                    $merchant = $this->merchantRepository->getById($id, $this->userId, false, true);
                } else {
                    $merchant = $this->merchantRepository->getById($id, $this->userId, false);
                }
                $merchant = $this->merchantRepository->uploadLogo($logoRequest, $merchant);

                return response()->json($merchant, 200);
            } catch (MerchantNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

    }

    /**
     * Removes logo.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Delete(
     *     path="/merchants/{id}/remove-file",
     *     description="Deletes merchant logo.",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *      @SWG\Parameter(
     *          description="Merchant id",
     *          in="path",
     *          name="id",
     *          required=true,
     *          type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Logo has been successfully deleted."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Merchant not found."
     *     )
     * )
     */
    public function removeFile($id)
    {
        if ($this->role == 'admin' || $this->role == 'user' || $this->role == 'sc-user') {
            try {
                if ($this->role == 'admin') {
                    $merchant = $this->merchantRepository->getById($id, null, false);
                } else if ($this->role == 'sc-user') {
                    $merchant = $this->merchantRepository->getById($id, $this->userId, false, true);
                } else {
                    $merchant = $this->merchantRepository->getById($id, $this->userId, false);
                }
                $this->merchantRepository->removeLogo($merchant);

                return response()->json('Logo has been successfully deleted.', 200);
            } catch (MerchantNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }

    /**
     * Returns merchants count in area.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/merchants/area/count",
     *     description="Returns merchants count in area.",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *     @SWG\Parameter(
     *         description="Latitude",
     *         in="query",
     *         name="lat",
     *         required=true,
     *         type="number",
     *     ),
     *     @SWG\Parameter(
     *         description="Longitude",
     *         in="query",
     *         name="lon",
     *         required=true,
     *         type="number",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns merchants count in area."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function searchMerchantsCount(LatLonRequest $latLonRequest)
    {
        $data = Geocode::make()->latLng($latLonRequest->input('lat'),$latLonRequest->input('lon'));

        if ($data) {
            $areas = [];
            foreach ($data->raw()->address_components as $addressComponent) {
                $areas[] = $addressComponent->long_name;
            }

            $merchantsCount = $this->merchantRepository->getMerchantsCountByAreaName($areas);

            $response = $merchantsCount;

        } else {
            $response = 0;
        }

        return response()->json($response);
    }

    /**
     * Display coupons of requested merchant.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/merchants/{id}/coupons",
     *     description="Returns coupons.",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *     @SWG\Parameter(
     *         description="Merchant id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Sort by",
     *         in="query",
     *         name="sort_by",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns coupons."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Merchant not found."
     *     )
     * )
     */
    public function searchCouponsByMerchants($id, Request $request)
    {
        try {
            $this->merchantRepository->getById($id);
        } catch (MerchantNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        $coupons = $this->couponRepository->getActiveCouponsByMerchantId($id, $request);

        return response()->json($coupons, 200);
    }

    /**
     * Display merchants in requested shopping center.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/shopping-centers/{id}/merchants",
     *     description="Displays all merchants in requested shopping center.
     *                  If filters parameter is supplied, the function returns only merchants that have requested categories.
     *                  If lat and lon parameters are supllied, the function calculates distance and sorts the response.",
     *     produces={"application/json"},
     *     tags={"shopping centers"},
     *     @SWG\Parameter(
     *         description="Shopping center id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Array of category ids.",
     *         in="query",
     *         name="filters[]",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Latitude",
     *         in="query",
     *         name="lat",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Longitude",
     *         in="query",
     *         name="lon",
     *         required=false,
     *         type="integer",
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
     *         description="Column name for sort. (- before name for desc)",
     *         in="query",
     *         name="sort_by",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns merchant."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Shopping center not found."
     *     )
     * )
     */
    public function searchMerchantsByShoppingCenters($id, Request $request)
    {
        try {
             $this->shoppingCenterRepository->getById($id);
        } catch (ShoppingCenterNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Shopping center not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        $input = $request->all();

        if (!empty($input['filters'])) {
            $filters = $input['filters'];
        } else {
            $filters = null;
        }

        if (!empty($input['lat']) && !empty($input['lon'])) {
            $lat = $input['lat'];
            $lon = $input['lon'];
        } else {
            $lat = null;
            $lon = null;
        }

        $merchants = $this->merchantRepository->getMerchantsByShoppingCenterId($id, $filters, $lat, $lon, $request);

        return response()->json($merchants, 200);
    }

    /**
     * Returns address for specific zip code.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/merchants/get-address/{zip}",
     *     description="Returns address for specific zip code.",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *     @SWG\Parameter(
     *         description="Zip code",
     *         in="path",
     *         name="zip",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns address for specific zip code."
     *     )
     * )
     */
    public function searchAddressByZipCode($zip)
    {
        try {
            $data = Geocode::make()->address($zip);

            if ($data) {
                $result['lat'] = $data->latitude();
                $result['lon'] = $data->longitude();
                $result['city'] = explode(',', $data->formattedAddress())[0];
                $result['address'] = explode(',', $data->formattedAddress())[1];
            } else {
                return response()->json(['status' => 400, 'message' => 'Address not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } catch (Exception $e) {
            return response()->json(['status' => 400, 'message' => 'Address not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return response()->json($result, 200);
    }

    /**
     * Returns address for specific zip code.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/merchants/{id}/subscribe",
     *     description="Subscribe to merchant for notifications",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *     @SWG\Parameter(
     *         description="Merchant id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Unique id",
     *         in="query",
     *         name="unique_id",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Subscribe successfully."
     *     )
     * )
     */
    public function subscribe($id, Request $request) {
        try {
            $this->merchantRepository->getById($id, null, false);

            $subscribe = PushNotificationSubscriber::where('merchant_id', $id)->where('unique_id', $request->unique_id)->first();

            if (!$subscribe) {
                $subscribe = new PushNotificationSubscriber();
                $subscribe->merchant_id = $id;
                $subscribe->unique_id = $request->unique_id;
                $subscribe->save();
            }

            return response()->json('User has been successfully subscribed.', 200);
        } catch (MerchantNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }
    }

    /**
     * Returns address for specific zip code.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/merchants/{id}/unsubscribe",
     *     description="Unsubscribe from merchant for notifications",
     *     produces={"application/json"},
     *     tags={"merchants"},
     *     @SWG\Parameter(
     *         description="Merchant id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Unique id",
     *         in="query",
     *         name="unique_id",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Unsubscribe successfully."
     *     )
     * )
     */
    public function unsubscribe($id, Request $request) {
        try {
            $this->merchantRepository->getById($id, null, false);

            $subscribe = PushNotificationSubscriber::where('merchant_id', $id)->where('unique_id', $request->unique_id)->first();
            $subscribe->delete();

            return response()->json('User has been successfully unsubscribed.', 200);
        } catch (MerchantNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }
    }
}
