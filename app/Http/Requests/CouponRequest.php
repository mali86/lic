<?php

namespace App\Http\Requests;

class CouponRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $rules =  [
            'title' => 'required',
            'description' => 'required|max:200',
            'files.*' => 'mimes:jpeg,bmp,png,pdf',
           // 'start_date' => 'iso_date',
            //'end_date' => 'iso_date|after:start_date',
            'merchant_id' => 'exists:merchants,id',
        ];
        return $rules;
    }
}
