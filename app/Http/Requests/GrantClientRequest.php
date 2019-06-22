<?php

namespace App\Http\Requests;

class GrantClientRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'user_id' => 'required|exists:users,id|unique:oauth_clients,user_id',
            'name' => 'required'
        ];
    }
}
