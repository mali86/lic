<?php

use Illuminate\Database\Seeder;

class CouponsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        factory(\App\Models\Coupon::class, 10)->create()->each(function (\App\Models\Coupon $coupon) {
            //Add coupon files
            $faker = Faker\Factory::create();

            DB::table('coupon_files')->insert([
                    'coupon_id' => $coupon->id,
                    'url' => $faker->imageUrl(),
                ]
            );
        });
    }
}
