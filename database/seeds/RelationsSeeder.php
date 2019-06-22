<?php

use Illuminate\Database\Seeder;
use Carbon\Carbon;
use App\Models\MerchantCategory;
use App\Models\MerchantCoupon;

class RelationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        /*
         * Merchant categories & coupons
         */
        $faker = Faker\Factory::create();
        $merchantIds = DB::table('merchants')->pluck('id');
        //$categoryIds = DB::table('categories')->pluck('id');
        $couponIds = DB::table('coupons')->pluck('id');

        foreach($merchantIds as $merchantId) {
            //$randomCategoryIds=array_rand($categoryIds->toArray(), 2);
            $randomCouponIds=array_rand($couponIds->toArray(), 2);

            for($i=0; $i<2; $i++) {
                /*MerchantCategory::create([
                    'category_id' => $categoryIds[$randomCategoryIds[$i]],
                    'merchant_id' => $merchantId
                ]);*/
                MerchantCoupon::create([
                    'coupon_id' => $couponIds[$randomCouponIds[$i]],
                    'merchant_id' => $merchantId,
                    'active' => $faker->boolean(),
                    'start_date' => Carbon::now()->toDateString(),
                    'end_date' => Carbon::now()->addWeeks(2)->toDateString(),
                ]);
            }
        }
    }
}
