<?php
/**
 * Created by PhpStorm.
 * User: Nikola
 * Date: 12/2/2016
 * Time: 11:25 AM
 */

namespace App\Repositories;

use App\Contracts\Repositories\CategoryRepository;
use App\Models\Category;
use App\Models\Merchant;
use DOMDocument;
use Illuminate\Http\Request;
use League\Flysystem\Exception;
use App\Exceptions\Repositories\CategoryNotFoundException;
use App\Models\MerchantCategory;
use App\Exceptions\Repositories\CategoryBeingUsedException;
use Image;


class EloquentCategoryRepository implements CategoryRepository
{
    public function getAllCategories(Request $request)
    {
        $collection = Category::leftJoin('merchant_categories', 'categories.id', '=', 'merchant_categories.category_id')
            ->leftJoin('merchants', 'merchants.id', '=', 'merchant_categories.merchant_id')
            ->leftJoin('coupons', 'coupons.merchant_id', '=', 'merchants.id');
            //->where('coupons.active', '=', true);

        if ($request->input('sort_by')) {
            if (substr($request->input('sort_by'), 0, 1) == '-') {
                $collection->orderBy(substr($request->input('sort_by'), 1), 'desc');
            } else {
                $collection->orderBy($request->input('sort_by'), 'asc');
            }
        }

        if ($request->input('search')) {
            $collection->where('categories.name', 'LIKE', '%' . $request->input('search') . '%');
            $data['total'] = Category::where('name', 'LIKE', '%' . $request->input('search') . '%')->count();
        } else {
            $data['total'] = Category::count();
        }


        if ($request->input('limit') && $request->input('page')) {
            $collection->skip(($request->input('page') - 1) * $request->input('limit'))->take($request->input('limit'));
        }

        if ($request->input('letter')) {
            $collection->orderBy('categories.name', $request->input('letter'));
        }

        $collection->groupBy('categories.id');
        $collection->selectRaw('categories.*, sum(if(active = true, 1, 0)) as active_coupons');

        $data['categories'] = $collection->get();

        return $data;
    }

    public function getCategories($search = null)
    {
        if ($search) {
            return Category::where('name', 'LIKE', '%' . $search . '%')->take(10)->get();
        } else {
            return Category::take(10)->get();
        }
    }

    public function getById($id)
    {
        $category = Category::find($id);
        if ($category) {
            return $category;
        } else {
            throw new CategoryNotFoundException();
        }
    }

    public function store(Category $category)
    {
        $category->save();
        return $category;
    }

    public function update(Category $category)
    {
        $category->update();
        return $category;
    }

    public function delete($id)
    {
        $category = Category::find($id);
        if ($category) {
            $category->delete();
        } else {
            throw new CategoryNotFoundException();
        }
    }
    public function checkUsage($id)
    {
        $merchant = MerchantCategory::where('category_id', $id)->first();
        if ($merchant) {
            throw new CategoryBeingUsedException();
        } else {
            return true;
        }
    }

    public function uploadLogo(Request $request, $category)
    {
        $file = $request->file('logo');

        if ($file) {//TODO: upload file to amazon
            $extension = $file->getClientOriginalExtension();

            $path = $file->storeAs('/files/categories-logos/', str_replace(' ', '-', $category->name) . '.' .$extension);

            $img = Image::make($path)->resize(125, 125);

            $img->save($path);

            $category->logo = asset($path);

            $category->update();

            return $category;
        }
    }

    public function removeLogo($category)
    {
        $category->logo = null;

        $category->update();
    }

