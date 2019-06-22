<?php

namespace App\Repositories;

use File;
use App\Contracts\Repositories\CouponRepository;
use App\Exceptions\Repositories\CouponStateException;
use App\Exceptions\Repositories\FileNotFoundException;
use App\Models\Coupon;
use App\Models\Merchant;
use App\Models\MerchantCoupon;
use App\Models\ShoppingCenter;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Image;
use App\Exceptions\Repositories\CouponNotFoundException;
//use Symfony\Component\DomCrawler\Image;
use App\Models\CouponFile;
use App\Exceptions\Repositories\CouponDateException;
use Illuminate\Support\Facades\Storage;


class EloquentCouponRepository implements CouponRepository
{
    public function getAllCoupons()
    {
        $coupons = Coupon::leftJoin('coupon_files', 'coupons.id', '=', 'coupon_files.coupon_id')
                     ->selectRaw('coupons.*, GROUP_CONCAT(coupon_files.url) as url, GROUP_CONCAT(coupon_files.id) as file_ids')
                     ->groupBy('coupons.id')
                     ->get();

        return $this->setUrls($coupons, 'array');

    }

    public function getCoupons(Request $request, $merchantId, $scUser = null, $count = false)
    {
        if ($scUser) {
            $collection = ShoppingCenter::join('shopping_center_users', 'shopping_center_users.shopping_center_id', '=', 'shopping_centers.id')
                ->join('merchants', 'shopping_center_users.shopping_center_id', '=', 'merchants.shopping_center_id')
                ->join('coupons', 'coupons.merchant_id', '=', 'merchants.id')
                ->leftJoin('coupon_files', 'coupons.id', '=', 'coupon_files.coupon_id')
                ->where('shopping_center_users.user_id', '=', $scUser)
                ->where('merchants.id', '=', $merchantId)
                ->selectRaw('coupons.*, GROUP_CONCAT(coupon_files.url) as url, GROUP_CONCAT(coupon_files.id) as file_ids')
                ->groupBy('coupons.id');
        } else {
            $collection = Coupon::join('merchants', 'merchants.id', '=', 'coupons.merchant_id')
                ->leftJoin('coupon_files', 'coupons.id', '=', 'coupon_files.coupon_id')
                ->where('merchants.id', '=', $merchantId)
                ->selectRaw('coupons.*, GROUP_CONCAT(coupon_files.url) as url, GROUP_CONCAT(coupon_files.id) as file_ids')
                ->groupBy('coupons.id');
        }

        if (!is_null($request->input('active'))) {
            $collection->where('coupons.active', '=', $request->input('active'));
        }

        if ($request->input('sort_by')) {
            if (substr($request->input('sort_by'), 0, 1) == '-') {
                $collection->orderBy(substr($request->input('sort_by'), 1), 'desc');
            } else {
                $collection->orderBy($request->input('sort_by'), 'asc');
            }
        }

        if ($request->input('limit') && $request->input('page')) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }

        if ($count) {
            return $collection->count();
        }

        $data['coupons'] = $this->setUrls($collection->get(), 'array');
        $data['total'] = $this->getCoupons($request, $merchantId, $scUser, true);

