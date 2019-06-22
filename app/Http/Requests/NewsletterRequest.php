<?php

namespace App\Http\Requests;

class NewsletterRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'email' => 'required|email|unique:newsletters,email'
        ];
    }
}
