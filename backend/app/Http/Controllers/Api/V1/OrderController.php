<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\PayOrderRequest;
use App\Http\Requests\Orders\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use OpenApi\Annotations as OA;

class OrderController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/orders",
     *     tags={"Orders"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="List user orders",
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
        $orders = $request->user()
            ->orders()
            ->with(['items.menu', 'tenant'])
            ->latest()
            ->paginate(15);

        return OrderResource::collection($orders)->response();
    }

    /**
     * @OA\Get(
     *     path="/api/v1/orders/{order}",
     *     tags={"Orders"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\Parameter(name="order", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Order detail",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", ref="#/components/schemas/Order")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function show(Order $order): JsonResponse
    {
        $order->loadMissing('tenant');

        $this->authorize('view', $order);

        $order->loadMissing(['items.menu', 'tenant']);

        return (new OrderResource($order))->response();
    }

    /**
     * @OA\Post(
     *     path="/api/v1/orders",
     *     tags={"Orders"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"tenant_id","items","type"},
     *
     *             @OA\Property(property="tenant_id", type="integer"),
     *             @OA\Property(property="type", type="string", example="pickup"),
     *             @OA\Property(
     *                 property="items",
     *                 type="array",
     *
     *                 @OA\Items(
     *                     required={"menu_id","qty"},
     *
     *                     @OA\Property(property="menu_id", type="integer"),
     *                     @OA\Property(property="qty", type="integer", example=2)
     *                 )
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Order created",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", ref="#/components/schemas/Order")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();
        $tenant = Tenant::findOrFail($data['tenant_id']);

        $this->authorize('create', [Order::class, $tenant]);

        $items = collect($data['items']);

        $order = DB::transaction(function () use ($items, $tenant, $data, $user): Order {
            $menuIds = $items->pluck('menu_id')->all();
            $menus = Menu::query()
                ->where('tenant_id', $tenant->id)
                ->whereIn('id', $menuIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($menus->count() !== $items->count()) {
                throw ValidationException::withMessages([
                    'items' => 'Menu tidak valid untuk tenant ini.',
                ]);
            }

            [$totalPrice, $orderItems] = $this->prepareItems($items, $menus);

            $order = Order::create([
                'user_id' => $user->id,
                'tenant_id' => $tenant->id,
                'type' => $data['type'] ?? 'pickup',
                'total_price' => $totalPrice,
                'status' => OrderStatus::Created,
                'payment_status' => PaymentStatus::Pending,
                'paid_amount' => 0,
            ]);

            $order->items()->createMany($orderItems);

            return $order->load(['items.menu', 'tenant']);
        });

        return (new OrderResource($order))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/orders/{order}/pay",
     *     tags={"Orders"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\Parameter(name="order", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\RequestBody(
     *         required=false,
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="paid_amount", type="integer", example=24000)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Marked paid",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", ref="#/components/schemas/Order")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Already paid or invalid")
     * )
     */
    public function pay(PayOrderRequest $request, Order $order): JsonResponse
    {
        $order->loadMissing('tenant');

        $this->authorize('pay', $order);

        if ($order->payment_status === PaymentStatus::Paid) {
            return response()->json([
                'message' => 'Order sudah dibayar.',
            ], 422);
        }

        $data = $request->validated();
        $paidAmount = $data['paid_amount'] ?? $order->total_price;

        $order->update([
            'payment_status' => PaymentStatus::Paid,
            'paid_amount' => $paidAmount,
        ]);

        return (new OrderResource($order->fresh(['items.menu', 'tenant'])))->response();
    }

    /**
     * @OA\Post(
     *     path="/api/v1/orders/{order}/pickup",
     *     tags={"Orders"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\Parameter(name="order", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Marked picked up",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", ref="#/components/schemas/Order")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Not ready for pickup")
     * )
     */
    public function pickup(Order $order): JsonResponse
    {
        $order->loadMissing('tenant');

        $this->authorize('pickup', $order);

        if ($order->status !== OrderStatus::ReadyForPickup) {
            return response()->json([
                'message' => 'Order belum siap diambil.',
            ], 422);
        }

        $order->update([
            'status' => OrderStatus::PickedUp,
            'picked_up_at' => now(),
        ]);

        return (new OrderResource($order->fresh(['items.menu', 'tenant'])))->response();
    }

    /**
     * @OA\Post(
     *     path="/api/v1/orders/{order}/complete",
     *     tags={"Orders"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\Parameter(name="order", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Marked completed",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", ref="#/components/schemas/Order")
     *         )
     *     ),
     *
     *     @OA\Response(response=422, description="Not yet picked up")
     * )
     */
    public function complete(Order $order): JsonResponse
    {
        $order->loadMissing('tenant');

        $this->authorize('complete', $order);

        if (! in_array($order->status, [OrderStatus::PickedUp, OrderStatus::Completed], true)) {
            return response()->json([
                'message' => 'Order belum diambil.',
            ], 422);
        }

        $order->update([
            'status' => OrderStatus::Completed,
            'completed_by_user' => true,
            'completed_at' => now(),
        ]);

        return (new OrderResource($order->fresh(['items.menu', 'tenant'])))->response();
    }

    /**
     * @param  Collection<int, array<string, int>>  $items
     * @param  Collection<int, \App\Models\Menu>  $menus
     * @return array{0: int, 1: array<int, array<string, int>>}
     */
    private function prepareItems(Collection $items, Collection $menus): array
    {
        $totalPrice = 0;
        $orderItems = [];

        foreach ($items as $item) {
            $menu = $menus->get($item['menu_id']);

            if ($menu === null) {
                throw ValidationException::withMessages([
                    'items' => 'Menu tidak valid untuk tenant ini.',
                ]);
            }

            $quantity = (int) $item['qty'];

            if ($menu->stock < $quantity) {
                throw ValidationException::withMessages([
                    'items' => "Stok {$menu->name} tidak cukup.",
                ]);
            }

            $unitPrice = $menu->price;
            $subtotal = $unitPrice * $quantity;
            $totalPrice += $subtotal;

            $orderItems[] = [
                'menu_id' => $menu->id,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'subtotal' => $subtotal,
            ];

            $menu->decrement('stock', $quantity);
        }

        return [$totalPrice, $orderItems];
    }
}
