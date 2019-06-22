<?php

namespace App\Contracts\Repositories;

use App\Models\Merchant;
use Illuminate\Http\Request;

interface MerchantRepository
{
    public function getAllMerchants();
    public function count();
    public function countByUserId($userId);
    public function getMerchants(Request $request);
    public function getMerchantsByUserId($userId, Request $request);
    public function getMerchantsBySCUserId($userId, Request $request);
    public function getById($id, $userId = null, $allowCategories = true, $scUser = false);
    public function getLikeName($name, $limit = null, $distance = null, $lat = null, $lon = null, $page = null, $filters = null, $count = false);
    public function store(Request $merchantRequest, $shoppingCenterId, $lat, $lon, $userId = null);
    public function update(Merchant $merchant, Request $merchantRequest);
    public function delete($id, $userId = null, $scUser = false);
    public function assignCommonValues(Merchant $merchant, Request $request, $userId = null);
    public function getMerchantsByShoppingCenterId($id, $filters = null, $lat = null, $lon = null, Request $request, $count = false);
    public function getMerchantsCountByAreaName($areas);
    public function checkMerchantOwner($merchantId, $userId, $scUser = false);
    public function getUnapprovedMerchants(Request $request, $count = false, $all = false);
    public function uploadLogo(Request $request, $merchant);
    public function removeLogo($merchant);
    public function deleteMerchants($userId);
    public function newMerchants($userId = null);
}