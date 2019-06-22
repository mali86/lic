<?php
/**
 * Created by PhpStorm.
 * User: Nikola
 * Date: 12/2/2016
 * Time: 11:25 AM
 */

namespace App\Repositories;

use App\Contracts\Repositories\NewsletterRepository;
use App\Models\Newsletter;


class EloquentNewsletterRepository implements NewsletterRepository
{
    public function subscribe($email)
    {
        $newsletter = new Newsletter();
        $newsletter->email = $email;
        $newsletter->save();

        return $newsletter;
    }
}