<?php

namespace App\Http\Requests;

class ShoppingCenterRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'area_id' => 'required|exists:areas,id',
            'name' => 'required|min:3|max:255',
            'description' => 'required|min:10',
            'address' => 'min:3',
            'city' => 'min:3',
            'zip' => 'min:3',
            'website' => 'url',
            'working_hours' => 'working_hours',
            'user_id' => 'exists:users,id'
        ];
    }
}
