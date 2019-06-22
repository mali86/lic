<?php

namespace App\Exceptions\Repositories;

class UserNotFoundException extends \Exception
{
    public function __construct($message = 'Credentials don\'t match')
    {
        parent::__construct($message);
    }
}