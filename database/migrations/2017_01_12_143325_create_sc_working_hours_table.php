<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateScWorkingHoursTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sc_working_hours', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('shopping_center_id')->unsigned();
            $table->time('monday_from')->nullable();
            $table->time('monday_to')->nullable();
            $table->time('tuesday_from')->nullable();
            $table->time('tuesday_to')->nullable();
            $table->time('wednesday_from')->nullable();
            $table->time('wednesday_to')->nullable();
            $table->time('thursday_from')->nullable();
            $table->time('thursday_to')->nullable();
            $table->time('friday_from')->nullable();
            $table->time('friday_to')->nullable();
            $table->time('saturday_from')->nullable();
            $table->time('saturday_to')->nullable();
            $table->time('sunday_from')->nullable();
            $table->time('sunday_to')->nullable();
            $table->timestamps();
            $table->foreign('shopping_center_id')->references('id')->on('shopping_centers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('sc_working_hours');
    }
}
