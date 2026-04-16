<?php

namespace App\Listeners;

use App\Events\VendorApproved;
use App\Models\User;
use App\Notifications\VendorWelcomeNotification;
use Illuminate\Support\Facades\Password;
use Str;

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

        // Avoid duplicates
        $user = User::firstOrCreate(
            ['email' => $vendor->email],
            [
                'name' => $vendor->name,
                'password' => bcrypt(Str::random(32)), // temporary random password
            ]
        );

        $vendor->user_id = $user->id;
        $vendor->save();

        $token = Password::createToken($user);

        $user->notify(new VendorWelcomeNotification($token));
    }
}
