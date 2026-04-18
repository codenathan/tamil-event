<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\VendorApproved;
use App\Models\User;
use App\Notifications\VendorWelcomeNotification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class CreateVendorUser
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(VendorApproved $event): void
    {
        $vendor = $event->vendor;

        $user = User::firstOrCreate(
            ['email' => $vendor->email],
            [
                'name' => $vendor->name,
                'password' => bcrypt(Str::random(32)),
            ]
        );

        $user->assignRole('vendor');

        $vendor->user_id = $user->id;
        $vendor->save();

        $token = Password::createToken($user);

        $user->notify(new VendorWelcomeNotification($token));
    }
}
