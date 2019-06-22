<?php

namespace App\Http\Controllers\Auth;

use App\Contracts\Repositories\UserRepository;
use App\Http\Controllers\ApiController;

class Controller extends ApiController
{
    protected $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }
}
