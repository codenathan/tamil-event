<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Lab404\Impersonate\Services\ImpersonateManager;

final class StartImpersonationController extends Controller
{
    /**
     * Log the current admin in as the specified user.
     */
    public function __invoke(Request $request, User $user, ImpersonateManager $impersonateManager): RedirectResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        if ($user->is($admin)) {
            abort(403, 'You cannot impersonate yourself.');
        }

        if (! $admin->canImpersonate() || ! $user->canBeImpersonated()) {
            abort(403, 'This user cannot be impersonated.');
        }

        if (! $impersonateManager->take($admin, $user)) {
            abort(500, 'Unable to start impersonation.');
        }

        $request->session()->forget('auth.password_confirmed_at');

        Inertia::flash('toast', ['type' => 'success', 'message' => "You are now viewing the site as {$user->name}."]);

        return redirect()->route('dashboard');
    }
}
