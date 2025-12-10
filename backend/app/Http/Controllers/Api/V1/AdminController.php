<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats(): JsonResponse
    {
        $totalTenants = Tenant::count();
        $totalUsers = User::count();
        $totalCustomers = User::where('role', Role::Customer)->count();
        $totalOrders = Order::count();
        $totalRevenue = Order::where('payment_status', 'paid')->sum('paid_amount');
        $totalMenus = Menu::count();

        // Orders by status
        $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        // Recent activity stats
        $todayOrders = Order::whereDate('created_at', today())->count();
        $todayRevenue = Order::whereDate('created_at', today())
            ->where('payment_status', 'paid')
            ->sum('paid_amount');

        // Pending orders
        $pendingOrders = Order::whereIn('status', [
            OrderStatus::Created,
            OrderStatus::Preparing,
        ])->count();

        return response()->json([
            'data' => [
                'total_tenants' => $totalTenants,
                'total_users' => $totalUsers,
                'total_customers' => $totalCustomers,
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'total_menus' => $totalMenus,
                'orders_by_status' => $ordersByStatus,
                'today_orders' => $todayOrders,
                'today_revenue' => $todayRevenue,
                'pending_orders' => $pendingOrders,
            ],
        ]);
    }

    /**
     * Get all tenants with owner info
     */
    public function tenants(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);

        $tenants = Tenant::with('user:id,name,email')
            ->withCount('menus', 'orders')
            ->latest()
            ->paginate($perPage);

        return response()->json($tenants);
    }

    /**
     * Get all users
     */
    public function users(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $role = $request->input('role');

        $query = User::query();

        if ($role) {
            $query->where('role', $role);
        }

        $users = $query->withCount('orders')
            ->latest()
            ->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Get all orders with relations
     */
    public function orders(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        $status = $request->input('status');

        $query = Order::with(['user:id,name,email', 'tenant:id,name', 'items.menu:id,name,price']);

        if ($status) {
            $query->where('status', $status);
        }

        $orders = $query->latest()->paginate($perPage);

        return response()->json($orders);
    }

    /**
     * Get recent activities
     */
    public function recentActivities(): JsonResponse
    {
        $recentOrders = Order::with(['user:id,name', 'tenant:id,name'])
            ->latest()
            ->limit(10)
            ->get();

        $recentUsers = User::latest()
            ->limit(5)
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        $recentTenants = Tenant::with('user:id,name')
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'recent_orders' => $recentOrders,
                'recent_users' => $recentUsers,
                'recent_tenants' => $recentTenants,
            ],
        ]);
    }

    /**
     * Update user role
     */
    public function updateUserRole(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'role' => 'required|in:customer,tenant_admin,superadmin',
        ]);

        $user->update([
            'role' => $request->role,
        ]);

        return response()->json([
            'message' => 'Role berhasil diupdate.',
            'data' => $user,
        ]);
    }

    /**
     * Delete user
     */
    public function deleteUser(User $user): JsonResponse
    {
        // Prevent deleting self
        if ($user->id === auth()->id()) {
            return response()->json([
                'message' => 'Tidak dapat menghapus akun sendiri.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus.',
        ]);
    }

    /**
     * Delete tenant
     */
    public function deleteTenant(Tenant $tenant): JsonResponse
    {
        $tenant->delete();

        return response()->json([
            'message' => 'Tenant berhasil dihapus.',
        ]);
    }
}
