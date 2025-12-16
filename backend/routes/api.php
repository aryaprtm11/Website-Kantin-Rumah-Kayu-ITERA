<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\MenuController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\TenantController;
use App\Http\Controllers\Api\V1\TenantMenuController;
use App\Http\Controllers\Api\V1\TenantOrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::prefix('auth')->group(function (): void {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });

    Route::get('tenants', [TenantController::class, 'index']);
    Route::get('tenants/{tenant}/menus', [TenantController::class, 'menus']);
    Route::get('menus/{menu}', [MenuController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('orders', [OrderController::class, 'index']);
        Route::get('orders/{order}', [OrderController::class, 'show']);
        Route::post('orders', [OrderController::class, 'store']);
        Route::post('orders/{order}/pay', [OrderController::class, 'pay']);
        Route::post('orders/{order}/pickup', [OrderController::class, 'pickup']);
        Route::post('orders/{order}/complete', [OrderController::class, 'complete']);

        Route::prefix('tenant')->group(function (): void {
            Route::get('stats', [\App\Http\Controllers\Api\V1\TenantStatsController::class, 'stats']);
            Route::get('info', [\App\Http\Controllers\Api\V1\TenantStatsController::class, 'info']);

            Route::get('orders', [TenantOrderController::class, 'index']);
            Route::patch('orders/{order}/status', [TenantOrderController::class, 'updateStatus']);

            Route::get('menus', [TenantMenuController::class, 'index']);
            Route::post('menus', [TenantMenuController::class, 'store']);
            Route::patch('menus/{menu}', [TenantMenuController::class, 'update']);
            Route::delete('menus/{menu}', [TenantMenuController::class, 'destroy']);
            Route::patch('menus/{menu}/stock', [TenantMenuController::class, 'updateStock']);
        });

        Route::prefix('customer')->group(function (): void {
            Route::get('stats', [\App\Http\Controllers\Api\V1\CustomerStatsController::class, 'stats']);
        });

        Route::prefix('admin')->group(function (): void {
            Route::get('stats', [\App\Http\Controllers\Api\V1\AdminController::class, 'stats']);
            Route::get('tenants', [\App\Http\Controllers\Api\V1\AdminController::class, 'tenants']);
            Route::post('tenants', [\App\Http\Controllers\Api\V1\AdminController::class, 'createTenant']);
            Route::get('users', [\App\Http\Controllers\Api\V1\AdminController::class, 'users']);
            Route::post('users', [\App\Http\Controllers\Api\V1\AdminController::class, 'createUser']);
            Route::get('orders', [\App\Http\Controllers\Api\V1\AdminController::class, 'orders']);
            Route::get('activities', [\App\Http\Controllers\Api\V1\AdminController::class, 'recentActivities']);
            Route::patch('users/{user}/role', [\App\Http\Controllers\Api\V1\AdminController::class, 'updateUserRole']);
            Route::delete('users/{user}', [\App\Http\Controllers\Api\V1\AdminController::class, 'deleteUser']);
            Route::put('tenants/{tenant}', [\App\Http\Controllers\Api\V1\AdminController::class, 'updateTenant']);
            Route::delete('tenants/{tenant}', [\App\Http\Controllers\Api\V1\AdminController::class, 'deleteTenant']);
        });
    });
});
