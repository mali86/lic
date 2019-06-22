<?php

use Illuminate\Database\Seeder;
use App\Models\Area;

class AreasTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        /*$stateIds = DB::table('states')->pluck('id');

        foreach ($stateIds as $id) {
            factory(Area::class, 5)->create(['state_id' => $id]);
        }*/
    }
}
