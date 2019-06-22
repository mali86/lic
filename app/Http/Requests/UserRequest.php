<?php

namespace App\Http\Requests;

use App\Contracts\Repositories\UserRepository;
use Illuminate\Http\Request;

class UserRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(Request $request, UserRepository $userRepository)
    {
        $rules = [
            'first_name' => 'required|max:255',
            'last_name' => 'required|max:255',
            'type' => 'min:1|max:3|integer'
        ];

        return $rules;
    }
}
