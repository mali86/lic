<?php

namespace App\Contracts\Repositories;

use App\Models\Category;

interface NewsletterRepository
{
    public function subscribe($email);
}