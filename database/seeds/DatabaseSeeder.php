<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
         $this->call(UsersTableSeeder::class);
         //$this->call(CategoryTableSeeder::class);
         //$this->call(CouponsTableSeeder::class);
         //$this->call(StatesTableSeeder::class);
         //$this->call(AreasTableSeeder::class);
         $this->call(ShoppingCentersTableSeeder::class);
         //$this->call(RelationsSeeder::class);
    }
}
