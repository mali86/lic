<?php

namespace App\Contracts\Repositories;
use App\Models\Coupon;
use Illuminate\Http\Request;

interface CouponRepository
{
    public function getAllCoupons();
    public function getCoupons(Request $request, $merchantId, $scUser = null, $count = false);
    public function countByMerchant($id);
    public function countByShoppingCenter($id);
    public function count($userId = null, $active = null, $merchantId = null, $shoppingCenterId = null);
    public function getCouponsByUserIdAndMerchantId($id, Request $request);
    public function getCouponByIdAndMerchantId($userId, $id, $merchantId);
    public function getCouponsByMerchantId($id, $active = -1);
    public function getActiveCouponsByMerchantId($id, Request $request, $count = false);
    public function store(Request $request);
    public function getById($id, $allow = true);
    public function getCouponByIdAndUserId($userId, $id, $allow = true, $scUser = false);
    public function getCouponByFileIdAndUserId($userId, $fileId, $scUser = false);
    public function update($couponId, Request $request);
    public function assignCommonValues(Coupon $coupon, Request $request);
    public function delete($id);
    public function activateCoupon(Coupon $coupon);
    public function deactivateCoupon(Coupon $coupon);
    public function checkMerchantCoupon($id, $merchantId);
    public function uploadFile(Request $request, $coupon);
    public function removeFile($id);
    public function checkIsFileExist($id);
}