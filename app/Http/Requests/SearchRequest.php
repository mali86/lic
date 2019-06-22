<?php

namespace App\Http\Requests;

class SearchRequest extends FormRequest
{
/**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'lat' => 'required_with:distance',
            'lon' => 'required_with:distance'
        ];
    }
}
