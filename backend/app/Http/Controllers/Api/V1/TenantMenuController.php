<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Menus\StoreMenuRequest;
use App\Http\Requests\Menus\UpdateMenuRequest;
use App\Http\Requests\Menus\UpdateMenuStockRequest;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use OpenApi\Annotations as OA;

class TenantMenuController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/tenant/menus",
     *     tags={"Tenant Menus"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Tenant menus",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *
     *                 @OA\Items(ref="#/components/schemas/Menu")
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $tenant = $this->tenantFromRequest($request);

        $this->authorize('manage', $tenant);

        $menus = $tenant->menus()->latest()->paginate(20);

        return MenuResource::collection($menus)->response();
    }

    /**
     * @OA\Post(
     *     path="/api/v1/tenant/menus",
     *     tags={"Tenant Menus"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"name","price","stock"},
     *
     *             @OA\Property(property="tenant_id", type="integer", nullable=true),
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="price", type="integer", example=15000),
     *             @OA\Property(property="category", type="string", nullable=true),
     *             @OA\Property(property="photo_url", type="string", nullable=true),
     *             @OA\Property(property="stock", type="integer", example=10)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Menu created",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", ref="#/components/schemas/Menu")
     *         )
     *     )
     * )
     */
    public function store(StoreMenuRequest $request): JsonResponse
    {
        $tenant = $this->tenantFromRequest($request, $request->validated('tenant_id'));

        $this->authorize('create', [Menu::class, $tenant]);

        $data = $request->safe()->only(['name', 'price', 'category', 'photo_url', 'stock']);

        $menu = $tenant->menus()->create($data);

        return (new MenuResource($menu))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/tenant/menus/{menu}",
     *     tags={"Tenant Menus"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\Parameter(name="menu", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\RequestBody(
     *         required=false,
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="price", type="integer"),
     *             @OA\Property(property="category", type="string", nullable=true),
     *             @OA\Property(property="photo_url", type="string", nullable=true),
     *             @OA\Property(property="stock", type="integer")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Menu updated",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", ref="#/components/schemas/Menu")
     *         )
     *     )
     * )
     */
    public function update(UpdateMenuRequest $request, Menu $menu): JsonResponse
    {
        $menu->loadMissing('tenant');

        $this->authorize('update', $menu);

        $menu->update($request->validated());

        return (new MenuResource($menu))->response();
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/tenant/menus/{menu}",
     *     tags={"Tenant Menus"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\Parameter(name="menu", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\Response(response=200, description="Menu deleted")
     * )
     */
    public function destroy(Menu $menu): JsonResponse
    {
        $menu->loadMissing('tenant');

        $this->authorize('delete', $menu);

        $menu->delete();

        return response()->json([
            'message' => 'Menu dihapus.',
        ]);
    }

    /**
     * @OA\Patch(
     *     path="/api/v1/tenant/menus/{menu}/stock",
     *     tags={"Tenant Menus"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\Parameter(name="menu", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"stock"},
     *
     *             @OA\Property(property="stock", type="integer", example=5)
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Stock updated",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", ref="#/components/schemas/Menu")
     *         )
     *     )
     * )
     */
    public function updateStock(UpdateMenuStockRequest $request, Menu $menu): JsonResponse
    {
        $menu->loadMissing('tenant');

        $this->authorize('update', $menu);

        $menu->update([
            'stock' => $request->validated('stock'),
        ]);

        return (new MenuResource($menu))->response();
    }

    private function tenantFromRequest(Request $request, ?int $tenantId = null): Tenant
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
            $targetTenantId = $tenantId ?? $request->integer('tenant_id');

            if ($targetTenantId === 0) {
                throw ValidationException::withMessages([
                    'tenant_id' => 'Tenant wajib diisi untuk superadmin.',
                ]);
            }

            return Tenant::findOrFail($targetTenantId);
        }

        abort(403);
    }
}
