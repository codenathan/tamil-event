<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Vendor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(CategorySeeder::class);
        $this->call(CountrySeeder::class);
        $this->call(CitySeeder::class);
        $this->call(RolesAndPermissionsSeeder::class);

        Vendor::factory(50)->create();
        // User::factory(10)->create();

        $user = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'sakees@codenathan.com',
            'password' => Hash::make('THE59dhYu2ye'),
        ]);

        $user->assignRole('admin');

        User::factory()->create([
            'name' => 'Local User',
            'email' => 'test@codenathan.com',
            'password' => Hash::make('THE59dhYu2ye'),
        ]);
    }
}
