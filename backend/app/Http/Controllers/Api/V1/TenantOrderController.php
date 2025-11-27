<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use OpenApi\Annotations as OA;

class TenantOrderController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/tenant/orders",
     *     tags={"Tenant Orders"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         required=false,
     *
     *         @OA\Schema(type="string", enum={"created","preparing","ready_for_pickup","picked_up","completed","cancelled"})
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Tenant order list",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *
     *                 @OA\Items(ref="#/components/schemas/Order")
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $tenant = $this->tenantFromRequest($request);

        $this->authorize('manage', $tenant);

        $query = $tenant->orders()->with(['items.menu', 'tenant'])->latest();

        if ($status = $request->string('status')->toString()) {
            $statusEnum = OrderStatus::tryFrom($status);

            if ($statusEnum === null) {
                throw ValidationException::withMessages([
                    'status' => 'Status tidak valid.',
                ]);
            }

            $query->where('status', $statusEnum->value);
        }

        $orders = $query->paginate(20);

        return OrderResource::collection($orders)->response();
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/tenant/orders/{order}/status",
     *     tags={"Tenant Orders"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\Parameter(name="order", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"status"},
     *
     *             @OA\Property(property="status", type="string", enum={"preparing","ready_for_pickup"})
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Order status updated",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", ref="#/components/schemas/Order")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Invalid transition")
     * )
     */
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $order->loadMissing('tenant');

        $this->authorize('updateStatus', $order);

        $newStatus = OrderStatus::from($request->validated('status'));

        if ($newStatus === OrderStatus::Preparing && $order->status !== OrderStatus::Created) {
            return response()->json([
                'message' => 'Order hanya bisa diubah ke preparing dari status created.',
            ], 422);
        }

        if ($newStatus === OrderStatus::ReadyForPickup && $order->status !== OrderStatus::Preparing) {
            return response()->json([
                'message' => 'Order harus berstatus preparing sebelum siap diambil.',
            ], 422);
        }

        $order->update([
            'status' => $newStatus,
        ]);

        return (new OrderResource($order->fresh(['items.menu', 'tenant'])))->response();
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
