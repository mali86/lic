<?php

namespace App\Http\Controllers\Auth;

use App\Contracts\Repositories\UserRepository;
use App\Http\Requests\EmailRequest;
use App\Utilities\PasswordResetGenerator;
use App\Utilities\PasswordResetSendEmail;
use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use Illuminate\Mail\Mailer;

class ForgotPasswordController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Password Reset Controller
    |--------------------------------------------------------------------------
    |
    | This controller is responsible for handling password reset emails and
    | includes a trait which assists in sending these notifications from
    | your application to your users. Feel free to explore this trait.
    |
    */

    use SendsPasswordResetEmails;

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
     * Send email for reset password.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/password/email",
     *     description="Send email for reset password.",
     *     produces={"application/json"},
     *     tags={"auth"},
     *     @SWG\Parameter(
     *         description="Email",
     *         in="formData",
     *         name="email",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns success send email message."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function sendResetLinkEmail(EmailRequest $emailRequest, PasswordResetGenerator $passwordResetGenerator, PasswordResetSendEmail $passwordResetSendEmail, Mailer $mailer, UserRepository $userRepository)
    {
        $user = $userRepository->getByEmail($emailRequest->input('email'));

        $token = $passwordResetGenerator->generatePasswordResetToken($emailRequest->input('email'));

        $data = [
            'template' => 'forgot-password',
            'subject' => 'Change your password.'
        ];

        $passwordResetSendEmail->sendEmail($token, $mailer, $user, $data);

        return response()->json('Email send successfully.', 200);
    }
}
