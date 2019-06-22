<?php

namespace App\Console;

use App\Models\PasswordReset;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Models\MerchantCoupon;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\AddStatesAndAreas::class
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->call(function () {
            //unlock user account after 15 minutes
           $timeNow = Carbon::now()->subMinute(15);
            $users = User::where('locked', '=', 1)
                ->where('locked_down_time', '<', $timeNow)
                ->get();
            if ($users) {
                foreach ($users as $user) {
                    $user->locked = 0;
                    $user->attempts = 3;
                    $user->update();
                }
            }

            //remove token for reset password after 15 minutes, but for users created by admin don't reset token for passwords (user type=0)
            PasswordReset::join('users', 'users.email', '=', 'password_resets.email')
                ->where('password_resets.created_at', '<', $timeNow)
                ->where('users.type', '>', 0)
                ->delete();
        })->everyMinute();

        $schedule->call(function() {
            //Coupons activation
            MerchantCoupon::where('start_date', Carbon::today()->toDateString())
                          ->update(['active' => 1]);

            //Coupon deactivation
            MerchantCoupon::where('end_date', Carbon::yesterday()->toDateString())
                          ->update(['active' => 0]);
        })->dailyAt('00:01');

    }

    /**
     * Register the Closure based commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        require base_path('routes/console.php');
    }
}
