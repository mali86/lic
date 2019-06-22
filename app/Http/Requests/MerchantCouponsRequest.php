<?php

namespace App\Http\Requests;

use Illuminate\Http\Request;

class MerchantCouponsRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(Request $request)
    {
        return [
            'merchant_id' => 'required'
        ];
    }
}
