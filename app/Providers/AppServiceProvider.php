<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Validator;
use League\Flysystem\Exception;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Validator::extend('same_size', function ($attribute, $value, $parameters, $validator) {
            $data = $validator->getData();
            foreach ($parameters as $parameter) {
                if(count($data[$attribute]) != count($data[$parameter])) {
                    return false;
                }
            }
            return true;
            //data[]

        });

        Validator::extend('iso_date', function ($attribute, $value, $parameters, $validator) {
                $regex = '/^(?:[1-9]\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|' .
                    '(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]' .
                    '\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)' .
                    '-02-29)T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:Z|[+-][01]\d:[0-5]\d)$/';

                return preg_match_all($regex, $value) > 0;
            }
        );

        Validator::extend('time_am_pm', function ($attribute, $value, $parameters, $validator) {
                $regex = "(((0[1-9]|[1-9])(AM|am|PM|pm))|((0[1-9]|[1-9]):(0[0-1]|[1-59]\d)(AM|am|PM|pm)))";

                return preg_match_all($regex, $value) > 0;
            }
        );

        Validator::extend('working_hours', function ($attribute, $value, $parameters, $validator) {
                try{
                    $availableDays = Array('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
                    $workingHours = $value;
                    if (!is_array($workingHours)){
                        return false;
                    };
                    foreach ($workingHours as $day) {
                        $regex = "(((0[1-9]|[0-9]) (AM|am|PM|pm))|((0[1-9]|[0-9]):(0[0-1]|[0-59]\d) (AM|am|PM|pm)))";
                        if (!in_array($day['day'], $availableDays)) {
                            return false;
                        }
                        if (!(preg_match_all($regex, $day['from']) > 0)){
                            return false;
                        }
                        if (!(preg_match_all($regex, $day['to']) > 0)){
                            return false;
                        }
                    }

                    return true;
                } catch (Exception $exception) {
                    return false;
                }
            }
        );
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
