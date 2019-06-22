<?php
namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest as ParentFormRequest;

class FormRequest extends ParentFormRequest
{
    /**
     * Return errors as json.
     *
     * @return array
     */
    public function wantsJson()
    {
        return true;
    }

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    public function response(array $errors)
    {
        if ($this->ajax() || $this->wantsJson())
        {
            $message = '';
            $first = true;
            foreach ($errors as $key => $error) {
                if ($first) {
                    $first = false;
                    $message = $message . $error[0];
                } else {
                    $message = $message . ';' . $error[0];
                }
            }
            return response()->json(['status' => 422, 'message' => $message, 'timestamp' => Carbon::now()->toDateTimeString()], 422);
        }

        return $this->redirector->to($this->getRedirectUrl())
            ->withInput($this->except($this->dontFlash))
            ->withErrors($errors, $this->errorBag);
    }
}