<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     */
    public function boot()
    {
        //
    }

    /**
     * Register the application services.
     */
    public function register()
    {
        $this->app->bind('App\Contracts\Repositories\UserRepository', 'App\Repositories\EloquentUserRepository');
        $this->app->bind('App\Contracts\Repositories\CategoryRepository', 'App\Repositories\EloquentCategoryRepository');
        $this->app->bind('App\Contracts\Repositories\CouponRepository', 'App\Repositories\EloquentCouponRepository');
        $this->app->bind('App\Contracts\Repositories\AreaRepository', 'App\Repositories\EloquentAreaRepository');
        $this->app->bind('App\Contracts\Repositories\ShoppingCenterRepository', 'App\Repositories\EloquentShoppingCenterRepository');
        $this->app->bind('App\Contracts\Repositories\MerchantRepository', 'App\Repositories\EloquentMerchantRepository');
        $this->app->bind('App\Contracts\Repositories\NewsletterRepository', 'App\Repositories\EloquentNewsletterRepository');
    }
}