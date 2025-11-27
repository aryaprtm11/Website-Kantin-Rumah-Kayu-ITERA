<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

use function Pest\Laravel\patchJson;
use function Pest\Laravel\postJson;

uses(RefreshDatabase::class);

it('creates order and calculates totals while reducing stock', function () {
    $tenantAdmin = User::factory()->tenantAdmin()->create();
    $tenant = Tenant::factory()->for($tenantAdmin)->create();
    $menu = Menu::factory()->for($tenant)->create([
        'price' => 10000,
        'stock' => 10,
    ]);
    $customer = User::factory()->create();

    Sanctum::actingAs($customer);

    $response = postJson('/api/v1/orders', [
        'tenant_id' => $tenant->id,
        'type' => 'pickup',
        'items' => [
            [
                'menu_id' => $menu->id,
                'qty' => 2,
            ],
        ],
    ]);

    $response->assertCreated()
        ->assertJsonPath('data.total_price', 20000)
        ->assertJsonPath('data.items.0.quantity', 2);

    expect($menu->fresh()->stock)->toBe(8);
});

it('prevents tenant admin from skipping order status steps', function () {
    $tenantAdmin = User::factory()->tenantAdmin()->create();
    $tenant = Tenant::factory()->for($tenantAdmin)->create();
    $customer = User::factory()->create();
    $order = Order::factory()->for($customer)->for($tenant)->create([
        'status' => OrderStatus::Created,
    ]);

    Sanctum::actingAs($tenantAdmin);

    $response = patchJson("/api/v1/tenant/orders/{$order->id}/status", [
        'status' => OrderStatus::ReadyForPickup->value,
    ]);

    $response->assertStatus(422);
    expect($order->refresh()->status)->toBe(OrderStatus::Created);
});

it('allows customer to pay, pickup, and complete order after tenant preparation', function () {
    $tenantAdmin = User::factory()->tenantAdmin()->create();
    $tenant = Tenant::factory()->for($tenantAdmin)->create();
    $menu = Menu::factory()->for($tenant)->create([
        'price' => 12000,
        'stock' => 5,
    ]);
    $customer = User::factory()->create();

    Sanctum::actingAs($customer);

    $createResponse = postJson('/api/v1/orders', [
        'tenant_id' => $tenant->id,
        'type' => 'pickup',
        'items' => [
            [
                'menu_id' => $menu->id,
                'qty' => 1,
            ],
        ],
    ])->assertCreated();

    $orderId = $createResponse->json('data.id');

    $payResponse = postJson("/api/v1/orders/{$orderId}/pay");

    $payResponse->assertOk()
        ->assertJsonPath('data.payment_status', PaymentStatus::Paid->value)
        ->assertJsonPath('data.paid_amount', 12000);

    Sanctum::actingAs($tenantAdmin);

    patchJson("/api/v1/tenant/orders/{$orderId}/status", [
        'status' => OrderStatus::Preparing->value,
    ])->assertOk();

    patchJson("/api/v1/tenant/orders/{$orderId}/status", [
        'status' => OrderStatus::ReadyForPickup->value,
    ])->assertOk();

    Sanctum::actingAs($customer);

    $pickupResponse = postJson("/api/v1/orders/{$orderId}/pickup");

    $pickupResponse->assertOk()
        ->assertJsonPath('data.status', OrderStatus::PickedUp->value);

    $completeResponse = postJson("/api/v1/orders/{$orderId}/complete");

    $completeResponse->assertOk()
        ->assertJsonPath('data.status', OrderStatus::Completed->value)
        ->assertJsonPath('data.completed_by_user', true);
});
