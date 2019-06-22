<?php

namespace App\Http\Requests;

use Firebase\JWT\JWT;
use Illuminate\Http\Request;

class ChangePasswordRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(Request $request)
    {
        try {
            $key = config('app.JWT_key');

            $token = $request->header('Authorization');

            if ($token) {
                $decoded = (array) JWT::decode($token, $key, array('HS256'));

                $role = $decoded['role'];
            } else {
                $role = '';
            }
        } catch (\Exception $e) {
            $role = '';
        }
        $rules = [
            'password' => 'required|confirmed|min:6'
        ];

        if ($role != 'admin') {
            $rules['old_password'] = 'required|min:6';
        }

        return $rules;
    }
}
