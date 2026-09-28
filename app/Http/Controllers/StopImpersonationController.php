<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Lab404\Impersonate\Services\ImpersonateManager;

final class StopImpersonationController extends Controller
{
    /**
     * Return the impersonating admin to their own account.
     */
    public function __invoke(Request $request, ImpersonateManager $impersonateManager): RedirectResponse
    {
        if (! $impersonateManager->isImpersonating()) {
            abort(403, 'You are not impersonating anyone.');
        }

        if (! $impersonateManager->leave()) {
            abort(500, 'Unable to stop impersonation.');
        }

        $request->session()->forget('auth.password_confirmed_at');

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Impersonation ended.']);

        return redirect()->route('admin.users');
    }
}
