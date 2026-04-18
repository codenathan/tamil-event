<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class EnableUserController extends Controller
{
    /**
     * Enable the specified user account.
     */
    public function __invoke(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            abort(403, 'You cannot enable your own account.');
        }

        $user->update(['disabled_at' => null]);

        return redirect()->back()->with('flash.success', 'User account enabled.');
    }
}
