<?php

namespace App\Http\Controllers;

use App\Contracts\Repositories\MerchantRepository;
use App\Contracts\Repositories\UserRepository;
use App\Exceptions\Repositories\UserNotFoundException;
use App\Http\Requests\LogoRequest;
use App\Models\Coupon;
use App\Models\Merchant;
use App\Models\MerchantUser;
use App\Models\State;
use App\Utilities\NotificationsSendEmail;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use App\Contracts\Repositories\ShoppingCenterRepository;
use App\Contracts\Repositories\AreaRepository;
use App\Exceptions\Repositories\AreaNotFoundException;
use Carbon\Carbon;
use App\Exceptions\Repositories\ShoppingCenterBeingUsedException;
use App\Exceptions\Repositories\ShoppingCenterNotFoundException;
use App\Http\Requests\ShoppingCenterRequest;
use App\Models\ScWorkingHour;
use App\Models\ShoppingCenter;
use Geocode;
use Illuminate\Mail\Mailer;
use Illuminate\Support\Facades\DB;

class ShoppingCentersController extends ApiController
{
    private $shoppingCenterRepository;
    private $areaRepository;
    private $userId;
    private $role;

    public function __construct(ShoppingCenterRepository $shoppingCenterRepository, AreaRepository $areaRepository, UserRepository $userRepository, Request $request)
    {
        $this->shoppingCenterRepository = $shoppingCenterRepository;
        $this->areaRepository = $areaRepository;
        $this->role = '';

        try {
            $key = config('app.JWT_key');

            $token = $request->header('Authorization');

            $decoded = (array) JWT::decode($token, $key, array('HS256'));

            $user = $userRepository->getByEmail($decoded['email']);

            $this->userId = $user->id;
            $this->role = $decoded['role'];
        } catch (UserNotFoundException $userNotFoundException) {
            $this->userId = 0;
        } catch (\UnexpectedValueException $unexpectedValueException) {
            $this->userId = 0;
        }
    }

    /**
     * Display a listing of the shopping centers.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/shopping-centers",
     *     description="Returns all shopping centers.",
     *     produces={"application/json"},
     *     tags={"shopping centers"},
     *     @SWG\Parameter(
     *         description="How many results want per page.",
     *         in="query",
     *         name="limit",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Page number.",
     *         in="query",
     *         name="page",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Column name for sort. (- before name for desc)",
     *         in="query",
     *         name="sort_by",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Area id",
     *         in="query",
     *         name="area",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Search by shopping centers name.",
     *         in="query",
     *         name="search",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns all shopping centers."
     *     )
     * )
     */
    public function index(Request $request, AreaRepository $areaRepository)
    {
        if ($this->role == 'sc-user') {
            $shoppingCenters = $this->shoppingCenterRepository->getAllShoppingCenters($request, false, $areaRepository, $this->userId);
        } else {
            $shoppingCenters = $this->shoppingCenterRepository->getAllShoppingCenters($request, false, $areaRepository);
        }

        return response()->json($shoppingCenters, 200);
    }

