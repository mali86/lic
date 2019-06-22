<?php

namespace App\Http\Controllers;

use App\Contracts\Repositories\AreaRepository;
use App\Exceptions\Repositories\AreaBeingUsedException;
use App\Exceptions\Repositories\AreaNotFoundException;
use App\Exceptions\Repositories\UserNotFoundException;
use App\Http\Requests\AreaRequest;
use App\Models\Area;
use Carbon\Carbon;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;

class AreasController extends ApiController
{
    private $areaRepository;

    public function __construct(AreaRepository $areaRepository, Request $request)
    {
        $this->areaRepository = $areaRepository;

        $this->role = '';

        try {
            $key = config('app.JWT_key');

            $token = $request->header('Authorization');

            $decoded = (array) JWT::decode($token, $key, array('HS256'));

            $this->role = $decoded['role'];
        } catch (UserNotFoundException $userNotFoundException) {
            $this->role = '';
        } catch (\UnexpectedValueException $unexpectedValueException) {
            $this->role = '';
        }
    }

    /**
     * Display a listing of the areas.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/areas",
     *     description="Returns all areas.",
     *     produces={"application/json"},
     *     tags={"areas"},
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
     *         description="Search by area name.",
     *         in="query",
     *         name="search",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns all areas."
     *     )
     * )
     */
    public function index(Request $request)
    {
        $areas = $this->areaRepository->getAllAreas($request);

        return response()->json($areas, 200);
    }

    /**
     * Creates area.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/areas",
     *     description="Creates area.",
     *     produces={"application/json"},
     *     tags={"areas"},
     *      @SWG\Parameter(
     *         description="Area name",
     *         in="formData",
     *         name="name",
     *         required=true,
     *         type="string",
     *     ),
     *      @SWG\Parameter(
     *         description="State id",
     *         in="formData",
     *         name="state_id",
     *         required=true,
     *         type="integer"
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns new area."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function store(AreaRequest $areaRequest)
    {
        if ($this->role != 'admin' && $this->role != 'sc-user') {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
        $area = new Area();

        $area->name = $areaRequest->input('name');
        $area->state_id = $areaRequest->input('state_id');

        $this->areaRepository->store($area);

        return response()->json($area, 200);
    }

    /**
     * Display area.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/areas/{id}",
     *     description="Returns area.",
     *     produces={"application/json"},
     *     tags={"areas"},
     *     @SWG\Parameter(
     *         description="Area id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns area."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Area not found."
     *     )
     * )
     */
    public function show($id)
    {
        if ($this->role != 'admin' && $this->role != 'sc-user') {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
        try {
            $area = $this->areaRepository->getById($id);
        } catch (AreaNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Area not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return response()->json($area, 200);
    }

    /**
     * Updates area.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Put(
     *     path="/areas/{id}",
     *     description="Updates area.",
     *     produces={"application/json"},
     *     tags={"areas"},
     *     @SWG\Parameter(
     *         description="Area id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *      @SWG\Parameter(
     *         description="Area name",
     *         in="formData",
     *         name="name",
     *         required=true,
     *         type="string",
     *     ),
     *      @SWG\Parameter(
     *         description="State id",
     *         in="formData",
     *         name="state_id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Area has been successfully updated."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Area not found."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function update(AreaRequest $areaRequest, $id)
    {
        if ($this->role != 'admin' && $this->role != 'sc-user') {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
        try {
            $area = $this->areaRepository->getById($id, false);
        } catch (AreaNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Area not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        $area->name = $areaRequest->input('name');
        $area->state_id = $areaRequest->input('state_id');

        $this->areaRepository->update($area);

        return response()->json($area, 200);
    }

    /**
     * Removes area.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Delete(
     *     path="/areas/{id}",
     *     description="Deletes area.",
     *     produces={"application/json"},
     *     tags={"areas"},
     *      @SWG\Parameter(
     *          description="Area id",
     *          in="path",
     *          name="id",
     *          required=true,
     *          type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Area has been successfully deleted."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Area not found."
     *     ),
     *     @SWG\Response(
     *         response=403,
     *         description="Can not delete area. There are some shopping centers or merchants in it."
     *     )
     * )
     */
    public function destroy($id)
    {
        if ($this->role != 'admin' && $this->role != 'sc-user') {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
        try {
            $this->areaRepository->checkUsage($id);
        } catch (AreaBeingUsedException $e) {
            return response()->json(['status' => 403, 'message' => 'Can not delete area. There are some shopping centers or merchants in it.', 'timestamp' => Carbon::now()->toDateTimeString()], 403);
        }

        try {
            $this->areaRepository->delete($id);
        } catch (AreaNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Area not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return response()->json('Area has been successfully deleted.', 200);
    }
}
