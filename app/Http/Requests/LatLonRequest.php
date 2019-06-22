<?php

namespace App\Http\Requests;

class LatLonRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'lat' => 'required|min:-90|max:90|numeric',
            'lon' => 'required|min:-180|max:180|numeric'
        ];
    }
}
