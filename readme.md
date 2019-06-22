# Life is a coupon


## How To Install

1. Clone repository.
2. Run `composer install` to install dependencies.
3. Create a copy of `.env.example` file, rename it to `.env` and input your own values.
4. Run `php artisan migrate` to create database tables.
5. Run `php artisan key:generate` to generate random crypto key.
6. Run `php artisan add-states-and-areas` to scrap and store in database all states and areas in USA.
7. Run `php artisan db:seed` to fill database tables with test data.
8. Add Laravel Schedule to cron jobs on server

In order for site to function properly, following directories need to be writable by server:

- storage
- public/files


## Important
**This may take a while**

You can skip steps 4, 6 and 7 opening `http://webiste.com/install/life-is-a-coupon-init` (change website.com with domain name)



## Testing with swagger

`route: http://website.com/swagger/index.html`
**On top of page added input for OAuth token**