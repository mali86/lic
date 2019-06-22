<?php

namespace App\Http\Requests;

use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class MerchantRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(Request $request)
    {
        try {
            $key = config('app.JWT_key');

            $token = $request->header('Authorization');

            if ($token) {
                $decoded = (array) JWT::decode($token, $key, array('HS256'));

                $role = $decoded['role'];
            } else {
                $role = '';
            }
        } catch (\Exception $e) {
            $role = '';
        }
        $rules = [
            'area_id' => 'required|exists:areas,id',
            'shopping_center_id' => 'exists:shopping_centers,id',
            'name' => 'required|min:2|max:255',
            'shopping_center_name' => 'min:3|max:255',
            'city' => 'min:3',
            'address' => 'min:3',
            'zip' => 'required_without:shopping_center_id|min:3'
        ];

        if ($request->input('website') != null) {
            $rules['website'] = 'url';
        }

        if ($request->input('phone') != null) {
            $rules['phone'] = 'min:6';
        }

        if ($role != 'user') {
            $rules['user_id'] = 'required|exists:users,id';
        }

        return $rules;
    }
}