        return $data;
    }

    public function count($userId = null, $active = null, $merchantId = null, $shoppingCenterId = null)
    {
        if ($userId) {
            if (!$active) {
                $collection = Coupon::join('merchants', 'merchants.id', '=', 'coupons.merchant_id')
                    ->join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
                    ->join('users', 'users.id', '=', 'merchant_users.user_id')
                    ->where('users.id', '=', $userId);
                    if ($merchantId) {
                        $collection->where('merchants.id', '=', $merchantId);
                    }
                $collection->selectRaw('merchants.id')
                    ->groupBy('coupons.id');
                return count($collection->get());
            } else {
                if ($userId) {
                    if ($shoppingCenterId) {
                        return count(Coupon::join('merchants', 'merchants.id', '=', 'coupons.merchant_id')
                            ->join('shopping_centers', 'shopping_centers.id', '=', 'merchants.shopping_center_id')
                            ->join('shopping_center_users', 'shopping_centers.id', '=', 'shopping_center_users.shopping_center_id')
                            ->join('users', 'users.id', '=', 'shopping_center_users.user_id')
                            ->where('coupons.active', '=', true)
                            ->where('users.id', '=', $userId)
                            ->selectRaw('merchants.id')
                            ->groupBy('coupons.id')
                            ->get());
                    } else {
                        return count(Coupon::join('merchants', 'merchants.id', '=', 'coupons.merchant_id')
                            ->join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
                            ->join('users', 'users.id', '=', 'merchant_users.user_id')
                            ->where('coupons.active', '=', true)
                            ->where('users.id', '=', $userId)
                            ->selectRaw('merchants.id')
                            ->groupBy('coupons.id')
                            ->get());
                    }
                } else {
                    return count(Coupon::join('merchants', 'merchants.id', '=', 'coupons.merchant_id')
                        ->join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
                        ->join('users', 'users.id', '=', 'merchant_users.user_id')
                        ->where('coupons.active', '=', true)
                        ->selectRaw('merchants.id')
                        ->groupBy('coupons.id')
                        ->get());
                }
            }
        } else {
            return Coupon::count();
        }
    }

    public function countByMerchant($id)
    {
        return Coupon::where('merchant_id', $id)->count();
    }

    public function countByShoppingCenter($id)
    {
        return Coupon::join('merchants', 'merchants.id', '=', 'coupons.merchant_id')
                     ->where('merchants.shopping_center_id', $id)
                     ->count();
    }

    public function getCouponsByUserIdAndMerchantId($id, Request $request)
    {
        $collection = Coupon::join('merchants', 'merchants.id', '=', 'coupons.merchant_id')
                            ->join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
                            ->leftJoin('coupon_files', 'coupons.id', '=', 'coupon_files.coupon_id')
                            ->where('merchant_users.user_id', $id)
                            ->where('merchants.id', $request->input('merchant_id'))
                            ->selectRaw('coupons.*, GROUP_CONCAT( DISTINCT coupon_files.url) as url, GROUP_CONCAT(coupon_files.id) as file_ids')
                            ->groupBy('coupons.id')
                            ->distinct();

        if ($request->input('limit') && $request->input('page')) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }

        $data['coupons'] = $this->setUrls($collection->get(), 'array');
        $data['total'] = $this->count($id, null, $request->input('merchant_id'));

        //Get merchant
        foreach ($data['coupons'] as $coupon) {
            $coupon['merchant'] = Merchant::find($coupon->merchant_id);
        }
        return $data;
    }

    public function getActiveCouponsByMerchantId($id, Request $request, $count = false)
    {
        $collection = Coupon::leftJoin('coupon_files', 'coupons.id', '=', 'coupon_files.coupon_id')
                         //->where('coupons.active', 1)
                         ->where('coupons.merchant_id', $id);

        if ($request->input('sort_by')) {
            if (substr($request->input('sort_by'), 0, 1) == '-') {
                $collection->orderBy('coupons.' . substr($request->input('sort_by'), 1), 'desc');
            } else {
                $collection->orderBy('coupons.' . $request->input('sort_by'), 'asc');
            }
        }

        if ($request->input('search')) {
            $collection->where('name', 'LIKE', '%' . $request->input('search') . '%');
            $data['total'] = Coupon::where('name', 'LIKE', '%' . $request->input('search') . '%')->count();
        } else {
        }

        if ($request->input('limit') && $request->input('page')) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }

        if ($count) {
            return $collection->selectRaw('coupons.*, GROUP_CONCAT( DISTINCT coupon_files.url) as url, GROUP_CONCAT(coupon_files.id) as file_ids')
                ->groupBy('coupons.id')
                ->distinct()
                ->count();
        }

        $coupons = $collection->selectRaw('coupons.*, GROUP_CONCAT( DISTINCT coupon_files.url) as url, GROUP_CONCAT(coupon_files.id) as file_ids')
                         ->groupBy('coupons.id')
                         ->distinct()
                         ->get();

        $data['coupons'] = $this->setUrls($coupons, 'array');
        $data['total'] = $this->getActiveCouponsByMerchantId($id, $request, true);

        return $data;
    }

    public function store(Request $request)
    {
        $coupon = new Coupon();

        $coupon = $this->assignCommonValues($coupon, $request);

        return $coupon;
    }

    public function getById($id, $allow = true)
    {
        if ($allow) {
            $coupon = Coupon::leftJoin('coupon_files', 'coupons.id', '=', 'coupon_files.coupon_id')
                ->selectRaw('coupons.*, GROUP_CONCAT( DISTINCT coupon_files.url) as url, GROUP_CONCAT(coupon_files.id) as file_ids')
                ->groupBy('coupons.id')
                ->where('coupons.id', $id)->first();

            if ($coupon) {
                $coupon = $this->setUrls($coupon, 'object');
                $merchant = Merchant::find($coupon->merchant_id);

                $data['coupon'] = $coupon;
                $data['merchant'] = $merchant;
                return $data;
            } else {
                throw new CouponNotFoundException();
            }
        } else {
            $coupon = Coupon::where('id', '=', $id)->first();

            if ($coupon) {
                return $coupon;
            } else {
                throw new CouponNotFoundException();
            }
        }
    }

    public function getCouponByIdAndUserId($userId, $id, $allow = true, $scUser = false)
    {
        if ($scUser) {
            $coupon = ShoppingCenter::join('shopping_center_users', 'shopping_center_users.shopping_center_id', '=', 'shopping_centers.id')
                ->join('merchants', 'shopping_center_users.shopping_center_id', '=', 'merchants.shopping_center_id')
                ->join('coupons', 'coupons.merchant_id', '=', 'merchants.id')
                ->leftJoin('coupon_files', 'coupons.id', '=', 'coupon_files.coupon_id')
                ->where('shopping_center_users.user_id', $userId)
                ->where('coupons.id', $id)
                ->selectRaw('coupons.*, GROUP_CONCAT( DISTINCT coupon_files.url) as url , GROUP_CONCAT(coupon_files.id) as file_ids')
                ->groupBy('coupons.id')
                ->distinct()
                ->first();
        } else {
            $coupon = Coupon::join('merchants', 'merchants.id', '=', 'coupons.merchant_id')
                ->join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
                ->leftJoin('coupon_files', 'coupons.id', '=', 'coupon_files.coupon_id')
                ->where('merchant_users.user_id', $userId)
                ->where('coupons.id', $id)
                ->selectRaw('coupons.*, GROUP_CONCAT( DISTINCT coupon_files.url) as url , GROUP_CONCAT(coupon_files.id) as file_ids')
                ->groupBy('coupons.id')
                ->distinct()
                ->first();
        }

        if ($coupon) {
            if ($allow) {
                $coupon = $this->setUrls($coupon, 'object');
                $data['coupon'] = $coupon;
                $data['merchant'] = Merchant::find($coupon->merchant_id);
                return $data;
            } else {
                $coupon = $this->getById($id, false);

                return $coupon;
            }
        } else {
            throw new CouponNotFoundException();
        }

    }

    public function getCouponByIdAndMerchantId($userId, $id, $merchantId)
    {
        $coupon = Coupon::join('merchants', 'merchants.id', '=', 'coupons.merchant_id')
            ->join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
            ->where('merchant_users.user_id', $userId)
            ->where('merchants.id', $merchantId)
            ->where('coupons.id', $id)
            ->selectRaw('coupons.*')
            ->groupBy('coupons.id')
            ->distinct()
            ->first();

        if ($coupon) {
            return $coupon;
        } else {
            throw new CouponNotFoundException();
        }
    }

    public function getCouponsByMerchantId($id, $active = -1)
    {
        $collection = Coupon::join('merchants', 'merchants.id', '=', 'coupons.merchant_id')
            ->where('merchants.id', $id)
            ->selectRaw('coupons.*')
            ->groupBy('coupons.id')
            ->distinct();

        if ($active !== -1) {
            $collection->where('coupons.active', '=', $active);
        }

        $coupons = $collection->get();

        if ($coupons) {
            return $coupons;
        } else {
            throw new CouponNotFoundException();
        }
    }

    public function update($couponId, Request $request)
    {
        $coupon = Coupon::find($couponId);

        $coupon = $this->assignCommonValues($coupon, $request);

        return $coupon;
    }


    public function assignCommonValues(Coupon $coupon, Request $request)
    {
        $today = Carbon::today()->toDateString();

        $coupon->title = $request->input('title');
        $coupon->description = $request->input('description');
        $coupon->merchant_id = $request->input('merchant_id');
        $coupon->start_date = $request->input('start_date');
        $coupon->end_date = $request->input('end_date');
        if ($request->input('start_date') > $today || $request->input('end_date') < $today) {
            $coupon->active = false;
        } else {
            $coupon->active = true;
        }
        $coupon->save();

        if (!empty($request->file('files'))) {
            $files = $request->file('files');
            foreach ($files as $file) {
                //TODO: upload file to amazon
                $extension = $file->getClientOriginalExtension();
                if ($extension == 'pdf') {
                    $path = $file->storeAs('/files/' . $coupon->id , $coupon->id . time() . '.pdf');
                } else {
                    $path = $file->storeAs('/files/' . $coupon->id, $coupon->id . time() . '.jpeg');
                }

                $couponFile = new CouponFile();
                $couponFile->coupon_id = $coupon->id;
                $couponFile->url = asset($path);
                $couponFile->save();
            }
        }

	if (!empty($request->input('image'))) {
            $data = $request->input('image');
            $pos  = strpos($data, ';');
            $extension = explode('/', explode(':', substr($data, 0, $pos))[1])[1];
            $path = 'files/' . $coupon->id;

	    if (!File::isDirectory(public_path($path))) {
		File::makeDirectory(public_path($path), 0777, true, true);
            }
	    $path = $path . '/' . $coupon->id . time() . '.' .$extension;
            $img = Image::make(file_get_contents($data));

            $img->save(public_path($path));

            $couponFile = new CouponFile();
            $couponFile->coupon_id = $coupon->id;
            $couponFile->url = asset($path);
            $couponFile->save();
        }

        return $coupon;
    }

    public function delete($id)
    {
        $coupon = Coupon::find($id);
        if ($coupon) {

            //Delete files
            $files = CouponFile::where('coupon_id', $id)->get();
            foreach ($files as $file) {
                Storage::delete($file->url);
                $file->delete();
            }
            $coupon->delete();
        } else {
            throw new CouponNotFoundException();
        }
    }

    public function setUrls($input, $type)
    {
        $array = [];
        if ($type == 'object') {
            $file_ids = explode(',', $input->file_ids);
            $files = explode(',', $input->url);

            foreach ($file_ids as $key => $id) {
                if ($id && isset($files[$key])) {
                    $array[] = ['id' => $id,
                        'url' => $files[$key]];
                }
            }
            $input->files = $array;
        } else {
            foreach ($input as $coupon) {
                $array = [];
                $file_ids = explode(',', $coupon->file_ids);
                $files = explode(',', $coupon->url);
                foreach ($file_ids as $key => $id) {
                    if ($id && isset($files[$key])) {
                        $array[] = ['id' => $id,
                            'url' => $files[$key]];
                    }
                }
                $coupon->files = $array;
            }
        }

        return $input->makeHidden('file_ids')->makeHidden('url');
    }

    public function activateCoupon(Coupon $coupon)
    {
        $today = Carbon::today()->toDateString();

        if ($coupon->active == 1) {
            throw new CouponStateException();
        }

        /*if ($coupon->start_date > $today || $coupon->end_date < $today) {
            throw new CouponDateException();
        }*/

        Coupon::where('id', $coupon->id)
                      ->update(['active' => true]);

        return true;
    }

    public function deactivateCoupon(Coupon $coupon)
    {
        if ($coupon->active == 0) {
            throw new CouponStateException();
        }

        Coupon::where('id', $coupon->id)
            ->update(['active' => false]);

        return true;
    }

    public function checkMerchantCoupon($id, $merchantId)
    {
        $coupon = Coupon::where('coupons.id', $id)
                        ->where('coupons.merchant_id', $merchantId)
                        ->first();

        if ($coupon) {
            return $coupon;
        } else {
            throw new CouponNotFoundException();
        }
    }


    public function uploadFile(Request $request, $coupon)
    {
        $file = $request->file('file');

        //TODO: upload file to amazon
        $extension = $file->getClientOriginalExtension();
        if ($extension == 'pdf') {
            $path = $file->storeAs('/files/' . $coupon->id , $coupon->id . time() . '.pdf');
        } else {
            $path = $file->storeAs('/files/' . $coupon->id, $coupon->id . time() . '.jpeg');
        }

        $couponFile = new CouponFile();
        $couponFile->coupon_id = $coupon->id;
        $couponFile->url = asset($path);
        $couponFile->save();

        return $couponFile;
    }
    public function removeFile($id)
    {
        $file = CouponFile::find($id);
        if ($file) {
            Storage::delete($file->url);
            $file->delete();
        } else {
            throw new FileNotFoundException();
        }
    }

    public function getCouponByFileIdAndUserId($userId, $fileId, $scUser = false)
    {
        if ($scUser) {
            $coupon = ShoppingCenter::join('shopping_center_users', 'shopping_center_users.shopping_center_id', '=', 'shopping_centers.id')
                ->join('merchants', 'shopping_center_users.shopping_center_id', '=', 'merchants.shopping_center_id')
                ->join('coupons', 'coupons.merchant_id', '=', 'merchants.id')
                ->join('coupon_files', 'coupons.id', '=', 'coupon_files.coupon_id')
                ->where('shopping_center_users.user_id', $userId)
                ->where('coupon_files.id', $fileId)
                ->groupBy('coupons.id')
                ->distinct()
                ->first();
        } else {
            $coupon = Coupon::join('merchants', 'merchants.id', '=', 'coupons.merchant_id')
                ->join('merchant_users', 'merchants.id', '=', 'merchant_users.merchant_id')
                ->join('coupon_files', 'coupons.id', '=', 'coupon_files.coupon_id')
                ->where('merchant_users.user_id', $userId)
                ->where('coupon_files.id', $fileId)
                ->groupBy('coupons.id')
                ->distinct()
                ->first();
        }

        if ($coupon) {
            return $coupon;
        } else {
            throw new CouponNotFoundException();
        }
    }

    public function checkIsFileExist($id)
    {
        $file = CouponFile::where('id', '=', $id)->first();

        if ($file) {
            return $file;
        } else {
            throw new FileNotFoundException();
        }
    }
}
