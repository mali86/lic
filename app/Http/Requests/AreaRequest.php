<?php

namespace App\Http\Requests;

class AreaRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name' => 'required',
            'state_id' => 'required|exists:states,id'
        ];
    }
}
