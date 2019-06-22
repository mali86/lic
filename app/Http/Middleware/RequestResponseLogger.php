<?php

namespace App\Http\Middleware;

use Closure;
use Log;

class RequestResponseLogger
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */

    protected $startTime;

    public function handle($request, Closure $next)
    {
        $this->startTime = microtime(true);
        return $next($request);
    }
 
    public function terminate($request, $response)
    {
        Log::info('requests', [
            'url' => $request->url(),
            'request' => $request->all(),
            'response' => $response->getContent(),
            'user_agent' => $request->header('User-Agent')
        ]);
    }
}

