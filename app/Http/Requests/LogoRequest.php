<?php

namespace App\Http\Requests;

class LogoRequest extends FormRequest
{
    public function rules()
    {
        return [
            'logo' => 'required|mimes:jpeg,bmp,png'
        ];
    }
}
