<?php

namespace App\Repositories;

use App\Contracts\Repositories\MerchantRepository;
use App\Exceptions\Repositories\MerchantNotFoundException;
use App\Models\Area;
use App\Models\Coupon;
use App\Models\CouponFile;
use App\Models\Merchant;
use App\Models\MerchantCategory;
use App\Models\MerchantCoupon;
use App\Models\MerchantUser;
use App\Models\ShoppingCenter;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Image;

class EloquentMerchantRepository implements MerchantRepository
{
    public function getAllMerchants()
    {
        return Merchant::all();
    }

    public function getMerchants(Request $request)
    {
        $collection = ShoppingCenter::join('merchants', 'merchants.shopping_center_id', '=', 'shopping_centers.id')
            ->leftJoin('coupons', 'merchants.id', '=', 'coupons.merchant_id')
            ->leftJoin('merchant_categories', 'merchant_categories.merchant_id', '=', 'merchants.id')
            ->where('merchants.area_id', '!=', null);

        if ($request->input('sort_by')) {
            if (substr($request->input('sort_by'), 0, 1) == '-') {
                $collection->orderBy('merchants.' . substr($request->input('sort_by'), 1), 'desc');
            } else {
                $collection->orderBy('merchants.' . $request->input('sort_by'), 'asc');
            }
        }

        if (!empty($request->input('filters'))) {
            $collection//->join('merchant_categories', 'merchant_categories.merchant_id', '=', 'merchants.id')
                ->whereIn('merchant_categories.category_id', $request->input('filters'));
        } else if ($request->input('category_id')) {
            $collection->where('merchant_categories.category_id', '=', $request->input('category_id'));
        }

        if ($request->input('search')) {
            $collection->where(function($query) use ($request) {
                $query->where('merchants.name', 'LIKE', '%' .  $request->input('search') . '%');
                $query->orWhere('merchants.shopping_center_name', 'LIKE', '%' . $request->input('search') . '%');
                $query->orWhere('shopping_centers.name', 'LIKE', '%' . $request->input('search') . '%');
            });
        }

        if ($request->input('search') && $request->input('filters')) {
            $data['total'] = ShoppingCenter::join('merchants', 'merchants.shopping_center_id', '=', 'shopping_centers.id')
                ->leftJoin('merchant_categories', 'merchant_categories.merchant_id', '=', 'merchants.id')
                ->where('merchants.area_id', '!=', null)
                ->where('merchants.shopping_center_id', '!=', null)
                ->whereIn('merchant_categories.category_id', $request->input('filters'))
                ->where(function($query) use ($request) {
                    $query->where('merchants.name', 'LIKE', '%' . $request->input('search') . '%')
                        ->orWhere('merchants.shopping_center_name', 'LIKE', '%' . $request->input('search') . '%')
                        ->orWhere('shopping_centers.name', 'LIKE', '%' . $request->input('search') . '%');
                })
                ->count();
        } else if($request->input('filters')) {
            $data['total'] = Merchant::join('merchant_categories', 'merchant_categories.merchant_id', '=', 'merchants.id')
                ->whereIn('merchant_categories.category_id', $request->input('filters'))
                ->where('merchants.area_id', '!=', null)
                ->where('merchants.shopping_center_id', '!=', null)
                ->count();
        } else if ($request->input('search') && $request->input('category_id')) {
            $data['total'] = ShoppingCenter::join('merchants', 'merchants.shopping_center_id', '=', 'shopping_centers.id')
                ->leftJoin('merchant_categories', 'merchant_categories.merchant_id', '=', 'merchants.id')
                ->where('merchant_categories.category_id', '=', $request->input('category_id'))
                ->where('merchants.shopping_center_id', '!=', null)
                ->where(function($query) use ($request) {
                    $query->where('merchants.name', 'LIKE', '%' . $request->input('search') . '%')
                        ->orWhere('merchants.shopping_center_name', 'LIKE', '%' . $request->input('search') . '%')
                        ->orWhere('shopping_centers.name', 'LIKE', '%' . $request->input('search') . '%');
                })
                ->count();
        } else if ($request->input('search')) {
            $data['total'] = ShoppingCenter::join('merchants', 'merchants.shopping_center_id', '=', 'shopping_centers.id')
                ->where('merchants.shopping_center_id', '!=', null)
                ->where(function($query) use ($request) {
                    $query->where('merchants.name', 'LIKE', '%' . $request->input('search') . '%')
                        ->orWhere('merchants.shopping_center_name', 'LIKE', '%' . $request->input('search') . '%')
                        ->orWhere('shopping_centers.name', 'LIKE', '%' . $request->input('search') . '%');
                })
                ->count();
        } else if($request->input('category_id')) {
            $data['total'] = Merchant::join('merchant_categories', 'merchant_categories.merchant_id', '=', 'merchants.id')
                ->where('merchant_categories.category_id', '=', $request->input('category_id'))
                ->count();
        }
        else {
            $data['total'] = $this->count();
        }

        if ($request->input('limit') && $request->input('page')) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }

