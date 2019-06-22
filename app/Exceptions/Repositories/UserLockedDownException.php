<?php

namespace App\Exceptions\Repositories;


class UserLockedDownException extends \Exception
{
    public function __construct($message = 'User account was locked.')
    {
        parent::__construct($message);
    }
}