    /**
     * Creates shopping center.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/shopping-centers",
     *     description="Creates shopping center.",
     *     produces={"application/json"},
     *     tags={"shopping centers"},
     *     @SWG\Parameter(
     *         description="User id (If sc user create new shopping center to assign it to him)",
     *         in="formData",
     *         name="user_id",
     *         required=false,
     *         type="integer",
     *     ),
     *      @SWG\Parameter(
     *         description="Shopping center name",
     *         in="formData",
     *         name="name",
     *         required=true,
     *         type="string",
     *     ),
     *      @SWG\Parameter(
     *         description="Area id",
     *         in="formData",
     *         name="area_id",
     *         required=true,
     *         type="integer"
     *     ),
     *      @SWG\Parameter(
     *         description="Shopping center description, min length 10 characters",
     *         in="formData",
     *         name="description",
     *         required=true,
     *         type="string"
     *     ),
     *      @SWG\Parameter(
     *         description="Shopping center address, min length 3 characters",
     *         in="formData",
     *         name="address",
     *         required=true,
     *         type="string"
     *     ),
     *      @SWG\Parameter(
     *         description="Shopping center city, min length 3 characters",
     *         in="formData",
     *         name="city",
     *         required=true,
     *         type="string"
     *     ),
     *      @SWG\Parameter(
     *         description="Shopping center zip code, min length 3 characters",
     *         in="formData",
     *         name="zip",
     *         required=true,
     *         type="string"
     *     ),
     *      @SWG\Parameter(
     *         description="Shopping center website url",
     *         in="formData",
     *         name="website",
     *         required=true,
     *         type="string"
     *     ),
     *     @SWG\Parameter(
     *         description="Working hours",
     *         in="formData",
     *         name="working_hours",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns new shopping center."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function store(ShoppingCenterRequest $shoppingCenterRequest, Mailer $mailer, NotificationsSendEmail $notificationsSendEmail)
    {
        if ($this->role == 'user' || $this->role == 'sc-user') {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
        $shoppingCenter = new ShoppingCenter();

        if ($shoppingCenterRequest->input('zip')) {
            $responseData = Geocode::make()->address($shoppingCenterRequest->input('zip'));

            $lat = $responseData->latitude();
            $lon = $responseData->longitude();
        } else {
            $lat = 0;
            $lon = 0;
        }

	if ($shoppingCenterRequest->input('lat')) {
		$lat = $shoppingCenterRequest->input('lat');	
	}

	if ($shoppingCenterRequest->input('lon')) {
		$lon = $shoppingCenterRequest->input('lon');	
	}

        $shoppingCenter = $this->assignCommonValues($shoppingCenter, $shoppingCenterRequest, $lat, $lon);

        if ($shoppingCenterRequest->input('user_id')) {
            $shoppingCenter->approved = true;
        }

        $shoppingCenter = $this->shoppingCenterRepository->store($shoppingCenter);

        if ($shoppingCenterRequest->input('user_id')) {
            DB::table('shopping_center_users')->insert([
                'shopping_center_id' => $shoppingCenter->id,
                'user_id' => $shoppingCenterRequest->input('user_id')
            ]);
        }

        //If working time is sent, set it.
        if($shoppingCenterRequest->input('working_hours')) {
            $scWorkingHour = new ScWorkingHour();

            $scWorkingHour = $this->assignWorkingHours($scWorkingHour, $shoppingCenterRequest);

            $scWorkingHour->shopping_center_id = $shoppingCenter->id;

            $this->shoppingCenterRepository->storeWorkingHour($scWorkingHour);

            $shoppingCenter->working_hours = $this->shoppingCenterRepository->parseWorkingHours($scWorkingHour);
        }

        $data = [
            'template' => 'notifications',
            'subject' => 'New shopping center.',
            'shopping_center' => $shoppingCenter
        ];

        $notificationsSendEmail->sendEmail($mailer, $data);

        return response()->json($shoppingCenter, 200);
    }

    /**
     * Display shopping center.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/shopping-centers/{id}",
     *     description="Returns shopping center.",
     *     produces={"application/json"},
     *     tags={"shopping centers"},
     *     @SWG\Parameter(
     *         description="Shopping center id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns shopping center."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Shopping center not found."
     *     )
     * )
     */
    public function show($id, AreaRepository $areaRepository)
    {
        if ($this->role == 'admin') {
            try {
                $shoppingCenter = $this->shoppingCenterRepository->showById($id, null, $areaRepository);
            } catch (ShoppingCenterNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Shopping center not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else if ($this->role == 'sc-user') {
            $shoppingCenter = $this->shoppingCenterRepository->showById($id, null, $areaRepository);
        } else if ($this->role == 'user') {
            $shoppingCenter = $this->shoppingCenterRepository->showById($id, null, $areaRepository);
        }  else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

        return response()->json($shoppingCenter, 200);
    }

    public function home(Request $request, MerchantRepository $merchantRepository)
    {
        $response = array();
        if ($this->role == 'user') {
            $merchant = Merchant::join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
                ->where('merchant_users.user_id', '=', $this->userId)->selectRaw('merchants.*')->first();
            $response['coupons'] = Coupon::where('merchant_id', '=', $merchant->id)->count();
        } else {
           /* if ($this->role == 'sc-user') {
                $merchants = $merchantRepository->getMerchantsBySCUserId($this->userId, $request);
            } else {
                $merchants = $merchantRepository->getMerchants($request);
            }

            $merchantIds = array();
            foreach ($merchants['merchants'] as $merchant) {
                $merchantIds[] = $merchant->id;
            }

            $response['merchants'] = $merchants['total'];
            $response['coupons'] = Coupon::whereIn('merchant_id', $merchantIds)->count();
            $response['users'] = count(MerchantUser::whereIn('merchant_id', $merchantIds)->distinct()->selectRaw('user_id')->get());*/
        
		
            $merchants = Merchant::whereNotNull('shopping_center_id')->get();
            $response['merchants'] = count($merchants);
            

            $merchantIds = array();
            foreach ($merchants as $merchant) {
                $merchantIds[] = $merchant->id;
            }

            $response['coupons'] = Coupon::whereIn('merchant_id', $merchantIds)->count();
            $response['users'] = count(MerchantUser::whereIn('merchant_id', $merchantIds)->distinct()->selectRaw('user_id')->get());
	}

        return response()->json($response, 200);
    }

    public function statistic(Request $request, MerchantRepository $merchantRepository)
    {
        $response = array();
        $response['merchants'] = [];
        $response['coupons'] = [];
        $response['users'] = [];
        if ($this->role == 'user') {
            $merchant = Merchant::join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
                ->where('merchant_users.user_id', '=', $this->userId)->selectRaw('merchants.*')->first();
            $response['coupons'] = Coupon::where('merchant_id', '=', $merchant->id)->count();
        } else {
            if ($this->role == 'sc-user') {
                $merchants = $merchantRepository->getMerchantsBySCUserId($this->userId, $request);
            } else {
                $merchants = $merchantRepository->getMerchants($request);
            }

            $merchantIds = array();
            foreach ($merchants['merchants'] as $merchant) {
                $merchantIds[] = $merchant->id;
            }

            $date = new Carbon('first day of this month');
            $thisMonth = $date->toDateTimeString();
            $oneMonthAgo = $date->subMonth(1)->toDateTimeString();
            $twoMonthAgo = $date->subMonth(1)->toDateTimeString();
            $threeMonthAgo = $date->subMonth(1)->toDateTimeString();

            $response['merchants'][] = Merchant::whereIn('id', $merchantIds)->where('created_at', '>', $thisMonth)->count();
            $response['coupons'][] = Coupon::whereIn('merchant_id', $merchantIds)->where('created_at', '>', $thisMonth)->count();
            $response['users'][] = count(MerchantUser::whereIn('merchant_id', $merchantIds)->where('created_at', '>', $thisMonth)->distinct()->selectRaw('user_id')->get());

            $response['merchants'][] = Merchant::whereIn('id', $merchantIds)->where('created_at', '>', $oneMonthAgo)->where('created_at', '<', $thisMonth)->count();
            $response['coupons'][] = Coupon::whereIn('merchant_id', $merchantIds)->where('created_at', '>', $oneMonthAgo)->where('created_at', '<', $thisMonth)->count();
            $response['users'][] = count(MerchantUser::whereIn('merchant_id', $merchantIds)->where('created_at', '>', $oneMonthAgo)->where('created_at', '<', $thisMonth)->distinct()->selectRaw('user_id')->get());

            $response['merchants'][] = Merchant::whereIn('id', $merchantIds)->where('created_at', '>', $twoMonthAgo)->where('created_at', '<', $oneMonthAgo)->count();
            $response['coupons'][] = Coupon::whereIn('merchant_id', $merchantIds)->where('created_at', '>', $twoMonthAgo)->where('created_at', '<', $oneMonthAgo)->count();
            $response['users'][] = count(MerchantUser::whereIn('merchant_id', $merchantIds)->where('created_at', '>', $twoMonthAgo)->where('created_at', '<', $oneMonthAgo)->distinct()->selectRaw('user_id')->get());

            $response['merchants'][] = Merchant::whereIn('id', $merchantIds)->where('created_at', '>', $threeMonthAgo)->where('created_at', '<', $twoMonthAgo)->count();
            $response['coupons'][] = Coupon::whereIn('merchant_id', $merchantIds)->where('created_at', '>', $threeMonthAgo)->where('created_at', '<', $twoMonthAgo)->count();
            $response['users'][] = count(MerchantUser::whereIn('merchant_id', $merchantIds)->where('created_at', '>', $threeMonthAgo)->where('created_at', '<', $twoMonthAgo)->distinct()->selectRaw('user_id')->get());
        }

        return response()->json($response, 200);
    }

    /**
     * Updates shopping center.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/shopping-centers/{id}",
     *     description="Updates shopping center.",
     *     produces={"application/json"},
     *     tags={"shopping centers"},
     *     @SWG\Parameter(
     *         description="Shopping center id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Shopping center name",
     *         in="formData",
     *         name="name",
     *         required=true,
     *         type="string",
     *     ),
     *      @SWG\Parameter(
     *         description="Area id",
     *         in="formData",
     *         name="area_id",
     *         required=true,
     *         type="integer"
     *     ),
     *      @SWG\Parameter(
     *         description="Shopping center description, min length 10 characters",
     *         in="formData",
     *         name="description",
     *         required=true,
     *         type="string"
     *     ),
     *      @SWG\Parameter(
     *         description="Shopping center address, min length 3 characters",
     *         in="formData",
     *         name="address",
     *         required=true,
     *         type="string"
     *     ),
     *      @SWG\Parameter(
     *         description="Shopping center city, min length 3 characters",
     *         in="formData",
     *         name="city",
     *         required=true,
     *         type="string"
     *     ),
     *      @SWG\Parameter(
     *         description="Shopping center zip code, min length 3 characters",
     *         in="formData",
     *         name="zip",
     *         required=true,
     *         type="string"
     *     ),
     *      @SWG\Parameter(
     *         description="Shopping center website url",
     *         in="formData",
     *         name="website",
     *         required=true,
     *         type="string"
     *     ),
     *     @SWG\Parameter(
     *         description="Working hours",
     *         in="formData",
     *         name="working_hours",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Shopping center has been successfully updated."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Shopping center not found."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function update($id, ShoppingCenterRequest $shoppingCenterRequest)
    {
        if ($this->role == 'admin' || $this->role == 'sc-user') {
            try {
                $shoppingCenter = $this->shoppingCenterRepository->getById($id);
            } catch (ShoppingCenterNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Shopping center not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

        if ($shoppingCenterRequest->input('zip')) {
            $responseData = Geocode::make()->address($shoppingCenterRequest->input('zip'));

            $lat = $responseData->latitude();
            $lon = $responseData->longitude();
        } else {
            $lat = $shoppingCenter->lat;
            $lon = $shoppingCenter->lon;
        }

	if ($shoppingCenterRequest->input('lat')) {
		$lat = $shoppingCenterRequest->input('lat');	
	}

	if ($shoppingCenterRequest->input('lon')) {
		$lon = $shoppingCenterRequest->input('lon');	
	}

        $shoppingCenter = $this->assignCommonValues($shoppingCenter, $shoppingCenterRequest, $lat, $lon);

        $this->shoppingCenterRepository->update($shoppingCenter);

        if ($shoppingCenterRequest->input('working_hours')) {
            $workingHours = $this->shoppingCenterRepository->getWorkingHourById($id);

            $workingHours = $this->assignWorkingHours($workingHours, $shoppingCenterRequest);

            $shoppingCenter->working_hours = $this->shoppingCenterRepository->parseWorkingHours($workingHours);

            $this->shoppingCenterRepository->updateWorkingHours($workingHours);
        }

        return response()->json($shoppingCenter, 200);
    }

    /**
     * Removes shopping center.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Delete(
     *     path="/shopping-centers/{id}",
     *     description="Deletes shopping centers.",
     *     produces={"application/json"},
     *     tags={"shopping centers"},
     *      @SWG\Parameter(
     *          description="Shopping center id",
     *          in="path",
     *          name="id",
     *          required=true,
     *          type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Shopping center has been successfully deleted."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Shopping center not found."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Can not delete shopping center. Some merchant is registered in it."
     *     )
     * )
     */
    public function destroy($id)
    {
        if ($this->role != 'admin' && $this->role != 'sc-user') {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
        if ($this->role == 'sc-user') {
            try {
                $this->shoppingCenterRepository->getById($id, $this->userId);
            } catch (ShoppingCenterNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Shopping center not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        }

        try {
            $this->shoppingCenterRepository->checkUsage($id);
        } catch (ShoppingCenterBeingUsedException $e) {
            return response()->json(['status' => 422, 'message' => 'Shopping center can\'t be deleted. There are merchants in it.', 'timestamp' => Carbon::now()->toDateTimeString()], 422);
        }

        try {
            $this->shoppingCenterRepository->delete($id);
        } catch (ShoppingCenterNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Shopping center not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return response()->json('Shopping center has been successfully deleted.', 200);
    }

    /*
     * Assign values from request to shopping center.
     */

    private function assignCommonValues(ShoppingCenter $shoppingCenter, Request $request, $lat, $lon)
    {
        $shoppingCenter->area_id = $request->input('area_id');
        $shoppingCenter->name = $request->input('name');
        $shoppingCenter->description = $request->input('description');
        $shoppingCenter->address = $request->input('address');

        $shoppingCenter->approved = true;
        $shoppingCenter->city = $request->input('city');
        $shoppingCenter->zip = $request->input('zip');
        $shoppingCenter->approved = true;
        $shoppingCenter->website = $request->input('website');
        $shoppingCenter->lat = $lat;
        $shoppingCenter->lon = $lon;

        return $shoppingCenter;
    }

    private function assignWorkingHours(ScWorkingHour $scWorkingHour, Request $request)
    {
        $days = $request->input('working_hours');

        foreach (Array('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') as $day) {
            $tmp = $day . '_from';
            $scWorkingHour->$tmp = null;
            $tmp = $day . '_to';
            $scWorkingHour->$tmp = null;
        }
        foreach ($days as $day) {
            $timeComponens = explode(':', $day['from']);

            if (count($timeComponens) == 2) {
                $time = Carbon::createFromTime($timeComponens[0], substr($timeComponens[1], 0, count($timeComponens[1])-4));
                if (substr($timeComponens[1], count($timeComponens[1]) - 4, 2) == 'pm' || substr($timeComponens[1], count($timeComponens[1]) - 4, 2) == 'PM') {
                    $time->addHour(12);
                }
            } else {
                $time = Carbon::createFromTime(substr($timeComponens[0], 0, count($timeComponens[0])-4));
                if (substr($timeComponens[0], count($timeComponens[0]) - 4, 2) == 'pm' || substr($timeComponens[0], count($timeComponens[0]) - 4, 2) == 'PM') {
                    $time->addHour(12);
                }
            }

            $tmp = strtolower($day['day'].'_from');
            $scWorkingHour->$tmp = $time->hour . ':' . $time->minute .  ':' . $time->second;

            $timeComponens = explode(':', $day['to']);

            if (count($timeComponens) == 2) {
                $time = Carbon::createFromTime($timeComponens[0], substr($timeComponens[1], 0, count($timeComponens[1])-4));
                if (substr($timeComponens[1], count($timeComponens[1]) - 3, 2) == 'pm' || substr($timeComponens[1], count($timeComponens[1]) - 3, 2) == 'PM') {
                    $time->addHour(12);
                }
            } else {
                $time = Carbon::createFromTime(substr($timeComponens[0], 0, count($timeComponens[0])-4));
                if (substr($timeComponens[0], count($timeComponens[0]) - 3, 2) == 'pm' || substr($timeComponens[0], count($timeComponens[0]) - 3, 2) == 'PM') {
                    $time->addHour(12);
                }
            }

            $tmp = strtolower($day['day'].'_to');
            $scWorkingHour->$tmp = $time->hour . ':' . $time->minute .  ':' . $time->second;
        }

        return $scWorkingHour;
    }

    /**
     * Display shopping centers in requested area (by id).
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/areas/{id}/shopping-centers",
     *     description="Shopping centers are ordered by distance if coordinates are supplied, or by alphabet if they aren't.",
     *     produces={"application/json"},
     *     tags={"areas"},
     *     @SWG\Parameter(
     *         description="Area id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Latitude",
     *         in="query",
     *         name="lat",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Longitude",
     *         in="query",
     *         name="lon",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Array of category ids",
     *         in="query",
     *         name="filters[]",
     *         required=false,
     *         type="integer",
     *     ),
     *
     *     @SWG\Parameter(
     *         description="How many results want per page.",
     *         in="query",
     *         name="limit",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Page number.",
     *         in="query",
     *         name="page",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Column name for sort. (- before name for desc)",
     *         in="query",
     *         name="sort_by",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns shopping centers."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Area not found."
     *     )
     * )
     */
    public function searchShoppingCentersByArea($id, Request $request)
    {
        try {
             $this->areaRepository->getById($id);
        } catch (AreaNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Area not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        $input = $request->all();

        $lat = null;
        $lon = null;
        $filters = null;

        if (!empty($input['lat']) && $input['lon']) {
            $lat = $input['lat'];
            $lon = $input['lon'];
        }

        if (!empty($input['filters'])) {
            $filters = $input['filters'];
        }

        $shoppingCenters = $this->shoppingCenterRepository->getShoppingCentersByAreaId($id, $lat, $lon, $filters, $request);

        return response()->json($shoppingCenters, 200);
    }

    /**
     * Display shopping centers in requested area (by name).
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/shopping-centers/area-name/{name}",
     *     description="Shopping centers are ordered by distance if coordinates are supplied, or by alphabet if they aren't.",
     *     produces={"application/json"},
     *     tags={"shopping centers"},
     *     @SWG\Parameter(
     *         description="Area name",
     *         in="path",
     *         name="name",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Latitude",
     *         in="query",
     *         name="lat",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Longitude",
     *         in="query",
     *         name="lon",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Array of category ids",
     *         in="query",
     *         name="filters[]",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns shopping centers."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Area not found."
     *     )
     * )
     */
    public function searchShoppingCentersByName($name, Request $request)
    {
        try {
            $this->areaRepository->getByName($name);
        } catch (AreaNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Area not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        $input = $request->all();

        $lat = null;
        $lon = null;
        $filters = null;

        if (!empty($input['lat']) && $input['lon']) {
            $lat = $input['lat'];
            $lon = $input['lon'];
        }

        if (!empty($input['filters'])) {
            $filters = $input['filters'];
        }

        $shoppingCenters = $this->shoppingCenterRepository->getShoppingCentersByAreaName($name, $lat, $lon, $filters);

        return response()->json($shoppingCenters, 200);
    }

    /**
     * Search states.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/states",
     *     description="Search states.",
     *     produces={"application/json"},
     *     tags={"states"},
     *      @SWG\Parameter(
     *         description="How many results want per page.",
     *         in="query",
     *         name="limit",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Page number.",
     *         in="query",
     *         name="page",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Column name for sort. (- before name for desc)",
     *         in="query",
     *         name="sort_by",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Search by states name.",
     *         in="query",
     *         name="search",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Return list of states."
     *     )
     * )
     */
    public function getStates(Request $request)
    {
        $collection = State::where('id', '>', 0);

        if ($request->input('sort_by')) {
            if (substr($request->input('sort_by'), 0, 1) == '-') {
                $collection->orderBy(substr($request->input('sort_by'), 1), 'desc');
            } else {
                $collection->orderBy($request->input('sort_by'), 'asc');
            }
        }

        if ($request->input('search')) {
            $collection->where('name', 'LIKE', '%' . $request->input('search') . '%');
            $data['total'] = State::where('name', 'LIKE', '%' . $request->input('search') . '%')->count();
        } else {
            $data['total'] = State::count();
        }


        if ($request->input('limit') && $request->input('page')) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }

        $data['states'] = $collection->get();

        return response()->json($data, 200);
    }

    /**
     * Returns all unapproved shopping centers.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/shopping-centers/unapproved",
     *     description="Returns all unapproved shopping centers.",
     *     produces={"application/json"},
     *     tags={"shopping centers"},
     *      @SWG\Parameter(
     *         description="How many results want per page.",
     *         in="query",
     *         name="limit",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Page number.",
     *         in="query",
     *         name="page",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Column name for sort. (- before name for desc)",
     *         in="query",
     *         name="sort_by",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Search by shopping center name.",
     *         in="query",
     *         name="search",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns all unapproved shopping centers."
     *     )
     * )
     */
    public function unapprovedShoppingCenters(Request $request)
    {
        if ($this->role == 'admin') {
            $unapprovedShoppingCenters = $this->shoppingCenterRepository->getUnapprovedShoppingCenters($request);

            return response()->json($unapprovedShoppingCenters, 200);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }

    /**
     * Approve shopping centers.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/shopping-centers/{id}/approve",
     *     description="Approve shopping center.",
     *     produces={"application/json"},
     *     tags={"shopping centers"},
     *     @SWG\Parameter(
     *         description="Shopping center id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns shopping center."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Shopping centers not found."
     *     )
     * )
     */
    public function approveShoppingCenter($id)
    {
        if ($this->role == 'admin') {
            try {
                $shopping_center = $this->shoppingCenterRepository->getById($id);

                $shopping_center->approved = true;

                $shopping_center->update();

                return response()->json($shopping_center, 200);
            } catch (ShoppingCenterNotFoundException $exception) {
                return response()->json(['status' => 400, 'message' => 'Shopping center not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }

    /**
     * Disapproved shopping centers.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/shopping-centers/{id}/disapprove",
     *     description="Disapproved shopping center.",
     *     produces={"application/json"},
     *     tags={"shopping centers"},
     *     @SWG\Parameter(
     *         description="Shopping center id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns success message."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Shopping center not found."
     *     )
     * )
     */
    public function disapproveShoppingCenter($id)
    {
        if ($this->role == 'admin') {
            try {
                $shoppingCenter = $this->shoppingCenterRepository->getById($id);

                $this->shoppingCenterRepository->delete($id);

                return response()->json('Shopping center successfully disapproved.', 200);
            } catch (ShoppingCenterNotFoundException $exception) {
                return response()->json(['status' => 400, 'message' => 'Shopping center not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }

    /**
     * Returns count of unapproved shopping centers.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/shopping-centers/unapproved-count",
     *     description="Returns count of unapproved shopping centers.",
     *     produces={"application/json"},
     *     tags={"shopping centers"},
     *     @SWG\Response(
     *         response=200,
     *         description="Returns count of unapproved shopping centers."
     *     )
     * )
     */
    public function unapprovedShoppingCentersCount(Request $request)
    {
        if ($this->role == 'admin') {
            $unapprovedShoppingCentersCount = $this->shoppingCenterRepository->getUnapprovedShoppingCenters($request, true);

            return response()->json($unapprovedShoppingCentersCount, 200);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }

    /**
     * Upload logo.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/shopping-centers/{id}/upload-file",
     *     description="Upload sc logo.",
     *     produces={"application/json"},
     *     tags={"shopping centers"},
     *      @SWG\Parameter(
     *          description="Sc id",
     *          in="path",
     *          name="id",
     *          required=true,
     *          type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Logo",
     *         in="formData",
     *         name="logo",
     *         required=true,
     *         type="file",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Logo has been successfully uploaded."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Sc not found."
     *     )
     * )
     */
    public function uploadFile($id, LogoRequest $logoRequest, AreaRepository $areaRepository)
    {
        if ($this->role == 'admin') {
            try {
                $shoppingCenter = $this->shoppingCenterRepository->showById($id, null, $areaRepository);
            } catch (ShoppingCenterNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Shopping center not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else if ($this->role == 'sc-user') {
            $shoppingCenter = $this->shoppingCenterRepository->showById($id, $this->userId, $areaRepository);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

        $shoppingCenter = $this->shoppingCenterRepository->uploadLogo($logoRequest, $shoppingCenter);

        return response()->json($shoppingCenter);
    }

    /**
     * Removes logo.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Delete(
     *     path="/shopping-centers/{id}/remove-file",
     *     description="Deletes sc logo.",
     *     produces={"application/json"},
     *     tags={"shopping centers"},
     *      @SWG\Parameter(
     *          description="Sc id",
     *          in="path",
     *          name="id",
     *          required=true,
     *          type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Logo has been successfully deleted."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Sc not found."
     *     )
     * )
     */
    public function removeFile($id, AreaRepository $areaRepository)
    {
        if ($this->role == 'admin') {
            try {
                $shoppingCenter = $this->shoppingCenterRepository->showById($id, null, $areaRepository);
            } catch (ShoppingCenterNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Shopping center not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else if ($this->role == 'sc-user') {
            $shoppingCenter = $this->shoppingCenterRepository->showById($id, $this->userId, $areaRepository);
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

        $this->shoppingCenterRepository->removeLogo($shoppingCenter);
    }
}
