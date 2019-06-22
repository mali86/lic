<?php

namespace App\Http\Requests;

class CheckTokenRequest extends FormRequest
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
            'data' => 'required',
            'type' => 'required|integer|min:1|max:2'
        ];
    }
}
