<?php

namespace Database\Factories;

use App\Models\Menu;
use App\Models\Order;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tenant = Tenant::factory();
        $quantity = fake()->numberBetween(1, 5);
        $unitPrice = fake()->numberBetween(5000, 50000);

        return [
            'order_id' => Order::factory()->state([
                'tenant_id' => $tenant,
            ]),
            'menu_id' => Menu::factory()->for($tenant),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $quantity * $unitPrice,
        ];
    }
}
