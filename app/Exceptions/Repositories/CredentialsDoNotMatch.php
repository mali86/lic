<?php

namespace App\Exceptions\Repositories;


class CredentialsDoNotMatch extends \Exception
{
    public function __construct($message = 'Credentials don\'t match.')
    {
        parent::__construct($message);
    }
}