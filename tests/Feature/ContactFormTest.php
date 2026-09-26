<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use RyanChandler\LaravelCloudflareTurnstile\Facades\Turnstile;
use Tests\TestCase;

class ContactFormTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Turnstile::fake();
    }

    public function test_contact_message_with_valid_turnstile_is_stored(): void
    {
        $this->post(route('contact.store'), [
            'cf-turnstile-response' => Turnstile::dummy(),
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '+44 7700 900123',
            'message' => 'Do you list venues in Toronto?',
        ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('contact'));

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'jane@example.com',
            'message' => 'Do you list venues in Toronto?',
        ]);
    }

    public function test_contact_message_without_turnstile_token_is_rejected(): void
    {
        $this->post(route('contact.store'), [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '+44 7700 900123',
            'message' => 'Do you list venues in Toronto?',
        ])->assertSessionHasErrors(['cf-turnstile-response' => 'Please complete the security check.']);

        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_contact_message_with_failed_turnstile_verification_is_rejected(): void
    {
        Turnstile::fake()->fail();

        $this->post(route('contact.store'), [
            'cf-turnstile-response' => Turnstile::dummy(),
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'phone' => '+44 7700 900123',
            'message' => 'Do you list venues in Toronto?',
        ])->assertSessionHasErrors('cf-turnstile-response');

        $this->assertDatabaseCount('contact_messages', 0);
    }
}
