<?php

namespace App\Http\Controllers;

use App\Contracts\Repositories\AreaRepository;
use App\Contracts\Repositories\MerchantRepository;
use App\Contracts\Repositories\ShoppingCenterRepository;
use App\Http\Requests\SearchRequest;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    private $areaRepository;
    private $shoppingCenterRepository;
    private $merchantRepository;

    public function __construct(AreaRepository $areaRepository, ShoppingCenterRepository $shoppingCenterRepository, MerchantRepository $merchantRepository)
    {
        $this->areaRepository = $areaRepository;
        $this->shoppingCenterRepository = $shoppingCenterRepository;
        $this->merchantRepository = $merchantRepository;
    }

    /**
     * Returns areas, shopping centers and merchants.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/search",
     *     description="Returns merchant.",
     *     produces={"application/json"},
     *     tags={"search"},
     *     @SWG\Parameter(
     *         description="Name to search for.",
     *         in="query",
     *         name="search",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Limit for search responses.",
     *         in="query",
     *         name="limit",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Page.",
     *         in="query",
     *         name="page",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Wanted distance for shopping centers and merchants.",
     *         in="query",
     *         name="distance",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Users latitude. Required if distance provided.",
     *         in="query",
     *         name="lat",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Users longitude. Required if distance provided.",
     *         in="query",
     *         name="lon",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Array with category ids.",
     *         in="query",
     *         name="filters[]",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns merchant."
     *     )
     * )
     */
    public function search(SearchRequest $request)
    {
        $limit = null;
        $page = null;
        $distance = null;
        $lat = null;
        $lon = null;

        if (!empty($request->input('limit'))) {
            $limit = $request->input('limit');
        }

        if (!empty($request->input('page'))) {
            $page = $request->input('page');
        }

        if (!empty($request->input('distance'))) {
            $distance = $request->input('distance');
        }

        if (!empty($request->input('lat')) && !empty($request->input('lon'))) {
            $lat = $request->input('lat');
            $lon = $request->input('lon');
        }

        $areas = $this->areaRepository->getLikeName($request->input('search'), $limit, $page, $request->input('filters'));
        $totalAreas = $this->areaRepository->getLikeName($request->input('search'), $limit, $page, $request->input('filters'), true);
        $shoppingCenters = $this->shoppingCenterRepository->getLikeName($request->input('search'), $limit, $distance, $lat, $lon, $page, $request->input('filters'));
        $totalShoppingCenters = $this->shoppingCenterRepository->getLikeName($request->input('search'), $limit, $distance, $lat, $lon, $page, $request->input('filters'), true);
        $merchants = $this->merchantRepository->getLikeName($request->input('search'), $limit, $distance, $lat, $lon, $page, $request->input('filters'));
        $totalMerchants = $this->merchantRepository->getLikeName($request->input('search'), $limit, $distance, $lat, $lon, $page, $request->input('filters'), true);

        $response['areas'] = $areas;
        $response['shoppingCenters'] = $shoppingCenters;
        $response['merchants'] = $merchants;
        $response['totalAreas'] = $totalAreas;
        $response['totalShoppingCenters'] = $totalShoppingCenters;
        $response['totalMerchants'] = $totalMerchants;

        return response()->json($response, 200);
    }

}
