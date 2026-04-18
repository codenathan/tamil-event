<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class DisableUserController extends Controller
{
    /**
     * Disable the specified user account.
     */
    public function __invoke(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            abort(403, 'You cannot disable your own account.');
        }

        $user->update(['disabled_at' => now()]);

        DB::table('sessions')->where('user_id', $user->getKey())->delete();

        return redirect()->back()->with('flash.success', 'User account disabled.');
    }
}