    public function generateKmlFile($category)
    {
        // Creates the Document.
        $dom = new DOMDocument('1.0', 'UTF-8');

        // Creates the root KML element and appends it to the root document.
        $node = $dom->createElementNS('http://www.opengis.net/kml/2.2', 'kml');
        $parNode = $dom->appendChild($node);

        $dnode = $dom->createElement('Document');
        $docNode = $parNode->appendChild($dnode);

        $docNodeName = $dom->createElement('name', $category->name);
        $docNode->appendChild($docNodeName);


        $restStyleNode = $dom->createElement('Style');
        $restStyleNode->setAttribute('id', 'transYellowPoly');
        $restLineStyleNode = $dom->createElement('LineStyle');
        $restColorNode = $dom->createElement('color', '7d000000');
        $restWidthNode = $dom->createElement('width', 1);
        $restLineStyleNode->appendChild($restColorNode);
        $restLineStyleNode->appendChild($restWidthNode);
        $restStyleNode->appendChild($restLineStyleNode);
        $restPolyStyleNode = $dom->createElement('PolyStyle');
	//$restColorNode = $dom->createElement('color', '7d' . str_replace('#', '', $category->color));
	if (strlen($category->color) > 6) {
		$restColorNode = $dom->createElement('color', '7d' . $category->color[5] . $category->color[6] . $category->color[3] . $category->color[4] . $category->color[1] . $category->color[2]);
	} else {
		$restColorNode = $dom->createElement('color', '7d' . str_replace('#', '', $category->color));
	}
       // $restColorNode = $dom->createElement('color', '7d' . str_replace('#', '', $category->color));
        $restPolyStyleNode->appendChild($restColorNode);
        $restStyleNode->appendChild($restPolyStyleNode);

        $docNode->appendChild($restStyleNode);


        $restFolderNode = $dom->createElement('Folder');
        $restNameNode = $dom->createElement('name', $category->name);
        $restVisibilityNode = $dom->createElement('visibility', 1);
        $restDescriptionNode = $dom->createElement('description', 'A collection showing how easy it is to create 3-dimensional buildings');
        $restFolderNode->appendChild($restNameNode);
        $restFolderNode->appendChild($restVisibilityNode);
        $restFolderNode->appendChild($restDescriptionNode);

        $merchants = $this->getAllCategoryMerchants($category->id);

        foreach ($merchants as $merchant) {
           if ($merchant->coordinates != null OR $merchant->coordinates != '') {
                $restFolderNode->appendChild($this->generatePlacemark($merchant, $dom));
            }
        }

        $docNode->appendChild($restFolderNode);

        return $dom;
    }

    private function generatePlacemark(Merchant $merchant, DOMDocument $dom)
    {
        $placemarkNode = $dom->createElement('Placemark');
        $placemarkNameNode = $dom->createElement('name', htmlspecialchars($merchant->name));
        $visibilityNode = $dom->createElement('visibility', 1);
        $styleUrlNode = $dom->createElement('styleUrl', '#transYellowPoly');

        $poligonNode = $dom->createElement('Polygon');
        $extrudeNode = $dom->createElement('extrude', 1);
        $altitudeModeNode = $dom->createElement('altitudeMode', 'relativeToGround');

        $outerBoundaryIs = $dom->createElement('outerBoundaryIs');
        $linearRingNode = $dom->createElement('LinearRing');
        $coordinatesNode = $dom->createElement('coordinates', $merchant->coordinates);
        $linearRingNode->appendChild($coordinatesNode);
        $outerBoundaryIs->appendChild($linearRingNode);

        $poligonNode->appendChild($extrudeNode);
        $poligonNode->appendChild($altitudeModeNode);
        $poligonNode->appendChild($outerBoundaryIs);

        $placemarkNode->appendChild($placemarkNameNode);
        $placemarkNode->appendChild($visibilityNode);
        $placemarkNode->appendChild($styleUrlNode);
        $placemarkNode->appendChild($poligonNode);

        return $placemarkNode;
    }

    public function getAllCategoryMerchants($categoryId)
    {
        $merchants = Merchant::join('merchant_categories', 'merchants.id', '=', 'merchant_categories.merchant_id')->where('merchant_categories.category_id', '=', $categoryId)->get();

        return $merchants;
    }
}
