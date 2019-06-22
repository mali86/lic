<?php
namespace App\Utilities;
use App\Models\User;
use Illuminate\Mail\Mailer;
use Illuminate\Mail\Message;

class ConfirmEmailSendEmail
{
    public function sendEmail($token, Mailer $mailer, User $user, $emailData)
    {
        $data = [
            'url' => str_replace('api', 'cms', asset('confirm-email')).'?token='.$token.'&data='.encrypt($user->email)//encrypt email for check on reset password
        ];

        $mailer->send('emails.'.$emailData['template'], $data, function (Message $message) use ($user, $emailData) {
            $message->to($user->email, $user->first_name.' '.$user->last_name);
            $message->subject($emailData['subject']);
        });
    }
}