<?php

namespace App\Repositories;

use App\Contracts\Repositories\AreaRepository;
use App\Contracts\Repositories\ShoppingCenterRepository;
use App\Exceptions\Repositories\ShoppingCenterBeingUsedException;
use App\Exceptions\Repositories\ShoppingCenterNotFoundException;
use App\Models\Merchant;
use App\Models\ScWorkingHour;
use App\Models\ShoppingCenter;
use App\Models\Area;
use App\Models\ShoppingCenterUser;
use App\Utilities\PasswordResetSendEmail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use phpDocumentor\Reflection\Types\Object_;
use Image;

class EloquentShoppingCenterRepository implements ShoppingCenterRepository
{
    public function getAllShoppingCenters(Request $request, $count = false, AreaRepository $areaRepository, $userId = null)
    {
        if ($userId) {
            $collection = ShoppingCenter::join('areas', 'areas.id', '=', 'shopping_centers.area_id')
                ->join('shopping_center_users', 'shopping_center_users.shopping_center_id', '=', 'shopping_centers.id')
                ->leftJoin('merchants', 'merchants.shopping_center_id', '=', 'shopping_centers.id')
                ->leftJoin('coupons', 'coupons.merchant_id', '=', 'merchants.id')
                ->where('shopping_centers.approved', 1)
                ->where('shopping_center_users.user_id', '=', $userId);
        } else {
            $collection = ShoppingCenter::join('areas', 'areas.id', '=', 'shopping_centers.area_id')
                ->leftJoin('merchants', 'merchants.shopping_center_id', '=', 'shopping_centers.id')
                ->leftJoin('coupons', 'coupons.merchant_id', '=', 'merchants.id')
                ->where('shopping_centers.approved', 1);
        }

        if ($request->input('sort_by') && ($request->input('sort_by') == 'area_name' || $request->input('sort_by') == '-area_name')) {
            if (substr($request->input('sort_by'), 0, 1) == '-') {
                $collection->orderBy('areas.name', 'desc');
            } else {
                $collection->orderBy('areas.name');
            }
        } else if ($request->input('sort_by')){
            if (substr($request->input('sort_by'), 0, 1) == '-') {
                $collection->orderBy('shopping_centers.' . substr($request->input('sort_by'), 1), 'desc');
            } else {
                $collection->orderBy('shopping_centers.' . $request->input('sort_by'), 'asc');
            }
        }

        if ($request->input('search')) {
            $collection->where('shopping_centers.name', 'LIKE', '%' . $request->input('search') . '%');

        }

        if ($request->input('area')) {
            $collection->where('shopping_centers.area_id', '=', $request->input('area'));
        }

        if ($count) {
            return count($collection->selectRaw('shopping_centers.*, count(coupons.id) as coupons')
                ->groupBy('shopping_centers.id')
                ->get());
        }


        if ($request->input('limit') && $request->input('page')) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }

        if ($request->input('letter')) {
            $collection->orderBy('shopping_centers.name', $request->input('letter'));
        }

        if ($request->input('end_date')) {
            $collection->orderBy(DB::raw('ISNULL(coupons.end_date), coupons.end_date'), $request->input('end_date'));
        }

        $shoppingCenters = $collection->selectRaw('shopping_centers.*, count(coupons.id) as coupons, areas.name as area_name')
            ->groupBy('shopping_centers.id')
            ->get();

        foreach ($shoppingCenters as $shoppingCenter) {
            $workingHours = ScWorkingHour::where('shopping_center_id', $shoppingCenter->id)->first();
            if ($workingHours) {
                $shoppingCenter->working_hours = $this->parseWorkingHours($workingHours);
            }
        }
        $data['shopping_centers'] = $shoppingCenters;
        $data['total'] = $this->getAllShoppingCenters($request, true, $areaRepository, $userId);

