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
use Tests\TestCase;

class VendorMailNotificationsTest extends TestCase
{
    use RefreshDatabase;

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

        $mail = (new VendorWelcomeNotification('test-token'))->toMail($user);

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
}
