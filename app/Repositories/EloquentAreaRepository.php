<?php

namespace App\Repositories;

use App\Contracts\Repositories\AreaRepository;
use App\Exceptions\Repositories\AreaBeingUsedException;
use App\Exceptions\Repositories\AreaNotFoundException;
use App\Models\Area;
use App\Models\Merchant;
use App\Models\ShoppingCenter;
use App\Models\State;
use Illuminate\Http\Request;

class EloquentAreaRepository implements AreaRepository
{
    public function getAllAreas(Request $request)
    {
        $collection = Area::where('id', '>', 0);

        if ($request->input('sort_by')) {
            if (substr($request->input('sort_by'), 0, 1) == '-') {
                $collection->orderBy(substr($request->input('sort_by'), 1), 'desc');
            } else {
                $collection->orderBy($request->input('sort_by'), 'asc');
            }
        }

        if ($request->input('search')) {
            $collection->where('name', 'LIKE', '%' . $request->input('search') . '%');
            $data['total'] = Area::where('name', 'LIKE', '%' . $request->input('search') . '%')->count();
        } else {
            $data['total'] = Area::count();
        }


        if ($request->input('limit') && $request->input('page')) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }

        if ($request->input('letter')) {
            $collection->orderBy('areas.name', $request->input('letter'));
        }

        $data['areas'] = $collection->get();

        foreach ($data['areas'] as $key => $area) {
            $data['areas'][$key]->state_name = State::where('id', '=', $area->state_id)->first()->name;
        }

        return $data;
    }

    public function getAreas($search = null)
    {
        if ($search) {
            return Area::where('name', 'LIKE', '%' . $search . '%')->take(10)->get();
        } else {
            return Area::take(10)->get();
        }
    }

    public function getById($id, $allowState = true)
    {
        $area = Area::find($id);

        if($area) {
            if ($allowState) {
                $area->state_name = State::where('id', '=', $area->state_id)->first()->name;
            }
            return $area;
        } else {
            throw new AreaNotFoundException();
        }
    }

    public function getByName($name)
    {
        $area = Area::where('name', $name)->first();
        if($area) {
            $area->state_name = State::where('id', '=', $area->state_id)->first()->name;
            return $area;
        } else {
            throw new AreaNotFoundException();
        }
    }

    public function getLikeName($name, $limit = null, $page = null, $filters = null, $count = false)
    {
        if ($filters) {
            $areas = Area::join('merchants', 'merchants.area_id', '=', 'areas.id')
                ->join('merchant_categories', 'merchant_categories.merchant_id', '=', 'merchants.id')
                ->whereIn('merchant_categories.category_id', $filters);
            $areas->selectRaw('areas.*')->distinct('area.id');
        } else {
            $areas = Area::where('id', '>', 0)->distinct('area.id');
        }

        if ($name) {
            $areas->where('areas.name', 'LIKE', '%' . $name . "%");
        }

        if ($limit && $page && !$count) {
            $areas->skip(($page-1) * $limit)->take($limit);
        } else if ($limit && !$count) {
            $areas->take($limit);
        }

        if ($count) {
            return count($areas->get());
        }

        $areas = $areas->get();
        foreach ($areas as $key => $area) {
            $areas[$key]->state_name = State::where('id', '=', $area->state_id)->first()->name;
        }
        return $areas;
    }

    public function store(Area $area)
    {
        $area->save();
    }

    public function update(Area $area)
    {
        $area->update();
    }

    public function delete($id)
    {
        $area = Area::find($id);
        if($area) {
            $area->delete();
        } else {
            throw new AreaNotFoundException();
        }
    }

    public function checkUsage($id)
    {
        $shoppingCenter = ShoppingCenter::where('area_id', $id)->first();

        $merchant = Merchant::where('area_id', $id)->first();

        if ($shoppingCenter || $merchant) {
            throw new AreaBeingUsedException();
        } else {
            return true;
        }
    }
}