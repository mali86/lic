<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMerchantCouponsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
       /* Schema::create('merchant_coupons', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('coupon_id')->unsigned();
            $table->integer('merchant_id')->unsigned();
            $table->boolean('active')->default(false);
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();
            $table->foreign('coupon_id')->references('id')->on('coupons');
            $table->foreign('merchant_id')->references('id')->on('merchants')->onDelete('cascade');
        });*/
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //Schema::drop('merchant_coupons');
    }
}
