<?php

namespace App\Contracts\Repositories;

use App\Models\User;
use Illuminate\Http\Request;

interface UserRepository
{
    public function getAllUsers(Request $request);
    public function getById($userId);
    public function getByEmail($email);
    public function store(User $user);
    public function checkCredentials($email, $password);
    public function update(User $user);
    public function assignCommonValues(User $user, Request $request);
    public function decrementLoginAttempts($email);
    public function restoreLockDown(User $user);
    public function getTypeInfo($userId);
}