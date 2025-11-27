<?php

namespace Database\Factories;

use App\Models\Menu;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Menu>
 */
class MenuFactory extends Factory
{
    protected $model = Menu::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'name' => fake()->words(2, true),
            'price' => fake()->numberBetween(5000, 100000),
            'category' => fake()->randomElement(['main', 'drink', 'snack']),
            'photo_url' => fake()->imageUrl(),
            'stock' => fake()->numberBetween(0, 100),
        ];
    }
}
