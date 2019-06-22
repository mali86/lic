<?php

namespace App\Repositories;

use App\Contracts\Repositories\UserRepository;
use App\Exceptions\Repositories\CredentialsDoNotMatch;
use App\Exceptions\Repositories\UserLockedDownException;
use App\Models\User;
use App\Exceptions\Repositories\UserNotFoundException;
use App\Utilities\PasswordResetSendEmail;
use Carbon\Carbon;
use DB;
use Illuminate\Http\Request;
use App\Utilities\PasswordResetGenerator;
use Illuminate\Mail\Mailer;
use Illuminate\Support\Facades\Hash;

class EloquentUserRepository implements UserRepository
{
    private $mailer;

    public function __construct(Mailer $mailer)
    {
        $this->mailer = $mailer;
    }

    public function getAllUsers(Request $request)
    {
        $collection = User::where('users.id', '>', 0);            
        
        if ($request->input('sort_by')) {
            
            $sort_by = $request->input('sort_by'); 
            
            if ($request->input('sort_by') == 'id') {
                $sort_by == 'users.id';
            }

            if (substr($sort_by, 0, 1) == '-') {
                $collection->orderBy(substr($sort_by, 1), 'desc');
            } else {
                $collection->orderBy($sort_by, 'asc');
            }
        }

        if ($request->input('type')) {
            $collection->where('type', '=', $request->input('type'));
        }

        if ($request->input('search')) {
            $collection->where('first_name', 'LIKE', '%' . $request->input('search') . '%')->orWhere('last_name', 'LIKE', '%' . $request->input('search') . '%');
            if ($request->input('type')) {
                $data['total'] = User::where('type', '=', $request->input('type'))->where('first_name', 'LIKE', '%' . $request->input('search') . '%')->orWhere('last_name', 'LIKE', '%' . $request->input('search') . '%')->count();
            } else {
                $data['total'] = User::where('first_name', 'LIKE', '%' . $request->input('search') . '%')->orWhere('last_name', 'LIKE', '%' . $request->input('search') . '%')->count();
            }
        } else {
            if ($request->input('type')) {
                $data['total'] = User::where('type', '=', $request->input('type'))->count();
            } else {
                $data['total'] = User::count();
            }
        }


        if ($request->input('limit') && $request->input('page')) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }

        $data['users'] = $collection->get();

        return $data;
    }

    public function getById($userId)
    {
        $user = User::find($userId);
        if ($user) {
            return $user;
        } else {
            throw new UserNotFoundException();
        }
    }

    public function getByEmail($email)
    {
        return User::where('email', '=', $email)->first();
    }

    public function getTypeInfo($userId)
    {
         $user = User::leftJoin('shopping_center_users', 'shopping_center_users.user_id', '=', 'users.id')
                    ->leftJoin('merchant_users', 'merchant_users.user_id', '=', 'users.id')
                    ->where('users.id', '=', $userId)->first();
       
        if ($user->shopping_center_id) {
            return $user->shopping_center_id;
        }
        if ($user->merchant_id) {

            $merchant = DB::table('merchants')->where('id', $user->merchant_id)->first();
            return $merchant;
        }
        
    }


    public function store(User $user)
    {
        return $user->save();
    }

    public function checkCredentials($email, $password)
    {
        $user = User::where('email', '=', $email)->where('active', '=', true)
            ->first();

        if ($user) {
            if (Hash::check($password, $user->password)) {
                if ($user->locked == 0) {
                    $this->restoreLockDown($user);
                    return $user;
                } else {
                    throw new UserLockedDownException();
                }
            } else {
                throw new CredentialsDoNotMatch();
            }
        } else {
            $this->decrementLoginAttempts($email);
            throw new UserNotFoundException();
        }
    }

    public function update(User $user)
    {
        $user->update();
    }

    public function decrementLoginAttempts($email)
    {
        $user = User::where('email', $email)->first();

        if ($user) {
            $user->attempts = max($user->attempts - 1, 0);

            if ($user->attempts == 0 && $user->locked == 0) {
                $user->locked = 1;
                $user->locked_down_time = Carbon::now();
                $passwordResetGenerator = new PasswordResetGenerator();
                $token = $passwordResetGenerator->generatePasswordResetToken($email);

                $passwordResetSendEmail = new PasswordResetSendEmail();
                $data = [
                    'template' => 'account-locked',
                    'subject' => 'Your account is locked.'
                ];
                $passwordResetSendEmail->sendEmail($token, $this->mailer, $user, $data);
            }

            $this->update($user);
        }
    }
    public function restoreLockDown(User $user)
    {
        $user->attempts = 3;
        $user->locked = 0;
        $user->locked_down_time = null;

        $this->update($user);
    }

    public function assignCommonValues(User $user, Request $request)
    {
        $user->first_name = $request->input('first_name');
        $user->last_name = $request->input('last_name');
        $user->email = $request->input('email');
        $user->password = bcrypt($request->input('password'));
        $user->type = $request->input('type');

        return $user;
    }
}