        return $data;
    }

    public function getShoppingCenters($search = null)
    {
        if ($search) {
            return ShoppingCenter::where('name', 'LIKE', '%' . $search . '%')->take(10)->get();
        } else {
            return ShoppingCenter::take(10)->get();
        }
    }

    public function showById($id, $userId = null, AreaRepository $areaRepository)
    {
        if ($userId) {
            $shoppingCenter = ShoppingCenter::join('shopping_center_users', 'shopping_center_users.shopping_center_id', '=', 'shopping_centers.id')
                ->where('shopping_centers.id', '=', $id)->where('shopping_center_users.user_id', '=', $userId)
                ->selectRaw('shopping_centers.*, shopping_center_users.user_id as user_id')
                ->first();
        } else {
            $shoppingCenter = ShoppingCenter::find($id);
        }
        if($shoppingCenter) {
            $workingHours = ScWorkingHour::where('shopping_center_id', $id)->first();

            if ($workingHours) {
                $shoppingCenter->working_hours = $this->parseWorkingHours($workingHours);
            }

            if ($shoppingCenter->area_id) {
                $area = $areaRepository->getById($shoppingCenter->area_id);
                $shoppingCenter->area_name = $area->name;
            }

            return $shoppingCenter;
        } else {
            throw new ShoppingCenterNotFoundException();
        }
    }

    public function getById($id, $userId = null)
    {
        if ($userId) {
            $shoppingCenter = ShoppingCenter::join('shopping_center_users', 'shopping_center_users.shopping_center_id', '=', 'shopping_centers.id')
                ->where('shopping_centers.id', '=', $id)->where('shopping_center_users.user_id', '=', $userId)
                ->selectRaw('shopping_centers.*, shopping_center_users.user_id as user_id')
                ->first();
        } else {
            $shoppingCenter = ShoppingCenter::find($id);
        }
        if($shoppingCenter) {
            return $shoppingCenter;
        } else {
            throw new ShoppingCenterNotFoundException();
        }
    }

    public function getWorkingHourById($id)
    {
        return ScWorkingHour::where('shopping_center_id', $id)->first();
    }

    public function getLikeName($name, $limit = null, $distance = null, $lat = null, $lon = null, $page = null, $filters = null, $count = false)
    {
        if ($filters) {
            $shoppingCenters = ShoppingCenter::join('merchants', 'merchants.shopping_center_id', '=', 'shopping_centers.id')
                ->join('merchant_categories', 'merchant_categories.merchant_id', '=', 'merchants.id')
                ->whereIn('merchant_categories.category_id', $filters);

            $shoppingCenters->where('shopping_centers.approved', '=', 1)->distinct('shopping_centers.id');
        } else {
            $shoppingCenters = ShoppingCenter::where('shopping_centers.approved', '=', 1)->distinct('shopping_centers.id');
        }

        if ($name) {
            $shoppingCenters->where('shopping_centers.name', 'LIKE', '%' . $name . "%");
        }

        if ($lat && $lon) {
            $shoppingCenters->selectRaw('shopping_centers.*, ROUND(3956 * 2 *
                ASIN(SQRT( POWER(SIN(('. $lat .' - shopping_centers.lat)*pi()/180/2),2)
                    +COS('. $lat .' *pi()/180 )*COS(shopping_centers.lat*pi()/180)
                    *POWER(SIN(('. $lon .'-shopping_centers.lon)*pi()/180/2),2))), 2) 
                as distance');
            if ($distance) {
                $shoppingCenters->whereRaw('(3956 * 2 *
                ASIN(SQRT( POWER(SIN(('. $lat .' - shopping_centers.lat)*pi()/180/2),2)
                    +COS('. $lat .' *pi()/180 )*COS(shopping_centers.lat*pi()/180)
                    *POWER(SIN(('. $lon .'-shopping_centers.lon)*pi()/180/2),2)))) < ' . $distance );
                $shoppingCenters->selectRaw('shopping_centers.*');
            }
            if (!$count) {
                $shoppingCenters->orderBy('distance');
            }
        } else {
            $shoppingCenters->selectRaw('shopping_centers.*');
        }

        if ($page && $limit && !$count) {
            $shoppingCenters->skip(($page - 1) * $limit)->take($limit);
        } else if ($limit && !$count) {
            $shoppingCenters->take($limit);
        }

        if ($count) {
            return count($shoppingCenters->get());
        }

        $shoppingCenters = $shoppingCenters->orderBy('shopping_centers.name')->get();

        foreach ($shoppingCenters as $key => $shoppingCenter) {
            $shoppingCenters[$key]->coupons = ShoppingCenter::join('merchants', 'merchants.shopping_center_id', '=', 'shopping_centers.id')
                ->join('coupons', 'coupons.merchant_id', '=', 'merchants.id')
                ->where('shopping_centers.approved', 1)
                ->where('shopping_centers.id', $shoppingCenter->id)->count();

            $workingHours = ScWorkingHour::where('shopping_center_id', $shoppingCenter->id)->first();
            if ($workingHours) {
                $shoppingCenters[$key]->working_hours = $this->parseWorkingHours($workingHours);
            }
        }
        return $shoppingCenters;
    }

    public function getShoppingCentersByAreaId($id, $lat = null, $lon = null, $filters = null, Request $request, $count = false)
    {
        if ($count) {
            $collection = ShoppingCenter::where('shopping_centers.area_id', '=', $id)
                ->where('shopping_centers.approved', '=', 1);
            $selectString = 'shopping_centers.*';
        } else {
            $collection = ShoppingCenter::leftJoin('merchants', 'merchants.shopping_center_id', '=', 'shopping_centers.id')
                ->leftJoin('coupons', 'coupons.merchant_id', '=', 'merchants.id')
                ->where('shopping_centers.area_id', $id)
                ->where('shopping_centers.approved', 1);
            $selectString = 'shopping_centers.*, count(coupons.id) as coupons';
        }

        if ($request->input('sort_by')) {
            if (substr($request->input('sort_by'), 0, 1) == '-') {
                $collection->orderBy('shopping_centers.' . substr($request->input('sort_by'), 1), 'desc');
            } else {
                $collection->orderBy('shopping_centers.' . $request->input('sort_by'), 'asc');
            }
        }

        if ($request->input('limit') && $request->input('page') && (!$count)) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }

        if (!empty($lat) && !empty($lon)) {
            $selectString .= ', ROUND(3956 * 2 *
                ASIN(SQRT( POWER(SIN(('. $lat .' - shopping_centers.lat)*pi()/180/2),2)
                    +COS('. $lat .'*pi()/180 )*COS(shopping_centers.lat*pi()/180)
                    *POWER(SIN(('. $lon .'-shopping_centers.lon)*pi()/180/2),2))), 2) 
                as distance';
            $collection->orderBy('distance', 'ASC');
        }

        if ($filters) {
            if ($count) {
                $collection->join('merchants', 'merchants.shopping_center_id', '=', 'shopping_centers.id');
            }
            $collection->join('merchant_categories', 'merchant_categories.merchant_id', '=', 'merchants.id')
                        ->whereIn('merchant_categories.category_id', $filters);
        }

        if ($count) {
            return count($collection->groupBy('shopping_centers.id')->selectRaw($selectString)->distinct()->orderBy('shopping_centers.name')->get());
        }
        $collection->groupBy('shopping_centers.id')->selectRaw($selectString)->distinct();

        if ($request->input('letter')) {
            $collection->orderBy('shopping_centers.name', $request->input('letter'));
        }

        if ($request->input('end_date')) {
            $collection->orderBy(DB::raw('ISNULL(coupons.end_date), coupons.end_date'), $request->input('end_date'));
        }

        $shoppingCenters = $collection->get();


        foreach ($shoppingCenters as $shoppingCenter) {
            $workingHours = ScWorkingHour::where('shopping_center_id', $shoppingCenter->id)->first();
            if ($workingHours) {
                $shoppingCenter->working_hours = $this->parseWorkingHours($workingHours);
            }
        }

        $data['shopping_centers'] = $shoppingCenters;
        $data['total'] = $this->getShoppingCentersByAreaId($id, $lat, $lon, $filters, $request, true);

        return $data;
    }

    public function getShoppingCentersByAreaName($name, $lat = null, $lon = null, $filters = null)
    {
        $collection = Area::join('shopping_centers', 'shopping_centers.area_id', '=', 'areas.id')
                          ->leftJoin('merchants', 'merchants.shopping_center_id', '=', 'shopping_centers.id')
                          ->leftJoin('coupons', 'coupons.merchant_id', '=', 'merchants.id')
                          ->where('areas.name', $name)
                          ->where('shopping_centers.approved', 1);
        $selectString = 'shopping_centers.*, count(coupons.id) as coupons';
        if (!empty($lat) && !empty($lon)) {
            $selectString .= ', ROUND(3956 * 2 *
                ASIN(SQRT( POWER(SIN(('. $lat .' - shopping_centers.lat)*pi()/180/2),2)
                    +COS('. $lat .'*pi()/180 )*COS(shopping_centers.lat*pi()/180)
                    *POWER(SIN(('. $lon .'-shopping_centers.lon)*pi()/180/2),2))), 2) 
                as distance';
            $collection->orderBy('distance', 'ASC');
        }

        if ($filters) {
            $collection->join('merchants', 'merchants.shopping_center_id', '=', 'shopping_centers.id')
                ->join('merchant_categories', 'merchant_categories.merchant_id', '=', 'merchants.id')
                ->whereIn('merchant_categories.category_id', $filters);
        }
        $collection->groupBy('shopping_centers.id')->selectRaw($selectString)->distinct();
        $shoppingCenters = $collection->orderBy('shopping_centers.name')->get();

        foreach ($shoppingCenters as $shoppingCenter) {
            $workingHours = ScWorkingHour::where('shopping_center_id', $shoppingCenter->id)->first();
            if ($workingHours) {
                $shoppingCenter->working_hours = $this->parseWorkingHours($workingHours);
            }
        }

        return $shoppingCenters;
    }

    public function store(ShoppingCenter $shoppingCenter)
    {
        $shoppingCenter->save();
        return $shoppingCenter;
    }

    public function storeWorkingHour(ScWorkingHour $scWorkingHour)
    {
        $scWorkingHour->save();
        return $scWorkingHour;
    }

    public function update(ShoppingCenter $shoppingCenter)
    {
        $shoppingCenter->update();
    }

    public function updateWorkingHours(ScWorkingHour $scWorkingHour)
    {
        $scWorkingHour->update();
    }

    public function delete($id)
    {
        $shoppingCenter = ShoppingCenter::find($id);
        if($shoppingCenter) {
            $shoppingCenter->delete();
        } else {
            throw new ShoppingCenterNotFoundException();
        }
    }

    public function checkUsage($id)
    {
        $merchant = Merchant::where('shopping_center_id', $id)->first();
        if ($merchant) {
            throw new ShoppingCenterBeingUsedException();
        } else {
            return true;
        }
    }

    public function parseWorkingHours(ScWorkingHour $workingHours)
    {
        $workingDaysArray = Array();
        foreach (Array('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') as $day) {
            $tmpFrom = $day . '_from';
            $tmpTo = $day . '_to';
            $tmpDay = ucfirst($day);
            if (!empty($workingHours->$tmpFrom) || !empty($workingHours->$tmpTo)) {
                $object = new Object_();
                $timeFrom = Carbon::createFromTime(explode(':', $workingHours->$tmpFrom)[0], explode(':', $workingHours->$tmpFrom)[1]);
                $timeTo = Carbon::createFromTime(explode(':', $workingHours->$tmpTo)[0], explode(':', $workingHours->$tmpTo)[1]);

                if ($timeFrom->hour > 12 || $timeFrom->hour == 0) {
                    $timeFrom->subHour(12);
                    $stringFrom = ' PM';
                } else {
                    $stringFrom = ' AM';
                }

                if ($timeTo->hour > 12 || $timeTo->hour == 0) {
                    $timeTo->subHour(12);
                    $stringTo = ' PM';
                } else {
                    $stringTo = ' AM';
                }

                if ($timeFrom->hour < 10) {
                    $timeFromHour = '0'. $timeFrom->hour;
                } else {
                    $timeFromHour = $timeFrom->hour;
                }

                if ($timeFrom->minute < 10) {
                    $timeFromMinute = '0'. $timeFrom->minute;
                } else {
                    $timeFromMinute = $timeFrom->minute;
                }

                if ($timeTo->hour < 10) {
                    $timeToHour = '0'. $timeTo->hour;
                } else {
                    $timeToHour = $timeTo->hour;
                }

                if ($timeFrom->minute < 10) {
                    $timeToMinute = '0'. $timeFrom->minute;
                } else {
                    $timeToMinute = $timeFrom->minute;
                }

                $realTimeFrom = $timeFromHour . ':' . $timeFromMinute . $stringFrom;
                $realTimeTo = $timeToHour . ':' . $timeToMinute . $stringTo;

                $object->day = $tmpDay;
                $object->from = $realTimeFrom;
                $object->to = $realTimeTo;

                $workingDaysArray [] = $object;
            } else {
                $object = new Object_();

                $object->day = $tmpDay;
                $object->from = null;
                $object->to = null;

                $workingDaysArray [] = $object;
            }
        }

        return $workingDaysArray;
    }

    public function getUnapprovedShoppingCenters(Request $request, $count = false, $all = false)
    {
        $collection = ShoppingCenter::where('approved', '=', 0);

        if ($request->input('sort_by')) {
            if (substr($request->input('sort_by'), 0, 1) == '-') {
                $collection->orderBy(substr($request->input('sort_by'), 1), 'desc');
            } else {
                $collection->orderBy($request->input('sort_by'), 'asc');
            }
        }

        if ($request->input('search')) {
            $collection->where('name', 'LIKE', '%' .  $request->input('search') . '%');
        }


        if ($request->input('limit') && $request->input('page') && !($count && $all)) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }

        if ($count) {
            return $collection->count();
        } else {
            $data['shopping_centers'] = $collection->get();
            $data['total'] = $this->getUnapprovedShoppingCenters($request, true, true);
            return $data;
        }
    }

    public function removeUser($userId) {
        ShoppingCenterUser::where('user_id', $userId)->delete();
    }

    public function newShoppingCenters()
    {
        $startOfWeek = Carbon::now()->startOfWeek()->format('Y-m-d H:i:s');

        $count = ShoppingCenter::where('created_at', '>', $startOfWeek)->count();

        return $count;
    }

    public function uploadLogo(Request $request, $shoppingCenter)
    {
        $file = $request->file('logo');

        if ($file) {//TODO: upload file to amazon
            $extension = $file->getClientOriginalExtension();

            $path = $file->storeAs('/files/sc-logos/'.$shoppingCenter->id, $shoppingCenter->id . time() . '.' .$extension);

            $img = Image::make($path)->resize(250, 250);

            $img->save($path);

            $shoppingCenter->logo = asset($path);

            unset($shoppingCenter->working_hours);
            unset($shoppingCenter->area_name);
            $shoppingCenter->update();

            return $shoppingCenter;
        }
    }

    public function removeLogo($shoppingCenter)
    {
        //TODO: delete file from Amazon later
        $shoppingCenter->logo = null;
        
        unset($shoppingCenter->working_hours);
        unset($shoppingCenter->area_name);
        $shoppingCenter->update();
    }
}