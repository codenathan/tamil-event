<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\VendorWelcomeNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class VendorInvitationTest extends TestCase
{
    use RefreshDatabase;

    public function test_welcome_email_links_to_signed_invitation_valid_for_seven_days(): void
    {
        $user = User::factory()->create();

        $mail = (new VendorWelcomeNotification)->toMail($user);

        $this->assertStringContainsString(route('vendor-invitation.show', $user), $mail->actionUrl);
        $this->assertStringContainsString('signature=', $mail->actionUrl);

        $this->travel(VendorWelcomeNotification::LINK_EXPIRES_IN_DAYS)->days();
        $this->travel(-1)->minutes();

        $this->get($mail->actionUrl)->assertOk();
    }

    public function test_invitation_page_renders_for_valid_link(): void
    {
        $user = User::factory()->create();

        $this->get($this->invitationUrl($user))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/accept-vendor-invitation')
                ->where('email', $user->email)
                ->where('action', fn (string $action) => str_contains($action, 'signature=')),
            );
    }

    public function test_vendor_can_set_password_and_is_logged_in(): void
    {
        $user = User::factory()->unverified()->create();

        $this->post($this->invitationUrl($user), [
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ])->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);

        $user->refresh();
        $this->assertTrue(Hash::check('new-secure-password', $user->password));
        $this->assertNotNull($user->password_set_at);
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_password_must_be_confirmed(): void
    {
        $user = User::factory()->create();

        $this->post($this->invitationUrl($user), [
            'password' => 'new-secure-password',
            'password_confirmation' => 'something-else',
        ])->assertSessionHasErrors('password');

        $this->assertGuest();
        $this->assertNull($user->refresh()->password_set_at);
    }

    public function test_expired_link_redirects_to_forgot_password(): void
    {
        $user = User::factory()->create();
        $url = $this->invitationUrl($user);

        $this->travel(VendorWelcomeNotification::LINK_EXPIRES_IN_DAYS + 1)->days();

        $this->get($url)
            ->assertRedirect(route('password.request'))
            ->assertSessionHas('status');

        $this->post($url, [
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ])->assertRedirect(route('password.request'));

        $this->assertGuest();
        $this->assertNull($user->refresh()->password_set_at);
    }

    public function test_tampered_link_is_rejected(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $tamperedUrl = str_replace(
            route('vendor-invitation.show', $user),
            route('vendor-invitation.show', $otherUser),
            $this->invitationUrl($user),
        );

        $this->get($tamperedUrl)->assertRedirect(route('password.request'));

        $this->post($tamperedUrl, [
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ])->assertRedirect(route('password.request'));

        $this->assertNull($otherUser->refresh()->password_set_at);
    }

    public function test_link_cannot_be_reused_after_password_is_set(): void
    {
        $user = User::factory()->create(['password_set_at' => now()]);
        $originalPassword = $user->password;

        $this->get($this->invitationUrl($user))
            ->assertRedirect(route('login'))
            ->assertSessionHas('status');

        $this->post($this->invitationUrl($user), [
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ])->assertRedirect(route('login'));

        $this->assertGuest();
        $this->assertSame($originalPassword, $user->refresh()->password);
    }

    private function invitationUrl(User $user): string
    {
        return URL::temporarySignedRoute(
            'vendor-invitation.show',
            now()->addDays(VendorWelcomeNotification::LINK_EXPIRES_IN_DAYS),
            ['user' => $user],
        );
    }
}