        if ($request->input('lat') && $request->input('lon')) {
            $collection->where('merchants.lon', '!=', NULL)
                ->selectRaw('merchants.*, count(coupons.merchant_id) as coupons, count(merchants.id) as stores, ROUND(3956 * 2 *
                ASIN(SQRT( POWER(SIN(('. $request->input('lat') .' - merchants.lat)*pi()/180/2),2)
                    +COS('. $request->input('lat') .'*pi()/180 )*COS(merchants.lat*pi()/180)
                    *POWER(SIN(('. $request->input('lon') .'-merchants.lon)*pi()/180/2),2))), 2) 
                    as distance')
                ->orderBy('distance', 'ASC')
                ->groupBy('merchants.id');
        } else {
            $collection->selectRaw('merchants.*, count(coupons.merchant_id) as coupons, count(merchants.id) as stores')
                ->groupBy('merchants.id');
        }

        if ($request->input('letter')) {
            $collection->orderBy('merchants.name', $request->input('letter'));
        }

        if ($request->input('end_date')) {
            $collection->orderBy(DB::raw('ISNULL(coupons.end_date), coupons.end_date'), $request->input('end_date'));
        }

        $data['merchants'] = $collection->get();
        foreach ($data['merchants'] as $key => $merchant) {
            $categories = MerchantCategory::where('merchant_categories.merchant_id', $merchant->id)
                ->join('categories', 'categories.id', '=', 'merchant_categories.category_id')
                ->select('categories.id', 'categories.name', 'categories.logo')
                ->get();

            $activeCoupons = Coupon::where('merchant_id', '=', $merchant->id)->where('active', '=', 1)->count();

            $data['merchants'][$key]->categories = $categories;
            $data['merchants'][$key]->active_coupons = $activeCoupons;
            if ($data['merchants'][$key]->area_id) {
                $data['merchants'][$key]->area_name = Area::find($merchant->area_id)->name;
            }
            if ($data['merchants'][$key]->shopping_center_id) {
                $data['merchants'][$key]->shopping_center_name = ShoppingCenter::find($merchant->shopping_center_id)->name;
            }
        }

