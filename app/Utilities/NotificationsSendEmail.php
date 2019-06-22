<?php
namespace App\Utilities;

use App\Models\User;
use Illuminate\Mail\Mailer;
use Illuminate\Mail\Message;

class NotificationsSendEmail
{
    public function sendEmail(Mailer $mailer, $emailData)
    {
        $data = [
            'title' => $emailData['subject']
        ];

        $users = User::where('type', '=', 3)->where('notifications', '=', true)->get();
        foreach ($users as $user) {
            $mailer->send('emails.'.$emailData['template'], $data, function (Message $message) use ($user, $emailData) {
                $message->to($user->email, $user->first_name.' '.$user->last_name);
                $message->subject($emailData['subject']);
            });
        }
    }
}