<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tenant = Tenant::factory();

        return [
            'user_id' => User::factory(),
            'tenant_id' => $tenant,
            'total_price' => fake()->numberBetween(20000, 150000),
            'type' => 'pickup',
            'status' => OrderStatus::Created,
            'payment_status' => PaymentStatus::Unpaid,
            'paid_amount' => 0,
            'picked_up_at' => null,
            'completed_by_user' => false,
            'completed_at' => null,
        ];
    }

    public function paid(): static
    {
        return $this->state(fn () => [
            'payment_status' => PaymentStatus::Paid,
            'paid_amount' => fn (array $attributes) => $attributes['total_price'] ?? 0,
        ]);
    }
}
