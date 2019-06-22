<?php

namespace App\Http\Controllers;

use App\Contracts\Repositories\NewsletterRepository;
use Illuminate\Http\Request;
use App\Http\Requests\NewsletterRequest;

class NewsletterController extends Controller
{
    private $newsletterRepository;
    public function __construct(NewsletterRepository $newsletterRepository)
    {
        $this->newsletterRepository = $newsletterRepository;
    }

    /**
     * Subscribes email to newsletters.
     *
     * @return \Illuminate\Http\JsonResponse
     *
     * @SWG\Post(
     *     path="/newsletters/subscribe",
     *     description="Subscribes email to newsletters",
     *     produces={"application/json"},
     *     tags={"newsletter"},
     *     @SWG\Parameter(
     *         description="E-mail",
     *         in="formData",
     *         name="email",
     *         required=true,
     *         type="string",
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Returns email."
     *     ),
     *     @SWG\Response(
     *         response=422,
     *         description="Validation errors."
     *     )
     * )
     */
    public function subscribe(NewsletterRequest $request)
    {
        $newsletter = $this->newsletterRepository->subscribe($request->input('email'));

        return response()->json($newsletter, 200);
    }
}
