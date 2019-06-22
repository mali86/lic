<?php

namespace App\Contracts\Repositories;

use App\Models\ScWorkingHour;
use App\Models\ShoppingCenter;
use Illuminate\Http\Request;

interface ShoppingCenterRepository
{
    public function getAllShoppingCenters(Request $request, $count = false, AreaRepository $areaRepository, $userId = null);
    public function getShoppingCenters($search = null);
    public function getById($id, $userId = null);
    public function showById($id, $userId = null, AreaRepository $areaRepository);
    public function getWorkingHourById($id);
    public function getLikeName($name, $limit = null, $distance = null, $lat = null, $lon = null, $page = null, $filters = null, $count = false);
    public function getShoppingCentersByAreaId($id, $lat = null, $lon = null, $filters = null, Request $request, $count = false);
    public function getShoppingCentersByAreaName($name, $lat = null, $lon = null, $filters = null);
    public function store(ShoppingCenter $shoppingCenter);
    public function storeWorkingHour(ScWorkingHour $scWorkingHour);
    public function update(ShoppingCenter $shoppingCenter);
    public function updateWorkingHours(ScWorkingHour $scWorkingHour);
    public function delete($id);
    public function checkUsage($id);
    public function getUnapprovedShoppingCenters(Request $request, $count = false, $all = false);
    public function parseWorkingHours(ScWorkingHour $workingHours);
    public function removeUser($userId);
    public function newShoppingCenters();
    public function uploadLogo(Request $request, $shoppingCenter);
    public function removeLogo($shoppingCenter);
}