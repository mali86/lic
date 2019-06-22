<?php

namespace App\Http\Controllers\Auth;

use App\Contracts\Repositories\UserRepository;
use App\Http\Requests\LoginRequest;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use \Firebase\JWT\JWT;
use Carbon\Carbon;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(UserRepository $userRepository)
    {
        parent::__construct($userRepository);
        $this->middleware('guest', ['except' => 'logout']);
    }

    /**
     * Login.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/login",
     *     description="Login and returns user info.",
     *     produces={"application/json"},
     *     tags={"auth"},
     *     @SWG\Parameter(
     *         description="Email.",
     *         in="formData",
     *         name="email",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Password.",
     *         in="formData",
     *         name="password",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns user info."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Credentials don't match."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function login(LoginRequest $loginRequest)
    {
        try {
            $user = $this->userRepository->checkCredentials($loginRequest->input('email'), $loginRequest->input('password'));

            $key = config('app.JWT_key');
            if ($user->type == 1) {
                $type = 'user';
            } else if ($user->type == 2) {
                $type = 'sc-user';
            } else if ($user->type == 3) {
                $type = 'admin';
            } else {
                $type = '';
            }
            $token = array(
                "first_name" => $user->first_name,
                "last_name" => $user->last_name,
                "email" => $user->email,
                "user_id" => $user->id,
                "role" => $type
            );

            $jwtToken = JWT::encode($token, $key);

            $user->token = $jwtToken;

            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['status' => 400, 'message' => $e->getMessage(), 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }
    }
}
