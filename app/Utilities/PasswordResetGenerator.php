<?php

namespace App\Utilities;

use \App\Models\PasswordReset;

class PasswordResetGenerator
{
    public function generatePasswordResetToken($email, $type = 1)
    {
        $passwordReset = new PasswordReset();
        $passwordReset->email = $email;
        $passwordReset->type = $type;
        $passwordReset->token = hash('sha256', $email).hash('sha256', time());

        PasswordReset::where('email', '=', $email)->delete();

        $passwordReset->save();

        return $passwordReset->token;
    }
}