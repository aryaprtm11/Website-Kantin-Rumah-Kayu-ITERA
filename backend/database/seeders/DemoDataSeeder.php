<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Super Admin
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@kantin.test',
            'password' => 'password',
            'role' => Role::SuperAdmin,
        ]);

        // Create Tenant Admin 1
        $tenantAdmin1 = User::create([
            'name' => 'Pemilik Warung Nusantara',
            'email' => 'tenant1@kantin.test',
            'password' => 'password',
            'role' => Role::TenantAdmin,
        ]);

        $tenant1 = Tenant::create([
            'user_id' => $tenantAdmin1->id,
            'name' => 'Warung Nusantara',
            'opens_at' => '08:00:00',
            'closes_at' => '21:00:00',
        ]);

        // Create menus for tenant 1
        $menus1 = [
            ['name' => 'Nasi Goreng', 'price' => 25000, 'category' => 'main', 'stock' => 20],
            ['name' => 'Mie Goreng', 'price' => 20000, 'category' => 'main', 'stock' => 15],
            ['name' => 'Ayam Bakar', 'price' => 30000, 'category' => 'main', 'stock' => 10],
            ['name' => 'Es Teh Manis', 'price' => 5000, 'category' => 'drink', 'stock' => 50],
            ['name' => 'Es Jeruk', 'price' => 7000, 'category' => 'drink', 'stock' => 30],
            ['name' => 'Kopi Hitam', 'price' => 8000, 'category' => 'drink', 'stock' => 25],
        ];

        foreach ($menus1 as $menuData) {
            Menu::create([
                'tenant_id' => $tenant1->id,
                ...$menuData,
            ]);
        }

        // Create Tenant Admin 2
        $tenantAdmin2 = User::create([
            'name' => 'Pemilik Kantin Sehat',
            'email' => 'tenant2@kantin.test',
            'password' => 'password',
            'role' => Role::TenantAdmin,
        ]);

        $tenant2 = Tenant::create([
            'user_id' => $tenantAdmin2->id,
            'name' => 'Kantin Sehat',
            'opens_at' => '07:00:00',
            'closes_at' => '20:00:00',
        ]);

        // Create menus for tenant 2
        $menus2 = [
            ['name' => 'Salad Sayur', 'price' => 20000, 'category' => 'main', 'stock' => 15],
            ['name' => 'Sandwich', 'price' => 18000, 'category' => 'main', 'stock' => 12],
            ['name' => 'Jus Alpukat', 'price' => 12000, 'category' => 'drink', 'stock' => 20],
            ['name' => 'Smoothie Bowl', 'price' => 25000, 'category' => 'main', 'stock' => 8],
        ];

        foreach ($menus2 as $menuData) {
            Menu::create([
                'tenant_id' => $tenant2->id,
                ...$menuData,
            ]);
        }

        // Create Customers
        $customers = [];
        for ($i = 1; $i <= 5; $i++) {
            $customers[] = User::create([
                'name' => "Customer {$i}",
                'email' => "customer{$i}@kantin.test",
                'password' => 'password',
                'role' => Role::Customer,
            ]);
        }

        // Create sample orders
        $tenant1Menus = $tenant1->menus;
        $tenant2Menus = $tenant2->menus;

        // Orders for tenant 1
        foreach ($customers as $index => $customer) {
            // Create order with status created (pending)
            $order1 = Order::create([
                'user_id' => $customer->id,
                'tenant_id' => $tenant1->id,
                'type' => 'pickup',
                'status' => OrderStatus::Created,
                'payment_status' => PaymentStatus::Pending,
                'total_price' => 30000,
                'paid_amount' => 0,
            ]);

            $order1->items()->create([
                'menu_id' => $tenant1Menus[0]->id,
                'quantity' => 1,
                'unit_price' => 25000,
                'subtotal' => 25000,
            ]);

            $order1->items()->create([
                'menu_id' => $tenant1Menus[3]->id,
                'quantity' => 1,
                'unit_price' => 5000,
                'subtotal' => 5000,
            ]);

            // Create completed order
            if ($index < 3) {
                $order2 = Order::create([
                    'user_id' => $customer->id,
                    'tenant_id' => $tenant1->id,
                    'type' => 'pickup',
                    'status' => OrderStatus::Completed,
                    'payment_status' => PaymentStatus::Paid,
                    'total_price' => 50000,
                    'paid_amount' => 50000,
                    'picked_up_at' => now()->subHours(2),
                    'completed_at' => now()->subHours(1),
                    'completed_by_user' => true,
                    'created_at' => now()->subHours(3),
                ]);

                $order2->items()->create([
                    'menu_id' => $tenant1Menus[2]->id,
                    'quantity' => 1,
                    'unit_price' => 30000,
                    'subtotal' => 30000,
                ]);

                $order2->items()->create([
                    'menu_id' => $tenant1Menus[1]->id,
                    'quantity' => 1,
                    'unit_price' => 20000,
                    'subtotal' => 20000,
                ]);
            }
        }

        // Orders for tenant 2
        foreach (array_slice($customers, 0, 3) as $customer) {
            $order = Order::create([
                'user_id' => $customer->id,
                'tenant_id' => $tenant2->id,
                'type' => 'pickup',
                'status' => OrderStatus::Preparing,
                'payment_status' => PaymentStatus::Paid,
                'total_price' => 32000,
                'paid_amount' => 32000,
            ]);

            $order->items()->create([
                'menu_id' => $tenant2Menus[0]->id,
                'quantity' => 1,
                'unit_price' => 20000,
                'subtotal' => 20000,
            ]);

            $order->items()->create([
                'menu_id' => $tenant2Menus[2]->id,
                'quantity' => 1,
                'unit_price' => 12000,
                'subtotal' => 12000,
            ]);
        }

        $this->command->info('Demo data seeded successfully!');
        $this->command->info('');
        $this->command->info('Login credentials:');
        $this->command->info('Super Admin: admin@kantin.test / password');
        $this->command->info('Tenant 1: tenant1@kantin.test / password');
        $this->command->info('Tenant 2: tenant2@kantin.test / password');
        $this->command->info('Customer: customer1@kantin.test / password');
    }
}
