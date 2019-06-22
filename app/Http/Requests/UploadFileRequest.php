<?php

namespace App\Http\Requests;

class UploadFileRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $rules =  [
            'file' => 'required|mimes:jpeg,bmp,png,pdf'
        ];

        return $rules;
    }
}
