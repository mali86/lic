<?php

namespace App\Contracts\Repositories;

use App\Models\Category;
use Illuminate\Http\Request;

interface CategoryRepository
{
    public function getAllCategories(Request $request);
    public function getCategories($search = null);
    public function getById($id);
    public function store(Category $category);
    public function update(Category $category);
    public function delete($id);
    public function checkUsage($id);
    public function uploadLogo(Request $request, $category);
    public function removeLogo($category);
    public function generateKmlFile($category);
    public function getAllCategoryMerchants($categoryId);
}