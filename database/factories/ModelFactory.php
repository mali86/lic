<?php

/*
|--------------------------------------------------------------------------
| Model Factories
|--------------------------------------------------------------------------
|
| Here you may define all of your model factories. Model factories give
| you a convenient way to create models for testing and seeding your
| database. Just tell the factory how a default model should look.
|
*/

$factory->define(App\Models\User::class, function (Faker\Generator $faker) {
    static $password;

    return [
        'type' => 1,
        'first_name' => $faker->firstName,
        'last_name' => $faker->lastName,
        'email' => $faker->unique()->safeEmail,
        'password' => $password ?: $password = bcrypt('secret'),
        'approved' => $faker->boolean()
    ];
});

$factory->define(App\Models\Category::class, function (Faker\Generator $faker) {
    return [
        'name' => $faker->colorName,
        'logo' => $faker->imageUrl(50, 50)
    ];
});

$factory->define(App\Models\Coupon::class, function (Faker\Generator $faker) {
    return [
        'title' => $faker->word,
        'description' => $faker->paragraph,
    ];
});

$factory->define(App\Models\State::class, function (Faker\Generator $faker) {
    return [
        'name' => $faker->state
    ];
});

$factory->define(App\Models\Area::class, function (Faker\Generator $faker) {
    return [
        'name' => $faker->state
    ];
});

$factory->define(App\Models\ShoppingCenter::class, function (Faker\Generator $faker) {
    return [
        'name' => $faker->word,
        'description' => $faker->paragraph,
        'address' => $faker->address,
        'city' => $faker->city,
        'zip' => $faker->postcode,
        'website' => $faker->url,
        'lat' => $faker->latitude,
        'lon' => $faker->longitude,
    ];
});

$factory->define(App\Models\Merchant::class, function (Faker\Generator $faker) {
    return [
        'zip' => $faker->postcode,
        'phone' => $faker->phoneNumber,
        'website' => $faker->url,
        'lat' => $faker->latitude,
        'lon' => $faker->longitude,
        'name' => $faker->company
    ];
});
