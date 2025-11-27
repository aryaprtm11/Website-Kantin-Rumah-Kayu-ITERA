<?php

use App\Enums\OrderStatus;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

use function Pest\Laravel\deleteJson;
use function Pest\Laravel\patchJson;
use function Pest\Laravel\postJson;

uses(RefreshDatabase::class);

it('allows tenant admin to manage menus', function () {
    $tenantAdmin = User::factory()->tenantAdmin()->create();
    $tenant = Tenant::factory()->for($tenantAdmin)->create();

    Sanctum::actingAs($tenantAdmin);

    $createResponse = postJson('/api/v1/tenant/menus', [
        'name' => 'Bakso',
        'price' => 15000,
        'stock' => 5,
    ]);

    $createResponse->assertCreated()
        ->assertJsonPath('data.name', 'Bakso');

    $menuId = $createResponse->json('data.id');

    $updateResponse = patchJson("/api/v1/tenant/menus/{$menuId}", [
        'price' => 20000,
    ]);

    $updateResponse->assertOk()
        ->assertJsonPath('data.price', 20000);

    $stockResponse = patchJson("/api/v1/tenant/menus/{$menuId}/stock", [
        'stock' => 10,
    ]);

    $stockResponse->assertOk()
        ->assertJsonPath('data.stock', 10);

    $deleteResponse = deleteJson("/api/v1/tenant/menus/{$menuId}");

    $deleteResponse->assertOk();
    expect(Menu::query()->whereKey($menuId)->exists())->toBeFalse();
});

it('allows tenant admin to update order status in sequence', function () {
    $tenantAdmin = User::factory()->tenantAdmin()->create();
    $tenant = Tenant::factory()->for($tenantAdmin)->create();
    $customer = User::factory()->create();
    $order = Order::factory()->for($customer)->for($tenant)->create([
        'status' => OrderStatus::Created,
    ]);

    Sanctum::actingAs($tenantAdmin);

    $prepResponse = patchJson("/api/v1/tenant/orders/{$order->id}/status", [
        'status' => OrderStatus::Preparing->value,
    ]);

    $prepResponse->assertOk()
        ->assertJsonPath('data.status', OrderStatus::Preparing->value);

    $readyResponse = patchJson("/api/v1/tenant/orders/{$order->id}/status", [
        'status' => OrderStatus::ReadyForPickup->value,
    ]);

    $readyResponse->assertOk()
        ->assertJsonPath('data.status', OrderStatus::ReadyForPickup->value);
});
