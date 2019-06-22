<?php

namespace App\Http\Middleware;

use \Firebase\JWT\JWT;
use Carbon\Carbon;

class CheckUser
{
    public function handle($request, $next, ...$scopes)
    {
        try {
            $key = config('app.JWT_key');

            $token = $request->header('Authorization');

            $decoded = (array) JWT::decode($token, $key, array('HS256'));

            if ($decoded['role'] != 'user') {
                return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
            }

            return $next($request);
        } catch (\Exception $exception) {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()], 401);
        }
    }
}