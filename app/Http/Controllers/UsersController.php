<?php

namespace App\Http\Controllers;

use App\Contracts\Repositories\AreaRepository;
use App\Contracts\Repositories\CouponRepository;
use App\Contracts\Repositories\MerchantRepository;
use App\Contracts\Repositories\ShoppingCenterRepository;
use App\Contracts\Repositories\UserRepository;
use App\Exceptions\Repositories\MerchantNotFoundException;
use App\Exceptions\Repositories\UserNotFoundException;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\CheckTokenRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UserRequest;
use App\Models\Merchant;
use App\Models\MerchantUser;
use App\Models\PasswordReset;
use App\Models\ShoppingCenter;
use App\Models\ShoppingCenterUser;
use App\Models\User;
use App\Utilities\FirebasePushNotifications;
use App\Utilities\PasswordResetGenerator;
use App\Utilities\PasswordResetSendEmail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Mail\Mailer;
use Illuminate\Support\Facades\Hash;
use \Firebase\JWT\JWT;
use Log;

class UsersController extends ApiController
{
    private $userRepository;
    private $userId;
    private $role;

    public function __construct(UserRepository $userRepository, Request $request)
    {
        $this->userRepository = $userRepository;

        $this->role = '';
        try {
            $key = config('app.JWT_key');

            $token = $request->header('Authorization');

            $decoded = (array) JWT::decode($token, $key, array('HS256'));

            $user = $userRepository->getByEmail($decoded['email']);

            $this->userId = $user->id;
            $this->role = $decoded['role'];
        } catch (\Exception $exception) {
            $this->userId = 0;
        }
    }

