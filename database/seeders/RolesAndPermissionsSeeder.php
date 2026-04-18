<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $guard = config('auth.defaults.guard');

        Role::firstOrCreate(['name' => 'admin', 'guard_name' => $guard]);
        Role::firstOrCreate(['name' => 'vendor', 'guard_name' => $guard]);
        Role::firstOrCreate(['name' => 'user', 'guard_name' => $guard]);
    }
}
