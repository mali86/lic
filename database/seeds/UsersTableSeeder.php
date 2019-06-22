<?php

use Illuminate\Database\Seeder;
use App\Models\User;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::create([
            'type' => 3,
            'first_name' => 'Admin',
            'last_name' => 'Admin',
            'email' => 'test@admin.com',
            'password' => bcrypt('admin')
        ]);
        User::create([
            'type' => 2,
            'first_name' => 'Shop',
            'last_name' => 'user',
            'email' => 'shop@user.com',
            'password' => bcrypt('secret')
        ]);
        User::create([
            'type' => 1,
            'first_name' => 'Larry',
            'last_name' => 'Stromberg',
            'email' => 'stromberg@threshtech.com',
            'password' => bcrypt('secret')
        ]);
        User::create([
            'type' => 3,
            'first_name' => 'Admin',
            'last_name' => 'Admin',
            'email' => 'admin@lifeisacoupone.info',
            'password' => bcrypt('admin')
        ]);

        User::create([
            'type' => 2,
            'first_name' => 'Cabin',
            'last_name' => 'John',
            'email' => 'cabinjohn@shoppingcenter.info',
            'password' => bcrypt('secret')
        ]);
        User::create([
            'type' => 1,
            'first_name' => 'Attamans',
            'last_name' => 'Deli',
            'email' => 'attmansdeli@merchant.info',
            'password' => bcrypt('secret')
        ]);
        //factory(User::class, 10)->create();
    }
}
