<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\VendorStatusEnum;
use App\Events\VendorApproved;
use App\Models\Category;
use App\Models\City;
use App\Models\Country;
use App\Models\User;
use App\Models\Vendor;
use App\Notifications\AdminNewVendorSignupNotification;
use App\Notifications\VendorNewEnquiryNotification;
use App\Notifications\VendorWelcomeNotification;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Support\Facades\Notification;
use RyanChandler\LaravelCloudflareTurnstile\Facades\Turnstile;
use Tests\TestCase;

class VendorMailNotificationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Turnstile::fake();
    }

    public function test_list_your_business_notifies_admin_via_queue(): void
    {
        Notification::fake();

        $category = Category::factory()->create(['name' => 'Photography']);
        $country = Country::factory()->create(['name' => 'Sri Lanka', 'slug' => 'sri-lanka']);
        $city = City::factory()->create([
            'country_id' => $country->id,
            'name' => 'Colombo',
            'slug' => 'colombo',
        ]);

        $this->get(route('list-your-business'));

        $response = $this->post(route('list-your-business.store'), [
            'businessName' => 'Acme Photography',
            'category' => $category->slug,
            'country' => $country->name,
            'city' => $city->name,
            'description' => 'Professional wedding photography.',
            'phone' => '+94771234567',
            'email' => 'vendor@example.com',
            'website' => '',
            'instagram' => '',
            'facebook' => '',
            'services' => [],
            'agreeTerms' => true,
        ]);

        $response->assertRedirect(route('list-your-business'));

        Notification::assertSentOnDemand(
            AdminNewVendorSignupNotification::class,
            function (AdminNewVendorSignupNotification $notification, array $channels, AnonymousNotifiable $notifiable): bool {
                return in_array('mail', $channels, true)
                    && ($notifiable->routes['mail'] ?? null) === config('mail.admin.address')
                    && $notification->vendor->email === 'vendor@example.com';
            },
        );
    }

    public function test_vendor_welcome_notification_bccs_admin(): void
    {
        config(['mail.admin.address' => 'info@tamileventplanner.com']);

        $user = User::factory()->create(['email' => 'vendor@example.com']);

        $mail = (new VendorWelcomeNotification)->toMail($user);

        $this->assertSame(
            config('mail.admin.address'),
            $mail->bcc[0][0] ?? null,
        );
    }

    public function test_vendor_new_enquiry_notification_bccs_admin(): void
    {
        config(['mail.admin.address' => 'info@tamileventplanner.com']);

        $vendor = Vendor::factory()->create();
        $enquire = $vendor->enquires()->create([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'date' => now()->addMonth(),
            'message' => 'Interested in your services.',
        ]);

        $mail = (new VendorNewEnquiryNotification($enquire))->toMail($vendor);

        $this->assertSame(
            config('mail.admin.address'),
            $mail->bcc[0][0] ?? null,
        );
    }

    public function test_enquiry_without_turnstile_token_is_rejected(): void
    {
        Notification::fake();

        $vendor = Vendor::factory()->create(['is_active' => true]);

        $this->post(route('vendors.enquire.store', $vendor), [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'date' => now()->addWeek()->toDateString(),
            'message' => 'We would love to book you.',
        ])->assertSessionHasErrors(['cf-turnstile-response' => 'Please complete the security check.']);

        $this->assertDatabaseCount('enquires', 0);
        Notification::assertNothingSent();
    }

    public function test_enquiry_with_failed_turnstile_verification_is_rejected(): void
    {
        Notification::fake();
        Turnstile::fake()->fail();

        $vendor = Vendor::factory()->create(['is_active' => true]);

        $this->post(route('vendors.enquire.store', $vendor), [
            'cf-turnstile-response' => Turnstile::dummy(),
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'date' => now()->addWeek()->toDateString(),
            'message' => 'We would love to book you.',
        ])->assertSessionHasErrors('cf-turnstile-response');

        $this->assertDatabaseCount('enquires', 0);
        Notification::assertNothingSent();
    }

    public function test_vendor_approval_sends_welcome_email_to_vendor(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        Notification::fake();

        $vendor = Vendor::factory()->create([
            'email' => 'approved@example.com',
            'is_active' => false,
            'status' => VendorStatusEnum::PENDING,
        ]);

        event(new VendorApproved($vendor));

        $user = User::query()->where('email', 'approved@example.com')->first();
        $this->assertNotNull($user);

        Notification::assertSentTo($user, VendorWelcomeNotification::class);
    }

    public function test_enquiry_submission_notifies_vendor(): void
    {
        Notification::fake();

        $vendor = Vendor::factory()->create([
            'email' => 'listing@example.com',
            'is_active' => true,
        ]);

        $this->get(route('vendors.show', $vendor));

        $this->post(route('vendors.enquire.store', $vendor), [
            'cf-turnstile-response' => Turnstile::dummy(),
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'date' => now()->addWeek()->toDateString(),
            'message' => 'We would love to book you.',
        ])
            ->assertRedirect();

        Notification::assertSentOnDemand(
            VendorNewEnquiryNotification::class,
            function (VendorNewEnquiryNotification $notification, array $channels, AnonymousNotifiable $notifiable): bool {
                return in_array('mail', $channels, true)
                    && ($notifiable->routes['mail'] ?? null) === 'listing@example.com';
            },
        );
    }

    public function test_enquiry_mail_includes_phone_when_provided(): void
    {
        $vendor = Vendor::factory()->create();
        $enquire = $vendor->enquires()->create([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '+44 7700 900123',
            'date' => now()->addMonth(),
            'message' => 'Interested in your services.',
        ]);

        $mail = (new VendorNewEnquiryNotification($enquire))->toMail($vendor);

        $this->assertContains('**Phone** +44 7700 900123', $mail->introLines);
    }

    public function test_enquiry_mail_omits_phone_line_when_not_provided(): void
    {
        $vendor = Vendor::factory()->create();
        $enquire = $vendor->enquires()->create([
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'date' => now()->addMonth(),
            'message' => 'Interested in your services.',
        ]);

        $mail = (new VendorNewEnquiryNotification($enquire))->toMail($vendor);

        foreach ($mail->introLines as $line) {
            $this->assertStringNotContainsString('**Phone**', (string) $line);
        }
    }

    public function test_enquiry_submission_stores_optional_phone(): void
    {
        Notification::fake();

        $vendor = Vendor::factory()->create(['is_active' => true]);

        $this->post(route('vendors.enquire.store', $vendor), [
            'cf-turnstile-response' => Turnstile::dummy(),
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '+44 7700 900123',
            'date' => now()->addWeek()->toDateString(),
            'message' => 'We would love to book you.',
        ])->assertSessionHasNoErrors();

        $this->post(route('vendors.enquire.store', $vendor), [
            'cf-turnstile-response' => Turnstile::dummy(),
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'date' => now()->addWeek()->toDateString(),
            'message' => 'No phone this time.',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('enquires', ['email' => 'jane@example.com', 'phone' => '+44 7700 900123']);
        $this->assertDatabaseHas('enquires', ['email' => 'john@example.com', 'phone' => null]);
    }

    public function test_enquiry_submission_rejects_invalid_phone(): void
    {
        Notification::fake();

        $vendor = Vendor::factory()->create(['is_active' => true]);

        $this->post(route('vendors.enquire.store', $vendor), [
            'cf-turnstile-response' => Turnstile::dummy(),
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => 'call me maybe',
            'date' => now()->addWeek()->toDateString(),
            'message' => 'We would love to book you.',
        ])->assertSessionHasErrors('phone');

        $this->assertDatabaseCount('enquires', 0);
    }
}
