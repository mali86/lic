<?php

use Illuminate\Database\Seeder;

class MerchantsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $shoppingCentersIds = DB::table('shopping_centers')->pluck('id');

        foreach ($shoppingCentersIds as $id) {
            factory(Area::class, 2)->create(['state_id' => $id]);
        }
    }
}
