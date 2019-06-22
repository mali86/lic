<?php

namespace App\Contracts\Repositories;

use App\Models\Area;
use Illuminate\Http\Request;

interface AreaRepository
{
    public function getAllAreas(Request $request);
    public function getAreas($search = null);
    public function getById($id, $allowState = true);
    public function getByName($name);
    public function getLikeName($name, $limit = null, $page = null, $filters = null, $count = false);
    public function store(Area $area);
    public function update(Area $area);
    public function delete($id);
    public function checkUsage($id);
}