    /**
     * Display a listing of the users.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/users",
     *     description="Returns all users.",
     *     produces={"application/json"},
     *     tags={"users"},
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
     *         description="Search by user name.",
     *         in="query",
     *         name="search",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="User type.",
     *         in="query",
     *         name="type",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns all users."
     *     )
     * )
     */
    public function index(Request $request)
    {
        if ($this->role != 'admin' && $this->role != 'sc-user') {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
        $users = $this->userRepository->getAllUsers($request);

        return response()->json($users, 200);
    }

    /**
     * Update user details.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/users/{id}",
     *     description="Update user details.",
     *     produces={"application/json"},
     *     tags={"users"},
     *      @SWG\Parameter(
     *         description="User id (if role not admin id must be same with logged user)",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer"
     *     ),
     *      @SWG\Parameter(
     *         description="First name",
     *         in="formData",
     *         name="first_name",
     *         required=true,
     *         type="string",
     *     ),
     *      @SWG\Parameter(
     *         description="Last name",
     *         in="formData",
     *         name="last_name",
     *         required=true,
     *         type="string"
     *     ),
     *      @SWG\Parameter(
     *         description="Type (Allowed only if user have admin permissions)",
     *         in="formData",
     *         name="type",
     *         required=true,
     *         type="integer"
     *     ),
     *      @SWG\Parameter(
     *         description="Notifications (Allowed only if user have admin permissions)",
     *         in="formData",
     *         name="notifications",
     *         required=false,
     *         type="integer"
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns user."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="User not found."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function updateUserDetails($id, UserRequest $userRequest)
    {
        if ($this->role == 'admin' || $this->role == 'sc-user') {
            try {
                $user = $this->userRepository->getById($id);
                if ($userRequest->input('type')) {
                    $user->type = $userRequest->input('type');
                }
                if ($userRequest->input('notifications')) {
                    $user->notifications = $userRequest->input('notifications');
                }
            } catch (UserNotFoundException $exception) {
                return response()->json(['status' => 400, 'message' => 'User not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else if (($this->role == 'user') && $id == $this->userId) {
            try {
                $user = $this->userRepository->getById($this->userId);
            } catch (UserNotFoundException $exception) {
                return response()->json(['status' => 400, 'message' => 'User not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
        
        if ($userRequest->input('type') == 1 && $userRequest->input('merchant_id')) {
            
            $merchant_id = $userRequest->input('merchant_id');
            $merchantUser = MerchantUser::where('user_id', $id)->update(['merchant_id' => $merchant_id]);   
        }

        $user->first_name = $userRequest->input('first_name');
        $user->last_name = $userRequest->input('last_name');
       
        $this->userRepository->update($user);

        return response()->json($user, 200);
    }

    /**
     * Change password.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/users/{id}/change-password",
     *     description="Change password.",
     *     produces={"application/json"},
     *     tags={"users"},
     *      @SWG\Parameter(
     *         description="User id (if role not admin id must be same with logged user)",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer"
     *     ),
     *      @SWG\Parameter(
     *         description="Old password(current) - required if change your password or if role is not admin",
     *         in="formData",
     *         name="old_password",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="New password",
     *         in="formData",
     *         name="password",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="New password confirmation",
     *         in="formData",
     *         name="password_confirmation",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns user."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     ),
     *     @SWG\Response(
     *         response=403,
     *         description="Old password is wrong."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="User not found."
     *     )
     * )
     */
    public function changePassword($id, ChangePasswordRequest $changePasswordRequest)
    {
        if ($this->role == 'admin' || $this->role == 'sc-user') {
            try {
                $user = $this->userRepository->getById($id);

                $userData = $this->userRepository->getById($this->userId);

                if (Hash::check($changePasswordRequest->input('old_password'), $user->password) || $id != $userData->id) {
                    $user->password = bcrypt($changePasswordRequest->input('password'));

                    $this->userRepository->update($user);
                } else {
                    return response()->json(['status' => 403, 'message' => 'Old password is wrong.', 'timestamp' => Carbon::now()->toDateTimeString()], 403);
                }
            } catch (UserNotFoundException $exception) {
                return response()->json(['status' => 400, 'message' => 'User not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else if (($this->role == 'user' || $this->role == 'sc-user') && $id == $this->userId) {
            try {
                $user = $this->userRepository->getById($this->userId);

                if (Hash::check($changePasswordRequest->input('old_password'), $user->password)) {
                    $user->password = bcrypt($changePasswordRequest->input('password'));

                    $this->userRepository->update($user);
                } else {
                    return response()->json(['status' => 400, 'message' => 'Old password is wrong.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
                }
            } catch (UserNotFoundException $exception) {
                return response()->json(['status' => 400, 'message' => 'User not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

        return response()->json($user, 200);
    }

    /**
     * Create new user.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/users",
     *     description="Create new user.",
     *     produces={"application/json"},
     *     tags={"users"},
     *     @SWG\Parameter(
     *         description="First name",
     *         in="formData",
     *         name="first_name",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Last name",
     *         in="formData",
     *         name="last_name",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="User email, must be valid email address.",
     *         in="formData",
     *         name="email",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Password",
     *         in="formData",
     *         name="password",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Password confirmation",
     *         in="formData",
     *         name="password_confirmation",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Type (1 for user 2 for shopping center user - default value is for user)",
     *         in="formData",
     *         name="type",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Merchant id",
     *         in="formData",
     *         name="merchant_id",
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
     *     @SWG\Response(
     *         response=200,
     *         description="Returns new user."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function createNewUser(RegisterRequest $registerRequest, PasswordResetGenerator $passwordResetGenerator, PasswordResetSendEmail $passwordResetSendEmail, Mailer $mailer)
    {
        if ($this->role != 'admin' && $this->role != 'sc-user') {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
        $user = new User();

        $user = $this->userRepository->assignCommonValues($user, $registerRequest);

        $this->userRepository->store($user);

        if ($registerRequest->input('type') == 1 && $registerRequest->input('merchant_id')) {
            $merchantUser = new MerchantUser();
            $merchantUser->user_id = $user->id;
            $merchantUser->merchant_id = $registerRequest->input('merchant_id');

            $merchantUser->save();
        }

        if ($registerRequest->input('type') == 2 && $registerRequest->input('shopping_center_id')) {
            $merchantUser = new ShoppingCenterUser();
            $merchantUser->user_id = $user->id;
            $merchantUser->shopping_center_id = $registerRequest->input('shopping_center_id');

            $merchantUser->save();
        }

        $token = $passwordResetGenerator->generatePasswordResetToken($registerRequest->input('email'));

        $data = [
            'template' => 'set-password',
            'subject' => 'Admin make new account for you.'
        ];

        $passwordResetSendEmail->sendEmail($token, $mailer, $user, $data);

        return response()->json($user, 200);
    }

    /**
     * Activate user.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/users/{id}/activate",
     *     description="Create new user.",
     *     produces={"application/json"},
     *     tags={"users"},
     *     @SWG\Parameter(
     *         description="User id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns user."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="User not found."
     *     )
     * )
     */
    public function activate($id)
    {
        if ($this->role != 'admin' && $this->role != 'sc-user') {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

        try {
            $user = $this->userRepository->getById($id);
        } catch (UserNotFoundException $exception) {
            return response()->json(['status' => 400, 'message' => 'User not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        $user->active = true;

        $this->userRepository->store($user);

        $shoppingCenters = ShoppingCenter::join('shopping_center_users', 'shopping_center_users.shopping_center_id', '=', 'shopping_centers.id')->where('shopping_center_users.user_id', '=', $id)->get();
        foreach ($shoppingCenters as $shoppingCenter) {
            $shoppingCenter->approved = true;
            $shoppingCenter->update();
        }
        $merchants = Merchant::join('merchant_users', 'merchant_users.merchant_id', '=', 'merchants.id')->where('merchant_users.user_id', '=', $id)->selectRaw('merchants.*')->get();
        foreach ($merchants as $merchant) {
            $merchant->approved = true;
            $merchant->update();
        }

        return response()->json($user, 200);
    }

    /**
     * Deactivate user.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/users/{id}/deactivate",
     *     description="Create new user.",
     *     produces={"application/json"},
     *     tags={"users"},
     *     @SWG\Parameter(
     *         description="User id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns user."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="User not found."
     *     )
     * )
     */
    public function deactivate($id)
    {
        if ($this->role != 'admin' && $this->role != 'sc-user') {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

        try {
            $user = $this->userRepository->getById($id);
        } catch (UserNotFoundException $exception) {
            return response()->json(['status' => 400, 'message' => 'User not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        $user->active = false;

        $this->userRepository->store($user);

        return response()->json($user, 200);
    }

    /**
     * Display count.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/users/get-info",
     *     description="Returns coupons.",
     *     produces={"application/json"},
     *     tags={"users"},
     *     @SWG\Response(
     *         response=200,
     *         description="Returns count."
     *     )
     * )
     */
    public function getInfo(Request $request, MerchantRepository $merchantRepository, CouponRepository $couponRepository, ShoppingCenterRepository $shoppingCenterRepository)
    {
        $data = [];
        if ($this->role == 'admin' || $this->role == 'sc-user') {
            $data['newMerchants'] = $merchantRepository->newMerchants();
            $data['newShoppingCenters'] = $shoppingCenterRepository->newShoppingCenters();
            $data['activeCoupons'] = $couponRepository->count(null, true, null);
        } else if ($this->role == 'user') {
            $data['activeCoupons'] = $couponRepository->count($this->userId, true, null);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

        return response()->json($data, 200);
    }

     public function typeInfo(Request $request)
    {
        if($merchant = $this->userRepository->getTypeInfo($request->id)) {
            return response()->json($merchant, 200);
        
        } else {
             return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        };

        
    }

    /**
     * Removes user.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Delete(
     *     path="/users/{id}",
     *     description="Deletes user.",
     *     produces={"application/json"},
     *     tags={"users"},
     *      @SWG\Parameter(
     *          description="User id",
     *          in="path",
     *          name="id",
     *          required=true,
     *          type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="User has been successfully deleted."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="User not found."
     *     )
     * )
     */
    public function destroy($id, ShoppingCenterRepository $shoppingCenterRepository, MerchantRepository $merchantRepository)
    {
        try {
            if ($this->role == 'admin' || $this->role == 'sc-user') {
                $user = $this->userRepository->getById($id);

                $shoppingCenterRepository->removeUser($user->id);

                MerchantUser::where('user_id', $user->id)->delete();
                //$merchantRepository->deleteMerchants($user->id);

                $user->delete();
            } else {
                return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
            }
        } catch (UserNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'User not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return response()->json('User has been successfully deleted.', 200);
    }

    /**
     * Confirm email.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/users/confirm/email",
     *     description="Confirm email.",
     *     produces={"application/json"},
     *     tags={"users"},
     *      @SWG\Parameter(
     *         description="Token",
     *         in="formData",
     *         name="token",
     *         required=true,
     *         type="string",
     *     ),
     *      @SWG\Parameter(
     *         description="Data (this is encrypted email, you receive it when user click on link in email).",
     *         in="formData",
     *         name="data",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns user."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="User not found."
     *     ),
     *     @SWG\Response(
     *         response=403,
     *         description="Token is expired or wrong."
     *     )
     * )
     */
    public function confirm(Request $request, UserRepository $userRepository)
    {
        //decrypt email address
        $email = decrypt($request->data);

        $passwordReset = PasswordReset::where('token', '=', $request->token)
            ->where('email', $email)->first();

        if ($passwordReset) {
            $user = $userRepository->getByEmail($email);

            if ($user) {
                if (!$user->active) {
                    $user->active = true;
                }

                $user->attempts = 3;
                $user->locked = 0;
                $user->locked_down_time = null;

                $userRepository->store($user);

                PasswordReset::where('email', $email)->delete();

                ShoppingCenter::where('user_id', '=', $user->id)->update(['approved' => true]);
                Merchant::where('user_id', '=', $user->id)->update(['approved' => true]);

                return response()->json($user);
            } else {
                return response()->json(['status' => 400, 'message' => 'User not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else {
            return response()->json(['status' => 400, 'message' => 'Token is expired or wrong.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }
    }

    /**
     * Enabled notifications.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/users/notifications/enable",
     *     description="Enabled notifications.",
     *     produces={"application/json"},
     *     tags={"users"},
     *     @SWG\Response(
     *         response=200,
     *         description="Enabled notifications."
     *     )
     * )
     */
    public function enableNotifications()
    {
        try {
            if ($this->role == 'admin' && $this->role != 'sc-user') {
                $user = $this->userRepository->getById($this->userId);

                $user->notifications = true;

                $this->userRepository->store($user);
            } else {
                return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
            }
        } catch (UserNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'User not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return response()->json('Notifications has been successfully enabled.', 200);
    }

    /**
     * Disabled notifications.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/users/notifications/disable",
     *     description="Disabled notifications.",
     *     produces={"application/json"},
     *     tags={"users"},
     *     @SWG\Response(
     *         response=200,
     *         description="Disabled notifications."
     *     )
     * )
     */
    public function disableNotifications()
    {
        try {
            if ($this->role == 'admin' && $this->role != 'sc-user') {
                $user = $this->userRepository->getById($this->userId);

                $user->notifications = false;

                $this->userRepository->store($user);
            } else {
                return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
            }
        } catch (UserNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'User not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return response()->json('Notifications has been successfully disabled.', 200);
    }

    /**
     * Check token.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/users/check-token",
     *     description="Check token.",
     *     produces={"application/json"},
     *     tags={"users"},
     *      @SWG\Parameter(
     *         description="Token",
     *         in="formData",
     *         name="token",
     *         required=true,
     *         type="string",
     *     ),
     *      @SWG\Parameter(
     *         description="Data (this is encrypted email, you receive it when user click on link in email).",
     *         in="formData",
     *         name="data",
     *         required=true,
     *         type="string",
     *     ),
     *      @SWG\Parameter(
     *         description="Type (1 - reset password, 2 - confirm email).",
     *         in="formData",
     *         name="type",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns status."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="User not found."
     *     )
     * )
     */
    public function checkToken(CheckTokenRequest $checkTokenRequest)
    {
        //decrypt email address
        $email = decrypt($checkTokenRequest->data);

        $passwordReset = PasswordReset::where('token', '=', $checkTokenRequest->token)
            ->where('email', $email)->first();

        if ($passwordReset) {
            $user = $this->userRepository->getByEmail($email);

            if ($user) {
                return response()->json(true);
            } else {
                return response()->json(false);
            }
        } else {
            return response()->json(false);
        }
    }

    /**
     * Returns user.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/users/me",
     *     description="Returns user.",
     *     produces={"application/json"},
     *     tags={"users"},
     *     @SWG\Response(
     *         response=200,
     *         description="Returns user."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="User not found."
     *     )
     * )
     */
    public function me()
    {
        try {
            if ($this->role == 'admin' || $this->role == 'sc-user' || $this->role == 'user') {
                $user = $this->userRepository->getById($this->userId);

                $merchantUser = MerchantUser::where('user_id', '=', $user->id)->first();

                if ($merchantUser) {
                    $user->merchant_id = $merchantUser->merchant_id;
                } else {
                    $user->merchant_id = null;
                }
            } else {
                return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
            }
        } catch (UserNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'User not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return response()->json($user, 200);
    }

    public function trackIndexPage(Request $request)
    {
	Log::error('requests', [
            'ip' => $request->ip(),
	    'user_agent' => $request->header('User-Agent')
        ]);
    }

    public function sendNotification(Request $request, FirebasePushNotifications $firebasePushNotifications, MerchantRepository $merchantRepository) {
        if ($request->input('topic') == 'admin') {
            if ($this->role == 'admin' || $this->role == 'sc-user') {
                $data = ['action' => $request->input('action') ? $request->input('action') : 'admin',
                    'action_id' => $request->input('action_id') ? $request->input('action_id') : 0];
                $body = $request->input('notification_body');
                $title = $request->input('notification_title');
                $firebasePushNotifications->sendNotificationToTopic('admin', $title, $body, $data);

                return response()->json('Successfully', 200);
            } else {
                return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
            }
        } else if ($request->input('merchant_id')) {
            if ($this->role == 'admin' || $this->role == 'user' || $this->role == 'sc-user') {
                $id = $request->input('merchant_id');

                try {
                    $merchant = $merchantRepository->getById($id, null, false);
                } catch (MerchantNotFoundException $e) {
                    return response()->json(['status' => 400, 'message' => 'Merchant not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
                }
                $data = ['action' => $request->input('action') ? $request->input('action') : 'merchant',
                    'action_id' => $id];
                $body = str_replace('{merchant_name}', $merchant->name, $request->input('notification_body'));
                $title = str_replace('{merchant_name}', $merchant->name, $request->input('notification_title'));

                $firebasePushNotifications->sendNotificationToTopic(sprintf('merchant-%s', $id), $title, $body, $data);

                return response()->json('Successfully', 200);
            } else {
                return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
            }
        }
    }
}
