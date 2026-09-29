<?php

declare(strict_types=1);

namespace Tests\Feature\Admin;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Lab404\Impersonate\Events\LeaveImpersonation;
use Lab404\Impersonate\Events\TakeImpersonation;
use Tests\TestCase;

class ImpersonationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $this->admin = User::factory()->create(['name' => 'Admin Person']);
        $this->admin->assignRole('admin');
    }

    private function createUserWithRole(string $role, array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $user->assignRole($role);

        return $user;
    }

    public function test_admin_can_impersonate_a_vendor(): void
    {
        $vendor = $this->createUserWithRole('vendor');

        $this->actingAs($this->admin)
            ->post(route('admin.users.impersonate', $vendor))
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('impersonated_by', $this->admin->id);

        $this->assertAuthenticatedAs($vendor);
    }

    public function test_admin_can_impersonate_a_regular_user(): void
    {
        $user = $this->createUserWithRole('user');

        $this->actingAs($this->admin)
            ->post(route('admin.users.impersonate', $user))
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_admin_cannot_impersonate_another_admin(): void
    {
        $otherAdmin = $this->createUserWithRole('admin');

        $this->actingAs($this->admin)
            ->post(route('admin.users.impersonate', $otherAdmin))
            ->assertForbidden();

        $this->assertAuthenticatedAs($this->admin);
    }

    public function test_admin_cannot_impersonate_themselves(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.users.impersonate', $this->admin))
            ->assertForbidden();
    }

    public function test_admin_cannot_impersonate_a_disabled_user(): void
    {
        $disabled = $this->createUserWithRole('vendor', ['disabled_at' => now()]);

        $this->actingAs($this->admin)
            ->post(route('admin.users.impersonate', $disabled))
            ->assertForbidden();

        $this->assertAuthenticatedAs($this->admin);
    }

    public function test_non_admin_cannot_impersonate(): void
    {
        $vendor = $this->createUserWithRole('vendor');
        $target = $this->createUserWithRole('user');

        $this->actingAs($vendor)
            ->post(route('admin.users.impersonate', $target))
            ->assertForbidden();
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $target = $this->createUserWithRole('user');

        $this->post(route('admin.users.impersonate', $target))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_stop_impersonating(): void
    {
        $vendor = $this->createUserWithRole('vendor');

        $this->actingAs($this->admin)->post(route('admin.users.impersonate', $vendor));

        $this->post(route('impersonate.stop'))
            ->assertRedirect(route('admin.users'))
            ->assertSessionMissing('impersonated_by');

        $this->assertAuthenticatedAs($this->admin);
    }

    public function test_stop_without_active_impersonation_is_forbidden(): void
    {
        $vendor = $this->createUserWithRole('vendor');

        $this->actingAs($vendor)
            ->post(route('impersonate.stop'))
            ->assertForbidden();
    }

    public function test_impersonation_state_is_shared_with_inertia(): void
    {
        $vendor = $this->createUserWithRole('vendor');

        $this->actingAs($this->admin)
            ->get(route('admin.users'))
            ->assertInertia(fn (Assert $page) => $page->where('impersonating', null));

        $this->post(route('admin.users.impersonate', $vendor));

        $this->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.id', $vendor->id)
                ->where('impersonating.impersonator_name', 'Admin Person'));
    }

    public function test_password_cannot_be_changed_while_impersonating(): void
    {
        $vendor = $this->createUserWithRole('vendor', ['password' => 'original-password']);

        $this->actingAs($this->admin)->post(route('admin.users.impersonate', $vendor));

        $this->from(route('security.edit'))
            ->put(route('user-password.update'), [
                'current_password' => 'original-password',
                'password' => 'new-password-123',
                'password_confirmation' => 'new-password-123',
            ])
            ->assertRedirect(route('security.edit'));

        $this->assertTrue(Hash::check('original-password', $vendor->fresh()->password));
    }

    public function test_account_cannot_be_deleted_while_impersonating(): void
    {
        $vendor = $this->createUserWithRole('vendor', ['password' => 'original-password']);

        $this->actingAs($this->admin)->post(route('admin.users.impersonate', $vendor));

        $this->delete(route('profile.destroy'), ['password' => 'original-password']);

        $this->assertModelExists($vendor);
    }

    public function test_admin_password_confirmation_does_not_carry_over(): void
    {
        $vendor = $this->createUserWithRole('vendor');

        $this->actingAs($this->admin)
            ->withSession(['auth.password_confirmed_at' => time()])
            ->post(route('admin.users.impersonate', $vendor))
            ->assertSessionMissing('auth.password_confirmed_at');
    }

    public function test_take_and_leave_events_are_dispatched(): void
    {
        Event::fake([TakeImpersonation::class, LeaveImpersonation::class]);

        $vendor = $this->createUserWithRole('vendor');

        $this->actingAs($this->admin)->post(route('admin.users.impersonate', $vendor));
        $this->post(route('impersonate.stop'));

        Event::assertDispatched(TakeImpersonation::class, fn (TakeImpersonation $event) => $event->impersonator->is($this->admin)
            && $event->impersonated->is($vendor));
        Event::assertDispatched(LeaveImpersonation::class);
    }
}