        return $data;
    }

    public function getLikeName($name, $limit = null, $distance = null, $lat = null, $lon = null, $page = null, $filters = null, $count = false)
    {

        $merchants = Merchant::leftJoin('coupons', 'merchants.id', '=', 'coupons.merchant_id')
                              ->where('merchants.approved', '=', 1)->distinct('merchants.id');


        if ($name) {
            $merchants = $merchants->where('merchants.name', 'LIKE', '%' . $name . "%");
        }

        $merchants->selectRaw('merchants.*, count(coupons.merchant_id) as coupons')->groupBy('merchants.id');

        if ($lat && $lon) {
            $merchants->selectRaw('merchants.*, count(coupons.merchant_id) as coupons, ROUND(3956 * 2 *
                ASIN(SQRT( POWER(SIN(('. $lat .' - merchants.lat)*pi()/180/2),2)
                    +COS('. $lat .' *pi()/180 )*COS(merchants.lat*pi()/180)
                    *POWER(SIN(('. $lon .'-merchants.lon)*pi()/180/2),2))), 2) 
                as distance');
            if ($distance) {
                $merchants->whereRaw('(3956 * 2 *
                ASIN(SQRT( POWER(SIN(('. $lat .' - merchants.lat)*pi()/180/2),2)
                    +COS('. $lat .' *pi()/180 )*COS(merchants.lat*pi()/180)
                    *POWER(SIN(('. $lon .'-merchants.lon)*pi()/180/2),2)))) < ' . $distance );
            }

            $merchants->orderBy('distance');
        }

        if ($filters) {
            $merchants->join('merchant_categories', 'merchant_categories.merchant_id', '=', 'merchants.id')
                ->whereIn('merchant_categories.category_id', $filters);
        }

        if ($limit && $page && !$count) {
            $merchants->skip(($page-1) * $limit)->take($limit);
        } else if ($limit && !$count) {
            $merchants->take($limit);
        }

        if ($count) {
            return count($merchants->get());
        }

        $data = $merchants->orderBy('merchants.name')->get();

        foreach ($data as $key => $merchant) {
            $data[$key]->coupons = Merchant::join('coupons', 'merchants.id', '=', 'coupons.merchant_id')
                ->where('merchants.id', '=', $merchant->id)
                ->count();
        }

        return $data;
    }

    public function count()
    {
        return Merchant::where('shopping_center_id', '!=', null)->count();
    }

    public function countByUserId($userId)
    {
        return Merchant::where('user_id', '=', $userId)->count();
    }

    public function getMerchantsByUserId($userId, Request $request)
    {
        $collection = ShoppingCenter::rightJoin('merchants', 'merchants.shopping_center_id', '=', 'shopping_centers.id')
                    ->join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
                    ->leftjoin('coupons', 'merchants.id', '=', 'coupons.merchant_id')
                    ->where('merchant_users.user_id', '=', $userId);

        if ($request->input('sort_by')) {
            if (substr($request->input('sort_by'), 0, 1) == '-') {
                $collection->orderBy('merchants.' . substr($request->input('sort_by'), 1), 'desc');
            } else {
                $collection->orderBy('merchants.' . $request->input('sort_by'), 'asc');
            }
        }

        if (!empty($request->input('filters'))) {
            $collection->join('merchant_categories', 'merchant_categories.merchant_id', '=', 'merchants.id')
                ->whereIn('merchant_categories.category_id', $request->input('filters'));
        }

        if ($request->input('search')) {
            $collection->where(function($query) use ($request) {
                $query->where('merchants.name', 'LIKE', '%' .  $request->input('search') . '%');
                $query->orWhere('merchants.shopping_center_name', 'LIKE', '%' . $request->input('search') . '%');
                $query->orWhere('shopping_centers.name', 'LIKE', '%' . $request->input('search') . '%');
            });
        }

        $data['total'] = $collection->count();
        if ($request->input('limit') && $request->input('page')) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }
        $collection->selectRaw('merchants.*, count(coupons.id) as coupons')->groupBy('merchants.id');
        $data['merchants'] = $collection->get();

        foreach ($data['merchants'] as $key => $merchant) {
            $categories = MerchantCategory::where('merchant_categories.merchant_id', $merchant->id)
                ->join('categories', 'categories.id', '=', 'merchant_categories.category_id')
                ->select('categories.id', 'categories.name', 'categories.logo')
                ->get();

            $merchant->categories = $categories;
            $merchant->area_name = Area::find($merchant->area_id)->name;
            if ($merchant->shopping_center_id) {
                $merchant->shopping_center_name = ShoppingCenter::find($merchant->shopping_center_id)->name;
            }
        }



        return $data;
    }

    public function getMerchantsBySCUserId($userId, Request $request)
    {
        $collection = Merchant::join('shopping_centers', 'shopping_centers.id', '=', 'merchants.shopping_center_id')
                              ->join('shopping_center_users', 'shopping_centers.id', '=', 'shopping_center_users.shopping_center_id')
                              ->leftjoin('coupons', 'merchants.id', '=', 'coupons.merchant_id')
                    ->where('shopping_center_users.user_id', '=', $userId)
                    ->where('merchants.area_id', '!=', null);

        if ($request->input('sort_by')) {
            if (substr($request->input('sort_by'), 0, 1) == '-') {
                $collection->orderBy('merchants.' . substr($request->input('sort_by'), 1), 'desc');
            } else {
                $collection->orderBy('merchants.' . $request->input('sort_by'), 'asc');
            }
        }

        if (!empty($request->input('filters'))) {
            $collection->join('merchant_categories', 'merchant_categories.merchant_id', '=', 'merchants.id')
                ->whereIn('merchant_categories.category_id', $request->input('filters'));
        }

        if ($request->input('search')) {
            $collection->where(function($query) use ($request) {
                $query->where('merchants.name', 'LIKE', '%' .  $request->input('search') . '%');
                $query->orWhere('merchants.shopping_center_name', 'LIKE', '%' . $request->input('search') . '%');
                $query->orWhere('shopping_centers.name', 'LIKE', '%' . $request->input('search') . '%');
            });
        }

        $data['total'] = $collection->count();
        if ($request->input('limit') && $request->input('page')) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }

        $data['merchants'] = $collection->selectRaw('merchants.*, count(coupons.id) as coupons')->groupBy('merchants.id')->get();

        foreach ($data['merchants'] as $key => $merchant) {
            $categories = MerchantCategory::where('merchant_categories.merchant_id', $merchant->id)
                ->join('categories', 'categories.id', '=', 'merchant_categories.category_id')
                ->select('categories.id', 'categories.name', 'categories.logo')
                ->get();

            $data['merchants'][$key]->categories = $categories;
            $data['merchants'][$key]->area_name = Area::find($merchant->area_id)->name;
            if ($data['merchants'][$key]->shopping_center_id) {
                $data['merchants'][$key]->shopping_center_name = ShoppingCenter::find($merchant->shopping_center_id)->name;
            }
        }



        return $data;
    } 

    public function getById($id, $userId = null, $allowCategories = true, $scUser = false)
    {

        if ($userId) {
            if ($scUser) {
                $merchant = Merchant::join('shopping_centers', 'shopping_centers.id', '=', 'merchants.shopping_center_id')
                    ->leftJoin('shopping_center_users', 'shopping_centers.id', '=', 'shopping_center_users.shopping_center_id')
                    ->where('merchants.id', '=', $id)
                    ->where('shopping_center_users.user_id', '=', $userId)
                    ->selectRaw('merchants.*')
                    ->first();
            } else {
                $merchant = Merchant::join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
                        ->where('merchants.id', '=', $id)
                        ->where('merchant_users.user_id', '=', $userId)->first();
            }
        } else {
            $merchant = Merchant::find($id);
        }

        if ($merchant) {
            if ($allowCategories) {
                $categories = MerchantCategory::where('merchant_categories.merchant_id', $id)
                    ->join('categories', 'categories.id', '=', 'merchant_categories.category_id')
                    ->select('categories.id', 'categories.name', 'categories.logo')
                    ->get();
                $merchant->categories = $categories;
            }
            return $merchant;
        } else {
            throw new MerchantNotFoundException();
        }
    }

    public function store(Request $merchantRequest, $shoppingCenterId, $lat, $lon, $userId = null)
    {
        $merchant = new Merchant();

        if ($shoppingCenterId > 0) {
            $merchant->shopping_center_id = $shoppingCenterId;
        }
        $merchant->lat = $lat;
        $merchant->lon = $lon;

        $merchant = $this->assignCommonValues($merchant, $merchantRequest, $userId);

        return $merchant;
    }

    public function update(Merchant $merchant, Request $merchantRequest)
    {
        $merchant = $this->assignCommonValues($merchant, $merchantRequest);

        $merchant->shopping_center_id = $merchantRequest->input('shopping_center_id');

        $merchant->update();

        return $merchant;
    }

    public function delete($id, $userId = null, $scUser = false)
    {
        $merchant = $this->getById($id, $userId, true, $scUser);
        if ($merchant) {
            MerchantCategory::where('merchant_id', $id)->delete();
            CouponFile::join('coupons', 'coupons.id', '=', 'coupon_files.coupon_id')
                ->where('coupons.merchant_id', $id)->selectRaw('coupon_files.*')->delete();
            Coupon::where('merchant_id', $id)->delete();
            $merchant->delete();
        } else {
            throw new MerchantNotFoundException();
        }
    }


    public function deleteMerchants($userId)
    {
        MerchantCategory::join('merchants', 'merchant_categories.merchant_id', '=', 'merchants.id')
            ->join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
            ->where('merchant_users.user_id', $userId)->selectRaw('merchant_categories.*')->delete();

        CouponFile::join('coupons', 'coupons.id', '=', 'coupon_files.coupon_id')
            ->join('merchants', 'coupons.merchant_id', '=', 'merchants.id')
            ->join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
            ->where('merchant_users.user_id', $userId)->selectRaw('coupon_files.*')->delete();

        Coupon::join('merchants', 'coupons.merchant_id', '=', 'merchants.id')
            ->join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
            ->where('merchant_users.user_id', $userId)->selectRaw('coupon_files.*')->delete();

        Merchant::join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
        ->where('merchant_users.user_id', $userId)->delete();
    }

    public function assignCommonValues(Merchant $merchant, Request $request, $userId = null)
    {
        $merchant->area_id = $request->input('area_id');
        $merchant->name = $request->input('name');
        $merchant->shopping_center_name = $request->input('shopping_center_name');
        $merchant->website = $request->input('website');
        $merchant->phone = $request->input('phone');
        $merchant->approved = true;
        $merchant->city = $request->input('city');
        $merchant->address = $request->input('address');
        $merchant->zip = $request->input('zip');
        $merchant->approved = true;
        $merchant->suite_number = $request->input('suite_number', '');
        $merchant->description = $request->input('description', '');
        if ($request->input('lon')) {
            $merchant->lon = $request->input('lon');
        }
        if ($request->input('lat')) {
            $merchant->lat = $request->input('lat');
        }

        if ($request->input('coordinates')) {
            $merchant->coordinates = $request->input('coordinates');
        } else {
            $merchant->coordinates = '';
        }
        
        $merchant->save();


        if ($userId) {
            $merchantUser = new MerchantUser();
            $merchantUser->user_id = $userId;
            $merchantUser->merchant_id = $merchant->id;
	        $merchantUser->save();
        }

        //if there are some merchant categories, delete them, and add new ones
        MerchantCategory::where('merchant_id', $merchant->id)->delete();

        if(!empty($request->input('categories'))) {
            foreach ($request->input('categories') as $category)
            {
                $merchantCategory = new MerchantCategory();
                $merchantCategory->merchant_id = $merchant->id;
                $merchantCategory->category_id = $category;
                $merchantCategory->save();
            }
        }

        return $merchant;
    }

    public function uploadLogo(Request $request, $merchant)
    {
        $file = $request->file('logo');

        if ($file) {//TODO: upload file to amazon
            $extension = $file->getClientOriginalExtension();

            $path = $file->storeAs('/files/merchant-logos/'.$merchant->id, $merchant->id . time() . '.' .$extension);

            //$img = Image::make($path)->resize(250, 250);
            $img = Image::make($path)->resize(250, 250,
                function ($constraint) {
                    $constraint->aspectRatio();
                })
                ->resizeCanvas(250, 250);

            $img->save($path);

            $merchant->logo = asset($path);

            $merchant->update();

            return $merchant;
        }
    }

    public function removeLogo($merchant)
    {
        //TODO: delete file from Amazon later
        $merchant->logo = null;

        $merchant->update();
    }

    public function getMerchantsCountByAreaName($areas)
    {
        return Merchant::join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
            ->join('areas', 'merchants.area_id', '=', 'areas.id')
            ->join('users', 'users.id', '=', 'merchant_users.user_id')
            ->where('merchants.approved', 1)
            ->whereIn('areas.name', $areas)
            ->distinct()
            ->count();
    }

    public function getMerchantsByShoppingCenterId($id, $filters = null, $lat = null, $lon = null, Request $request, $count = false)
    {
        $collection = Merchant::leftjoin('coupons', 'merchants.id', '=', 'coupons.merchant_id')
                              ->where('merchants.shopping_center_id', $id)
                              ->where('merchants.approved', 1)
                              ->selectRaw('merchants.*, count(coupons.merchant_id) as coupons')
                              ->groupBy('merchants.id');

        if ($request->input('sort_by')) {
            if (substr($request->input('sort_by'), 0, 1) == '-') {
                $collection->orderBy('merchants.' . substr($request->input('sort_by'), 1), 'desc');
            } else {
                $collection->orderBy('merchants.' . $request->input('sort_by'), 'asc');
            }
        }

        if ($request->input('limit') && $request->input('page') && (!$count)) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }

        if ($filters) {
            $collection->join('merchant_categories', 'merchant_categories.merchant_id', '=', 'merchants.id')
                       ->whereIn('merchant_categories.category_id', $filters);
        }

        if ($lat && $lon) {
            $collection->selectRaw('merchants.*, count(coupons.merchant_id) as coupons, ROUND(3956 * 2 *
                ASIN(SQRT( POWER(SIN(('. $lat .' - merchants.lat)*pi()/180/2),2)
                    +COS('. $lat .'*pi()/180 )*COS(merchants.lat*pi()/180)
                    *POWER(SIN(('. $lon .'-merchants.lon)*pi()/180/2),2))), 2) 
          as distance')
                ->orderBy('distance', 'ASC');
        }

        if ($count) {
            return count($collection->orderBy('merchants.name')->get());
        }

        if ($request->input('letter')) {
            $collection->orderBy('merchants.name', $request->input('letter'));
        }

        if ($request->input('end_date')) {
            $collection->orderBy(DB::raw('ISNULL(coupons.end_date), coupons.end_date'), $request->input('end_date'));
        }

        $data['merchants'] = $collection->get();
        foreach ($data['merchants'] as $key => $merchant) {
            if ($data['merchants'][$key]->area_id) {
                $data['merchants'][$key]->area_name = Area::find($merchant->area_id)->name;
            }
	    $categories = MerchantCategory::where('merchant_categories.merchant_id', $merchant->id)
                ->join('categories', 'categories.id', '=', 'merchant_categories.category_id')
                ->select('categories.id', 'categories.name', 'categories.logo')
                ->get();
            $merchant->categories = $categories;

            $activeCoupons = Coupon::where('merchant_id', '=', $merchant->id)->where('active', '=', 1)->count();

            $data['merchants'][$key]->active_coupons = $activeCoupons;
        }
        $data['total'] = $this->getMerchantsByShoppingCenterId($id, $filters, $lat, $lon, $request, true);

        return $data;
    }

    public function checkMerchantOwner($merchantId, $userId, $scUser = false)
    {
        if ($scUser) {
            $merchant = ShoppingCenter::join('merchants', 'merchants.shopping_center_id', '=', 'shopping_centers.id')
                ->join('shopping_center_users', 'shopping_centers.id', '=', 'shopping_center_users.shopping_center_id')
                ->where('merchants.id', $merchantId)
                ->where('shopping_center_users.user_id', $userId)
                ->selectRaw('merchants.*')
                ->first();
        } else {
            $merchant = Merchant::join('merchant_users', 'merchant_users.merchant_id', '=', 'merchants.id')
                ->where('merchants.id', $merchantId)
                ->where('merchant_users.user_id', $userId)
                ->first();
        }
        if (!$merchant) {
            throw new MerchantNotFoundException();
        } else {
            return true;
        }
    }

    public function getUnapprovedMerchants(Request $request, $count = false, $all = false)
    {
        $collection = Merchant::join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
                              ->join('users', 'merchant_users.user_id', '=', 'users.id')
                              ->where('merchants.approved', '=', 0)
                              ->where('users.type', '<', 3)
                              ->selectRaw('merchants.*');

        if ($request->input('sort_by')) {
            if (substr($request->input('sort_by'), 0, 1) == '-') {
                $collection->orderBy('merchants.' . substr($request->input('sort_by'), 1), 'desc');
            } else {
                $collection->orderBy('merchants.' . $request->input('sort_by'), 'asc');
            }
        }

        if ($request->input('search')) {
            $collection->where('merchants.name', 'LIKE', '%' .  $request->input('search') . '%');
        }


        if ($request->input('limit') && $request->input('page') && !($count && $all)) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }

        if ($count) {
            return $collection->count();
        } else {
            $data['merchants'] = $collection->get();
            $data['total'] = $this->getUnapprovedMerchants($request, true, true);
            return $data;
        }
    }

    public function newMerchants($userId = null)
    {
        $startOfWeek = Carbon::now()->startOfWeek()->format('Y-m-d H:i:s');
        if ($userId) {
            $count = Merchant::join('shopping_centers', 'shopping_centers.id', '=', 'merchants.shopping_center_id')
                ->join('shopping_center_users', 'shopping_centers.id', '=', 'shopping_center_users.shopping_center_id')
                ->where('shopping_center_users.user_id', '=', $userId)
                ->where('merchants.created_at', '>', $startOfWeek)
                ->count();
        } else {
            $count = Merchant::where('created_at', '>', $startOfWeek)->count();
        }

        return $count;
    }
}
