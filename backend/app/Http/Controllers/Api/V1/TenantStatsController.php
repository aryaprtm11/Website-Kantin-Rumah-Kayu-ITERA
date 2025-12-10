<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TenantStatsController extends Controller
{
    /**
     * Get tenant dashboard statistics
     */
    public function stats(Request $request): JsonResponse
    {
        $tenant = $this->tenantFromRequest($request);

        $this->authorize('manage', $tenant);

        // Today's stats
        $todayOrders = $tenant->orders()
            ->whereDate('created_at', today())
            ->count();

        $todayRevenue = $tenant->orders()
            ->whereDate('created_at', today())
            ->where('payment_status', 'paid')
            ->sum('paid_amount');

        // Total stats
        $totalMenus = $tenant->menus()->count();
        $totalOrders = $tenant->orders()->count();
        $totalRevenue = $tenant->orders()
            ->where('payment_status', 'paid')
            ->sum('paid_amount');

        // Pending orders (created + preparing)
        $pendingOrders = $tenant->orders()
            ->whereIn('status', [OrderStatus::Created, OrderStatus::Preparing])
            ->count();

        // Orders by status
        $ordersByStatus = $tenant->orders()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn($item) => [$item->status->value => $item->count]);

        // Low stock menus (stock < 5)
        $lowStockMenus = $tenant->menus()
            ->where('stock', '<', 5)
            ->count();

        return response()->json([
            'data' => [
                'today_orders' => $todayOrders,
                'today_revenue' => $todayRevenue,
                'total_menus' => $totalMenus,
                'pending_orders' => $pendingOrders,
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'orders_by_status' => $ordersByStatus,
                'low_stock_menus' => $lowStockMenus,
            ],
        ]);
    }

    /**
     * Get tenant info
     */
    public function info(Request $request): JsonResponse
    {
        $tenant = $this->tenantFromRequest($request);

        $this->authorize('manage', $tenant);

        $tenant->load('user:id,name,email');

        return response()->json([
            'data' => $tenant,
        ]);
    }

    private function tenantFromRequest(Request $request): Tenant
    {
        $user = $request->user();

        if ($user->isTenantAdmin()) {
            $tenant = $user->tenant;

            if ($tenant === null) {
                throw ValidationException::withMessages([
                    'tenant' => 'Akun belum memiliki tenant.',
                ]);
            }

            return $tenant;
        }

        if ($user->isSuperAdmin()) {
            $tenantId = $request->integer('tenant_id');

            if ($tenantId === 0) {
                throw ValidationException::withMessages([
                    'tenant_id' => 'Tenant wajib diisi untuk superadmin.',
                ]);
            }

            return Tenant::findOrFail($tenantId);
        }

        abort(403);
    }
}
