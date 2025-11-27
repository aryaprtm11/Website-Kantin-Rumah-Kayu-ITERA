<?php

use App\Models\Menu;
use App\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\getJson;

uses(RefreshDatabase::class);

it('lists tenants and filters by open_now', function () {
    Tenant::factory()->create([
        'opens_at' => now()->subHours(2)->format('H:i:s'),
        'closes_at' => now()->addHours(2)->format('H:i:s'),
    ]);

    $response = getJson('/api/v1/tenants?open_now=1');

    $response->assertOk()
        ->assertJsonCount(1, 'data');
});

it('lists menus for a tenant with search and category filters', function () {
    $tenant = Tenant::factory()->create();
    Menu::factory()->for($tenant)->create([
        'name' => 'Ayam Bakar',
        'category' => 'main',
    ]);
    Menu::factory()->for($tenant)->create([
        'name' => 'Es Teh',
        'category' => 'drink',
    ]);

    $response = getJson("/api/v1/tenants/{$tenant->id}/menus?search=Ayam&category=main");

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Ayam Bakar');
});

it('shows menu detail', function () {
    $tenant = Tenant::factory()->create();
    $menu = Menu::factory()->for($tenant)->create([
        'name' => 'Nasi Goreng',
        'price' => 25000,
    ]);

    $response = getJson("/api/v1/menus/{$menu->id}");

    $response->assertOk()
        ->assertJsonPath('data.name', 'Nasi Goreng')
        ->assertJsonPath('data.price', 25000);
});
