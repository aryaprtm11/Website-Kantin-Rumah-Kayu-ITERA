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
        try {
            $totalTenants = Tenant::count();
            $totalUsers = User::count();
            $totalCustomers = User::where('role', Role::Customer->value)->count();
            $totalOrders = Order::count();
            $totalRevenue = Order::where('payment_status', 'paid')->sum('paid_amount') ?? 0;
            $totalMenus = Menu::count();

            // Orders by status
            $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
                ->toBase()
                ->groupBy('status')
                ->get()
                ->pluck('count', 'status');

            // Recent activity stats
            $todayOrders = Order::whereDate('created_at', today())->count();
            $todayRevenue = Order::whereDate('created_at', today())
                ->where('payment_status', 'paid')
                ->sum('paid_amount') ?? 0;

            // Pending orders
            $pendingOrders = Order::whereIn('status', [
                OrderStatus::Created->value,
                OrderStatus::Preparing->value,
            ])->count();

            return response()->json([
                'data' => [
                    'total_tenants' => $totalTenants,
                    'total_users' => $totalUsers,
                    'total_customers' => $totalCustomers,
                    'total_orders' => $totalOrders,
                    'total_revenue' => (float) $totalRevenue,
                    'total_menus' => $totalMenus,
                    'orders_by_status' => $ordersByStatus,
                    'today_orders' => $todayOrders,
                    'today_revenue' => (float) $todayRevenue,
                    'pending_orders' => $pendingOrders,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching stats',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all tenants with owner info
     */
    public function tenants(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('per_page', 15);

            $tenants = Tenant::with('user:id,name,email')
                ->withCount('menus', 'orders')
                ->latest()
                ->paginate($perPage);

            return response()->json($tenants);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching tenants',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all users
     */
    public function users(Request $request): JsonResponse
    {
        try {
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
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching users',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all orders with relations
     */
    public function orders(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('per_page', 15);
            $status = $request->input('status');

            $query = Order::with(['user:id,name,email', 'tenant:id,name', 'items.menu:id,name,price']);

            if ($status) {
                $query->where('status', $status);
            }

            $orders = $query->latest()->paginate($perPage);

            return response()->json($orders);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching orders',
                'error' => $e->getMessage(),
            ], 500);
        }
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
     * Create a new user
     */
    public function createUser(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:customer,tenant_admin,superadmin',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role,
        ]);

        return response()->json([
            'message' => 'User berhasil dibuat.',
            'data' => $user,
        ], 201);
    }

    /**
     * Update user
     */
    public function updateUser(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'sometimes|in:customer,tenant_admin,superadmin',
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($request->only(['name', 'email', 'role', 'is_active']));

        return response()->json([
            'message' => 'User berhasil diupdate.',
            'data' => $user,
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
     * Create a new tenant
     */
    public function createTenant(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id|unique:tenants,user_id',
            'name' => 'required|string|max:100',
            'location' => 'nullable|string|max:255',
            'opens_at' => 'required',
            'closes_at' => 'required',
            'is_active' => 'boolean',
        ]);

        $tenant = Tenant::create([
            'user_id' => $request->user_id,
            'name' => $request->name,
            'location' => $request->location,
            'opens_at' => $request->opens_at,
            'closes_at' => $request->closes_at,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json([
            'message' => 'Tenant berhasil dibuat.',
            'data' => $tenant->load('user:id,name,email'),
        ], 201);
    }

    /**
     * Update tenant
     */
    public function updateTenant(Request $request, Tenant $tenant): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'sometimes|nullable|string|max:255',
            'opens_at' => 'sometimes',
            'closes_at' => 'sometimes',
            'is_active' => 'sometimes|boolean',
        ]);

        $tenant->update($request->only(['name', 'location', 'opens_at', 'closes_at', 'is_active']));

        return response()->json([
            'message' => 'Tenant berhasil diupdate.',
            'data' => $tenant->fresh()->load('user:id,name,email'),
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
