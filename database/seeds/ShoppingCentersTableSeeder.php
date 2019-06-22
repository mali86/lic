<?php

use Illuminate\Database\Seeder;
use App\Models\ShoppingCenter;
use App\Models\Area;
use App\Models\Category;
use App\Models\Merchant;
use App\Models\MerchantCategory;
use App\Models\State;
use App\Models\User;
use Carbon\Carbon;

class ShoppingCentersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        /*$areasIds = DB::table('areas')->pluck('id');


        foreach ($areasIds as $id) {
            factory(ShoppingCenter::class, 1)->create(['area_id' => $id])->each(function(ShoppingCenter $shoppingCenter) {
                $usersIds = DB::table('users')->pluck('id');
                $randomIds=array_rand($usersIds->toArray(), 2);
                foreach ($randomIds as $randId) {
                    factory(\App\Models\Merchant::class, 2)->create(['area_id' => $shoppingCenter->area_id,
                                                                     'user_id' => $usersIds[$randId],
                                                                     'shopping_center_id' => $shoppingCenter->id]);
                }
            });
        }*/
        $client = new \GuzzleHttp\Client();
        $response = $client->request('GET', 'http://lic.thresholdtechnologies.org/merchants.json');

        $body = json_decode($response->getBody(), true);

        foreach ($body as $item)
        {
            if ($item['AreaName']) {
                $area = Area::where('name', '=', $item['AreaName'])->first();

                if (!$area) {
                    $state = State::where('name', '=', $item['StateFull'])->first();
                    $area = new Area();
                    $area->name = $item['AreaName'];
                    $area->state_id = $state->id;

                    $area->save();
                }
            } else {
                $area = Area::first();
            }

            $users = User::where('type', '<', 2)->count();

            if ($item['Type'] == 'shopping_center') {
                $shoppingCenter = new ShoppingCenter();

                $shoppingCenter->area_id = $area->id;
                $shoppingCenter->name = $item['Name'];
                $shoppingCenter->description = ($item['Description']) ? $item['Description'] : '';
                $shoppingCenter->address = $item['Address'] . ' ' . $item['Suite'];
                $shoppingCenter->city = ($item['City']) ? $item['City'] : '';
                $shoppingCenter->zip = ($item['Zip']) ? $item['Zip'] : '';
                $shoppingCenter->website = ($item['Website']) ? $item['Website'] : '';
                $shoppingCenter->lat = 0;
                $shoppingCenter->lon = 0;
                if ($shoppingCenter->name == 'Cabin John Shopping Center and Mall') {
                    $userId = 5;
                } else {
                    $userId = 2;
                }

                $shoppingCenter->save();

                DB::table('shopping_center_users')->insert([
                   'shopping_center_id' => $shoppingCenter->id,
                    'user_id' => $userId
                ]);

                DB::table('sc_working_hours')->insert([
                    "shopping_center_id" => $shoppingCenter->id,
                    "monday_from" => '08:00:00',
                    "monday_to" => '19:00:00',
                    "tuesday_from" => '08:00:00',
                    "tuesday_to" => '19:00:00',
                    "wednesday_from" => '08:00:00',
                    "wednesday_to" => '19:00:00',
                    "thursday_from" => '08:00:00',
                    "thursday_to" => '19:00:00',
                    "friday_from" => '08:00:00',
                    "friday_to" => '19:00:00',
                    "saturday_from" => '08:00:00',
                    "saturday_to" => '19:00:00',
                    "sunday_from" => '08:00:00',
                    "sunday_to" => '19:00:00',
                    "created_at" =>Carbon::now()->toDateTimeString(),
                    "updated_at" =>Carbon::now()->toDateTimeString(),
                    ]);

            } else if ($item['Type'] == 'shop') {
                $shoppingCenter = ShoppingCenter::where('name', '=', $item['ShopCenterName'])->first();

                $merchant = new Merchant();

                $merchant->area_id = $area->id;
                $merchant->name = $item['Name'];
                $merchant->shopping_center_id = ($shoppingCenter) ? $shoppingCenter->id : null;
                $merchant->shopping_center_name = $item['ShopCenterName'];
                $merchant->website = $item['Website'];
                $merchant->phone = $item['Phone'];
                $merchant->city = $item['City'];
                $merchant->address = $item['Address'] . ' ' . $item['Suite'];
                $merchant->zip = $item["Zip"];
                $merchant->lat = $item['lat'];
                $merchant->lon = $item['lng'];
                $merchant->approved = true;
                if ($merchant->name == "Attman's Deli") {
                    $userId = 6;
                } else {
                    $userId = 3;//random_int(1, $users);
                }

                $merchant->save();

                DB::table('merchant_users')->insert([
                    'merchant_id' => $merchant->id,
                    'user_id' => $userId
                ]);

                if ($item['CouponLink']) {
                    $coupon = new \App\Models\Coupon();
                    if ($item['CouponDescription']) {
                        $coupon->title = $item['CouponDescription'];
                        $coupon->description = $item['CouponDescription'];
                        $coupon->merchant_id = $merchant->id;
                        $coupon->active = true;
                        $coupon->start_date = Carbon::now()->toDateString();
                        $coupon->end_date = Carbon::now()->addWeeks(2)->toDateString();
                    } else {
                        $coupon->title = '';
                        $coupon->description = '';
                        $coupon->merchant_id = $merchant->id;
                        $coupon->active = true;
                        $coupon->start_date = Carbon::now()->toDateString();
                        $coupon->end_date = Carbon::now()->addWeeks(2)->toDateString();
                    }

                    $coupon->save();

                    DB::table('coupon_files')->insert([
                            'coupon_id' => $coupon->id,
                            'url' => $item['CouponLink'],
                        ]
                    );
                }

                if ($item['CategoryName']) {
                    $category = Category::where('name', '=', $item['CategoryName'])->first();

                    if (!$category) {
                        $category = new Category();

                        $category->name = $item['CategoryName'];

                        $category->save();
                    }

                    $merchantCategory = new MerchantCategory();

                    $merchantCategory->merchant_id = $merchant->id;
                    $merchantCategory->category_id = $category->id;

                    $merchantCategory->save();
                }

                if ($shoppingCenter) {
                    if ($shoppingCenter->lat == 0) {
                        $shoppingCenter->lat = $item['lat'];
                        $shoppingCenter->lon = $item['lng'];

                        $shoppingCenter->update();
                    }
                }
            }
        }
    }
}
