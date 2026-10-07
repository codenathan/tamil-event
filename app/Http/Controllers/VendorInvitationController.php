<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\AcceptVendorInvitationRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

final class VendorInvitationController extends Controller
{
    /**
     * Show the "set your password" form for a newly approved vendor.
     */
    public function show(Request $request, User $user): Response|RedirectResponse
    {
        if ($redirect = $this->rejectUnusableLink($request, $user)) {
            return $redirect;
        }

        return Inertia::render('auth/accept-vendor-invitation', [
            'email' => $user->email,
            'action' => $request->fullUrl(),
        ]);
    }

    /**
     * Set the vendor's password and log them in.
     */
    public function store(AcceptVendorInvitationRequest $request, User $user): RedirectResponse
    {
        if ($redirect = $this->rejectUnusableLink($request, $user)) {
            return $redirect;
        }

        $user->forceFill([
            'password' => $request->validated('password'),
            'password_set_at' => now(),
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();

        Auth::login($user);
        $request->session()->regenerate();

        return to_route('dashboard');
    }

    /**
     * Send expired, tampered or already-used links somewhere useful instead of a 403.
     */
    private function rejectUnusableLink(Request $request, User $user): ?RedirectResponse
    {
        if (! $request->hasValidSignature()) {
            return to_route('password.request')
                ->with('status', __('This link has expired. Enter your email below and we will send you a new one.'));
        }

        if ($user->password_set_at !== null) {
            return to_route('login')
                ->with('status', __('Your password has already been set. Please log in.'));
        }

        return null;
    }
}
