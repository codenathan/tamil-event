<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response|RedirectResponse
    {
        $user = $request->user();

        $url = match (true) {
            $user->hasRole('admin') => route('admin.dashboard'),
            default                 => route('dashboard'),
        };

        return redirect($url);
    }
}
