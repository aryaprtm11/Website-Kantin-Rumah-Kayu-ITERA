<?php

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;

uses(RefreshDatabase::class);

it('registers a customer and returns token', function () {
    $response = postJson('/api/v1/auth/register', [
        'name' => 'New Customer',
        'email' => 'new@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertCreated()
        ->assertJsonPath('user.role', Role::Customer->value)
        ->assertJsonStructure(['token']);
});

it('logs in an existing user', function () {
    $user = User::factory()->create([
        'email' => 'login@example.com',
        'password' => bcrypt('secret123'),
    ]);

    $response = postJson('/api/v1/auth/login', [
        'email' => 'login@example.com',
        'password' => 'secret123',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['token'])
        ->assertJsonPath('user.id', $user->id);
});

it('returns current user with me endpoint', function () {
    $user = User::factory()->create();

    Sanctum::actingAs($user);

    $response = getJson('/api/v1/auth/me');

    $response->assertOk()
        ->assertJsonPath('id', $user->id);
});

it('revokes token on logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('auth_token', [$user->role->value]);

    $response = postJson('/api/v1/auth/logout', [], [
        'Authorization' => 'Bearer '.$token->plainTextToken,
    ]);

    $response->assertOk();
    expect($user->tokens()->count())->toBe(0);
});
