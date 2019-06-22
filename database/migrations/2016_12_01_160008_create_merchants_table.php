<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMerchantsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('merchants', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('area_id')->unsigned();
            $table->integer('shopping_center_id')->unsigned()->nullable();
            $table->string('name');
            $table->string('shopping_center_name')->nullable();
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->string('zip')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->double('lat')->nullable();
            $table->double('lon')->nullable();
            $table->string('logo')->nullable();
            $table->boolean('approved')->default(false);
            $table->timestamps();
            $table->foreign('area_id')->references('id')->on('areas');
            $table->foreign('shopping_center_id')->references('id')->on('shopping_centers');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('merchants');
    }
}
