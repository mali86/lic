<?php

namespace App\Http\Controllers;

use App\Contracts\Repositories\CategoryRepository;
use App\Exceptions\Repositories\CategoryBeingUsedException;
use App\Exceptions\Repositories\CategoryNotFoundException;
use App\Exceptions\Repositories\UserNotFoundException;
use App\Http\Requests\CategoryRequest;
use App\Http\Requests\LogoRequest;
use App\Models\Category;
use Carbon\Carbon;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use StepanDalecky\KmlParser\Parser;

class CategoriesController extends ApiController
{
    private $categoryRepository;
    private $role;

    public function __construct(CategoryRepository $categoryRepository, Request $request)
    {
        $this->categoryRepository = $categoryRepository;

        $this->role = '';

        try {
            $key = config('app.JWT_key');

            $token = $request->header('Authorization');

            $decoded = (array) JWT::decode($token, $key, array('HS256'));

            $this->role = $decoded['role'];
        } catch (UserNotFoundException $userNotFoundException) {
            $this->role = '';
        } catch (\UnexpectedValueException $unexpectedValueException) {
            $this->role = '';
        }
    }
 
    public function kml($id)
    {
        try {
            $category = $this->categoryRepository->getById($id);

            $kml = $this->categoryRepository->generateKmlFile($category)->saveXML();
        } catch (CategoryNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Category not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return $kml;
    }

    public function kmlCoordinates($id)
    {
        $kmlCoordinates = array();
        try {
            $category = $this->categoryRepository->getById($id);

            $merchants = $this->categoryRepository->getAllCategoryMerchants($id);

            foreach ($merchants as $merchant) {
                if ($merchant->coordinates !== null && $merchant->coordinates !== '') {
                    $kmlCoordinates[] = $merchant->coordinates;
                }
            }
        } catch (CategoryNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Category not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return response()->json($kmlCoordinates);
    }

    public function updateColors(Request $request, $id)
    {
        try {
            $category = $this->categoryRepository->getById($id);

            $category->color = $request->input('color');
            $category->update();
        } catch (CategoryNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Category not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return response()->json($category, 200);
    }

    /**
     * Display a listing of the categories.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/categories",
     *     description="Returns all categories.",
     *     produces={"application/json"},
     *     tags={"categories"},
     *     @SWG\Parameter(
     *         description="How many results want per page.",
     *         in="query",
     *         name="limit",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Page number.",
     *         in="query",
     *         name="page",
     *         required=false,
     *         type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Column name for sort. (- before name for desc)",
     *         in="query",
     *         name="sort_by",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Parameter(
     *         description="Search by categories name.",
     *         in="query",
     *         name="search",
     *         required=false,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns all categories."
     *     )
     * )
     */

    public function index(Request $request)
    {
        $categories = $this->categoryRepository->getAllCategories($request);
        if ($request->input('kml')) {
            foreach ($categories['categories'] as $key => $category) {
                $categories['categories'][$key]->kml = $this->categoryRepository->generateKmlFile($category)->saveXML();
            }
        }

        return response()->json($categories);
    }

    /**
     * Creates category.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/categories",
     *     description="Creates category.",
     *     produces={"application/json"},
     *     tags={"categories"},
     *      @SWG\Parameter(
     *          description="Name of category",
     *          in="formData",
     *          name="name",
     *          required=true,
     *          type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns new category."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function store(CategoryRequest $request)
    {
        if ($this->role != 'admin' && $this->role != 'sc-user') {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

        $category = new Category();
        $category->name = $request->input('name');
        $category->color = $request->input('color');
        $category = $this->categoryRepository->store($category);

        return response()->json($category, 200);
    }

    /**
     * Display category.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Get(
     *     path="/categories/{id}",
     *     description="Returns requested category.",
     *     produces={"application/json"},
     *     tags={"categories"},
     *     @SWG\Parameter(
     *         description="Category Id",
     *         in="path",
     *         name="id",
     *         required=true,
     *         type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns requested category."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Category not found."
     *     )
     * )
     *
     */
    public function show($id)
    {
        if ($this->role != 'admin' && $this->role != 'sc-user') {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

        try {
            $category = $this->categoryRepository->getById($id);
        } catch (CategoryNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Category not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return response()->json($category, 200);
    }


    /**
     * Updates category.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\PUT(
     *     path="/categories/{id}",
     *     description="Updates category.",
     *     produces={"application/json"},
     *     tags={"categories"},
     *      @SWG\Parameter(
     *          description="Name of category",
     *          in="formData",
     *          name="name",
     *          required=true,
     *          type="string",
     *     ),
     *      @SWG\Parameter(
     *          description="Category Id",
     *          in="path",
     *          name="id",
     *          required=true,
     *          type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns updated Category."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Category not found."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function update(CategoryRequest $request, $id)
    {
        if ($this->role != 'admin' && $this->role != 'sc-user') {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

        try {
            $category = $this->categoryRepository->getById($id);
        } catch (CategoryNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Category not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        $category->name = $request->input('name');
        $category->color = $request->input('color');
        $category = $this->categoryRepository->update($category);

        return response()->json($category, 200);
    }

    /**
     * Removes category.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\DELETE(
     *     path="/categories/{id}",
     *     description="Deletes category if it's not used by any merchant.",
     *     produces={"application/json"},
     *     tags={"categories"},
     *      @SWG\Parameter(
     *          description="Category Id",
     *          in="path",
     *          name="id",
     *          required=true,
     *          type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Category has been successfully deleted."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Category not found."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Can not delete category. It is being used by some merchant."
     *     )
     * )
     */
    public function destroy($id)
    {
        if ($this->role != 'admin' && $this->role != 'sc-user') {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

        try {
            $this->categoryRepository->checkUsage($id);
        } catch (CategoryBeingUsedException $e) {
            return response()->json(['status' => 422, 'message' => 'Can not delete category. It is being used by some merchant.', 'timestamp' => Carbon::now()->toDateTimeString()], 422);
        }

        try {
            $this->categoryRepository->delete($id);
        } catch (CategoryNotFoundException $e) {
            return response()->json(['status' => 400, 'message' => 'Category not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
        }

        return response()->json('Category has been successfully deleted.', 200);
    }

    /**
     * Upload logo.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/categories/{id}/upload-file",
     *     description="Upload logo.",
     *     produces={"application/json"},
     *     tags={"categories"},
     *      @SWG\Parameter(
     *          description="Category id",
     *          in="path",
     *          name="id",
     *          required=true,
     *          type="integer",
     *     ),
     *     @SWG\Parameter(
     *         description="Logo",
     *         in="formData",
     *         name="logo",
     *         required=true,
     *         type="file",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Logo has been successfully uploaded."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Category not found."
     *     )
     * )
     */
    public function uploadFile($id, LogoRequest $logoRequest)
    {
        if ($this->role == 'admin' && $this->role != 'sc-user') {
            try {
                $category = $this->categoryRepository->getById($id);

                $category = $this->categoryRepository->uploadLogo($logoRequest, $category);

                return response()->json($category, 200);
            } catch (CategoryNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Category not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }

    }

    /**
     * Removes logo.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Delete(
     *     path="/categories/{id}/remove-file",
     *     description="Deletes category logo.",
     *     produces={"application/json"},
     *     tags={"categories"},
     *      @SWG\Parameter(
     *          description="Category id",
     *          in="path",
     *          name="id",
     *          required=true,
     *          type="integer",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Logo has been successfully deleted."
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Category not found."
     *     )
     * )
     */
    public function removeFile($id)
    {
        if ($this->role == 'admin' && $this->role != 'sc-user') {
            try {
                $category = $this->categoryRepository->getById($id);

                $this->categoryRepository->removeLogo($category);

                return response()->json('Logo has been successfully deleted.', 200);
            } catch (CategoryNotFoundException $e) {
                return response()->json(['status' => 400, 'message' => 'Category not found.', 'timestamp' => Carbon::now()->toDateTimeString()], 400);
            }
        } else {
            return response()->json(['status' => 401, 'message' => 'Unauthenticated.', 'timestamp' => Carbon::now()->toDateTimeString()], 401);
        }
    }
}
