<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MenuResource;
use App\Http\Resources\TenantResource;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class TenantController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/tenants",
     *     tags={"Tenants"},
     *
     *     @OA\Parameter(
     *         name="open_now",
     *         in="query",
     *         required=false,
     *
     *         @OA\Schema(type="boolean")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Tenant list",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(
     *                 property="data",
     *                 type="array",
     *
     *                 @OA\Items(ref="#/components/schemas/Tenant")
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tenant::query();

        if ($request->boolean('open_now')) {
            $now = now()->format('H:i:s');

            $query->whereTime('opens_at', '<=', $now)
                ->whereTime('closes_at', '>=', $now);
        }

        $tenants = $query->paginate(15);

        return TenantResource::collection($tenants)->response();
    }

    /**
     * @OA\Get(
     *     path="/api/v1/tenants/{tenant}/menus",
     *     tags={"Tenants"},
     *
     *     @OA\Parameter(name="tenant", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="search", in="query", required=false, @OA\Schema(type="string")),
     *     @OA\Parameter(name="category", in="query", required=false, @OA\Schema(type="string")),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Menus by tenant",
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
    public function menus(Request $request, Tenant $tenant): JsonResponse
    {
        $query = $tenant->menus()->latest();

        if ($search = $request->string('search')->toString()) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%'.strtolower($search).'%']);
        }

        if ($category = $request->string('category')->toString()) {
            $query->where('category', $category);
        }

        $menus = $query->paginate(20);

        return MenuResource::collection($menus)->response();
    }
}
