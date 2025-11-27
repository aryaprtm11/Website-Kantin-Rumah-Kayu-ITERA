<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use OpenApi\Annotations as OA;

class MenuController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/menus/{menu}",
     *     tags={"Menus"},
     *
     *     @OA\Parameter(name="menu", in="path", required=true, @OA\Schema(type="integer")),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Menu detail",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="data", ref="#/components/schemas/Menu")
     *         )
     *     ),
     *
     *     @OA\Response(response=404, description="Not found")
     * )
     */
    public function show(Menu $menu): MenuResource
    {
        return new MenuResource($menu);
    }
}
