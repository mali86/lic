<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of the routes that are handled
| by your application. Just tell Laravel the URIs it should respond
| to using a Closure or controller method. Build something great!
|
*/
Route::get('/', 'UsersController@trackIndexPage');
Route::get('logs', '\Rap2hpoutre\LaravelLogViewer\LogViewerController@index');
Route::get('/install/{key?}', function ($key = null) {
    if($key == "life-is-a-coupon-init"){
        try {
            echo '<br><b>Start with init. Don\'t close window before get finished message.</b>';
            echo '<br>init with app tables migrations...';
            Artisan::call('migrate');
            echo '<br>done with app tables migrations';
            echo '<br>init with states and areas scrap...';
            Artisan::call('add-states-and-areas');
            echo '<br>done with states and areas scrap';
            echo '<br>init with Sentry tables seeder...';
            Artisan::call('db:seed');
            echo '<br>done with Sentry tables seeder';

            echo '<br><b>Init is finished. You now can close window.</b>';
        } catch (Exception $e) {
            Response::make($e->getMessage(), 500);
        }
    }else{
        App::abort(404);
    }
});



/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
/*Route::group(['prefix' => 'admin', 'middleware' => ['auth.admin']], function () {
    Route::get('coupons/count', 'Admin\CouponsController@count');
    Route::get('merchants/count', 'Admin\MerchantsController@count');
    Route::get('merchants/unapproved', 'Admin\MerchantsController@unapprovedMerchants');
    Route::put('merchants/{id}/approve', 'Admin\MerchantsController@approveMerchant');
    Route::put('merchants/{id}/disapprove', 'Admin\MerchantsController@disapproveMerchant');
    Route::get('merchants/unapproved-count', 'Admin\MerchantsController@unapprovedMerchantsCount');
    Route::post('merchants/{id}/upload-file', 'Admin\MerchantsController@uploadFile');
    Route::delete('merchants/{id}/remove-file', 'Admin\MerchantsController@removeFile');
    Route::resource('merchants', 'Admin\MerchantsController', ['except' => ['create', 'edit']]);
    Route::resource('coupons', 'Admin\CouponsController', ['except' => ['create', 'edit']]);
    Route::post('coupons/{id}/upload-file', 'Admin\CouponsController@uploadFile');
    Route::delete('coupons/remove-file/{id}', 'Admin\CouponsController@removeFile');
    Route::put('coupons/{id}/activate', 'Admin\CouponsController@activateCoupon');
    Route::put('coupons/{id}/deactivate', 'Admin\CouponsController@deactivateCoupon');
});
Route::group(['prefix' => 'user', 'middleware' => ['auth.user']], function () {
    Route::resource('coupons', 'User\CouponsController', ['except' => ['create', 'edit']]);

    Route::post('coupons/{id}/upload-file', 'User\CouponsController@uploadFile');
    Route::delete('coupons/remove-file/{id}', 'User\CouponsController@removeFile');
    Route::get('merchants/count', 'User\MerchantsController@count');
    Route::post('merchants/{id}/upload-file', 'User\MerchantsController@uploadFile');
    Route::delete('merchants/{id}/remove-file', 'User\MerchantsController@removeFile');
    Route::resource('merchants', 'User\MerchantsController', ['except' => ['create', 'edit']]);
});*/

Route::post('categories/{id}/upload-file', 'CategoriesController@uploadFile');
Route::delete('categories/{id}/remove-file', 'CategoriesController@removeFile');
Route::get('categories/{id}/kml', 'CategoriesController@kml');
Route::get('categories/{id}/kml/coordinates', 'CategoriesController@kmlCoordinates');
Route::post('categories/{id}/update-colors', 'CategoriesController@updateColors');
Route::post('/merchants/{id}/update-coordinates', 'MerchantsController@updateCoordinates');

Route::get('shopping-centers/unapproved', 'ShoppingCentersController@unapprovedShoppingCenters');
Route::get('shopping-centers/unapproved-count', 'ShoppingCentersController@unapprovedShoppingCentersCount');
Route::put('shopping-centers/{id}/approve', 'ShoppingCentersController@approveShoppingCenter');
Route::put('shopping-centers/{id}/disapprove', 'ShoppingCentersController@disapproveShoppingCenter');

