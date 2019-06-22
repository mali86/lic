<?php

namespace App\Http\Controllers\Auth;

use App\Contracts\Repositories\UserRepository;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Utilities\ConfirmEmailSendEmail;
use App\Utilities\NotificationsSendEmail;
use App\Utilities\PasswordResetGenerator;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\RegistersUsers;
use Illuminate\Http\Request;
use Illuminate\Mail\Mailer;

class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;

    /**
     * Where to redirect users after login / registration.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(UserRepository $userRepository)
    {
        parent::__construct($userRepository);
        $this->middleware('guest');
    }

    /**
     * Register new user.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/register",
     *     description="Returns coupons.",
     *     produces={"application/json"},
     *     tags={"auth"},
     *     @SWG\Parameter(
     *         description="First name",
     *         in="formData",
     *         name="first_name",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Last name",
     *         in="formData",
     *         name="last_name",
     *         required=false,
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
    public function register(RegisterRequest $registerRequest, PasswordResetGenerator $passwordResetGenerator, NotificationsSendEmail $notificationsSendEmail, ConfirmEmailSendEmail $confirmEmailSendEmail, Mailer $mailer)
    {
        $user = new User();

        $user = $this->userRepository->assignCommonValues($user, $registerRequest);

        $user->active = false;

        $this->userRepository->store($user);

        $token = $passwordResetGenerator->generatePasswordResetToken($user->email, 2);

        $data = [
            'template' => 'confirm-email',
            'subject' => 'Confirm email address.'
        ];

        $confirmEmailSendEmail->sendEmail($token, $mailer, $user, $data);

        $data = [
            'template' => 'notifications',
            'subject' => 'New user.',
            'user' => $user
        ];

        $notificationsSendEmail->sendEmail($mailer, $data);

        return response()->json($user);
    }

    /**
     * Check email.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/check-email",
     *     description="Check email.",
     *     produces={"application/json"},
     *     tags={"auth"},
     *     @SWG\Parameter(
     *         description="email.",
     *         in="query",
     *         name="email",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Email is available."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Email already exists."
     *     )
     * )
     */
    public function checkEmail(Request $request)
    {
        $user = $this->userRepository->getByEmail($request->input('email'));

        if ($user) {
            return response()->json(['status' => 400, 'message' => 'Email already exists.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        } else {
            return response()->json('Email is available.', 200);
        }
    }
}
