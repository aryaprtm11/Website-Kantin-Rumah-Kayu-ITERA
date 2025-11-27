<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $superAdmin = User::factory()->superAdmin()->create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'password' => 'password',
        ]);

        $tenantAdmin = User::factory()->tenantAdmin()->create([
            'name' => 'Tenant Admin',
            'email' => 'tenant@example.com',
            'password' => 'password',
        ]);

        $customer = User::factory()->create([
            'name' => 'Customer User',
            'email' => 'customer@example.com',
            'password' => 'password',
            'role' => Role::Customer,
        ]);

        $tenant = Tenant::factory()->for($tenantAdmin)->create([
            'name' => 'Warung Nusantara',
            'opens_at' => '08:00:00',
            'closes_at' => '21:00:00',
        ]);

        $menu = Menu::factory()->for($tenant)->create([
            'name' => 'Nasi Goreng',
            'price' => 25000,
            'stock' => 20,
            'category' => 'main',
        ]);

        $quantity = 2;
        $unitPrice = $menu->price;
        $subtotal = $unitPrice * $quantity;

        $order = Order::create([
            'user_id' => $customer->id,
            'tenant_id' => $tenant->id,
            'total_price' => $subtotal,
            'type' => 'pickup',
            'status' => OrderStatus::ReadyForPickup,
            'payment_status' => PaymentStatus::Paid,
            'paid_amount' => $subtotal,
            'completed_by_user' => false,
        ]);

        $order->items()->create([
            'menu_id' => $menu->id,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $subtotal,
        ]);
    }
}