Route::get('merchants/unapproved', 'MerchantsController@unapprovedMerchants');
Route::get('merchants/count', 'MerchantsController@count');
Route::get('merchants/unapproved-count', 'MerchantsController@unapprovedMerchantsCount');
Route::resource('merchants', 'MerchantsController', ['except' => ['create', 'edit']]);


Route::put('merchants/{id}/approve', 'MerchantsController@approveMerchant');
Route::put('merchants/{id}/disapprove', 'MerchantsController@disapproveMerchant');

Route::post('merchants/{id}/subscribe', 'MerchantsController@subscribe');
Route::delete('merchants/{id}/unsubscribe', 'MerchantsController@unsubscribe');
Route::post('notification', 'UsersController@sendNotification');

Route::post('merchants/{id}/upload-file', 'MerchantsController@uploadFile');
Route::delete('merchants/{id}/remove-file', 'MerchantsController@removeFile');
Route::post('/merchants', 'MerchantsController@store');
Route::get('/merchants/area/count', 'MerchantsController@searchMerchantsCount');
Route::get('/merchants/get-address/{zip}', 'MerchantsController@searchAddressByZipCode');

Route::post('/shopping-centers/{id}/upload-file', 'ShoppingCentersController@uploadFile');
Route::delete('/shopping-centers/{id}/remove-file', 'ShoppingCentersController@removeFile');
Route::get('/shopping-centers/{id}/merchants', 'MerchantsController@searchMerchantsByShoppingCenters');
Route::get('/areas/{id}/shopping-centers', 'ShoppingCentersController@searchShoppingCentersByArea');
Route::get('/merchants/shopping-center/{id}', 'MerchantsController@searchMerchantsByShoppingCenters');
Route::get('/shopping-centers/area/{id}', 'ShoppingCentersController@searchShoppingCentersByArea');
Route::get('/shopping-centers/area-name/{name}', 'ShoppingCentersController@searchShoppingCentersByName');

Route::post('/newsletters/subscribe', 'NewsletterController@subscribe');
Route::get('/check-email', 'Auth\RegisterController@checkEmail');
Route::resource('coupons', 'CouponsController', ['except' => ['create', 'edit']]);
Route::resource('shopping-centers', 'ShoppingCentersController', ['except' => ['create', 'edit']]);
Route::resource('areas', 'AreasController', ['except' => ['create', 'edit']]);
Route::resource('categories', 'CategoriesController', ['except' => ['create', 'edit']]);
Route::get('users/me', 'UsersController@me');
Route::get('users/get-info', 'UsersController@getInfo');
Route::put('users/notifications/enable', 'UsersController@enableNotifications');
Route::put('users/notifications/disable', 'UsersController@disableNotifications');
Route::put('users/confirm/email', 'UsersController@confirm');
Route::get('users/check-token', 'UsersController@checkToken');
Route::get('users', 'UsersController@index');
Route::put('users/{id}', 'UsersController@updateUserDetails');
Route::delete('users/{id}', 'UsersController@destroy');
Route::put('users/{id}/activate', 'UsersController@activate');
Route::put('users/{id}/deactivate', 'UsersController@deactivate');
Route::put('users/{id}/change-password', 'UsersController@changePassword');
Route::post('users', 'UsersController@createNewUser');
Route::get('users/typeInfo/{id}', 'UsersController@typeInfo');
Route::put('coupons/{id}/activate', 'CouponsController@activateCoupon');
Route::put('coupons/{id}/deactivate', 'CouponsController@deactivateCoupon');
Route::post('coupons/{id}/upload-file', 'CouponsController@uploadFile');
Route::delete('coupons/{coupon_id}/remove-file/{file_id}', 'CouponsController@removeFile');

Route::get('merchants/{id}/coupons', 'MerchantsController@searchCouponsByMerchants');

Auth::routes();
Route::get('states', 'ShoppingCentersController@getStates');
Route::get('search', 'SearchController@search');
Route::get('home', 'ShoppingCentersController@home');
Route::get('statistic', 'ShoppingCentersController@statistic');

