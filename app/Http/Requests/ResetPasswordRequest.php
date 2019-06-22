<?php

namespace App\Http\Requests;

class ResetPasswordRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'token' => 'required|exists:password_resets,token',
            'password' => 'required|confirmed|min:6',
            'data' => 'required'
        ];
    }
}
