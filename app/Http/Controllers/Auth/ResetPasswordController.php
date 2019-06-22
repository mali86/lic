<?php

namespace App\Http\Controllers\Auth;

use App\Contracts\Repositories\UserRepository;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\PasswordReset;
use Illuminate\Foundation\Auth\ResetsPasswords;

class ResetPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset requests
    | and uses a simple trait to include this behavior. You're free to
    | explore this trait and override any methods you wish to tweak.
    |
    */

    use ResetsPasswords;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }

    /**
     * Reset password.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/password/reset",
     *     description="Reset password.",
     *     produces={"application/json"},
     *     tags={"auth"},
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
     *         description="Password",
     *         in="formData",
     *         name="password",
     *         required=true,
     *         type="string",
     *     ),
     *      @SWG\Parameter(
     *         description="Password confirmation",
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
     *         response=400,
     *         description="User not found."
     *     ),
     *     @SWG\Response(
     *         response=403,
     *         description="Token is expired or wrong."
     *     )
     * )
     */
    public function reset(ResetPasswordRequest $resetPasswordRequest, UserRepository $userRepository)
    {
        //decrypt email address
        $email = decrypt($resetPasswordRequest->data);

        $passwordReset = PasswordReset::where('token', '=', $resetPasswordRequest->token)
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

                $user->password = bcrypt($resetPasswordRequest->input('password'));

                $userRepository->store($user);

                PasswordReset::where('email', $email)->delete();

                return response()->json($user);
            } else {
                return response()->json(['status' => 400, 'message' => 'User not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else {
            return response()->json(['status' => 400, 'message' => 'Token is expired or wrong.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

    }
}
