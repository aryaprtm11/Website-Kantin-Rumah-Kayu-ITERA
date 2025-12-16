<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerStatsController extends Controller
{
    /**
     * Get customer dashboard statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        // Total orders
        $totalOrders = $user->orders()->count();

        // Active orders (created, preparing, ready_for_pickup)
        $activeOrders = $user->orders()
            ->whereIn('status', [
                OrderStatus::Created,
                OrderStatus::Preparing,
                OrderStatus::ReadyForPickup,
            ])
            ->count();

        // Completed orders
        $completedOrders = $user->orders()
            ->where('status', OrderStatus::Completed)
            ->count();

        // Total spent (paid orders only)
        $totalSpent = $user->orders()
            ->where('payment_status', 'paid')
            ->sum('paid_amount');

        // Orders by status
        $ordersByStatus = $user->orders()
            ->select('status', \DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->status->value => $item->count]);

        // Favorite tenant (most ordered from)
        $favoriteTenant = $user->orders()
            ->select('tenant_id', \DB::raw('count(*) as order_count'))
            ->groupBy('tenant_id')
            ->orderByDesc('order_count')
            ->with('tenant:id,name')
            ->first();

        return response()->json([
            'data' => [
                'total_orders' => $totalOrders,
                'active_orders' => $activeOrders,
                'completed_orders' => $completedOrders,
                'total_spent' => $totalSpent,
                'orders_by_status' => $ordersByStatus,
                'favorite_tenant' => $favoriteTenant ? [
                    'id' => $favoriteTenant->tenant_id,
                    'name' => $favoriteTenant->tenant->name ?? null,
                    'order_count' => $favoriteTenant->order_count,
                ] : null,
            ],
        ]);
    }
}
