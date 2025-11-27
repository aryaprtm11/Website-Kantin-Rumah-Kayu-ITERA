<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use OpenApi\Annotations as OA;

/**
 * @OA\Info(title="Kantin Rumah Kayu API", version="1.0")
 *
 * @OA\Server(url="/")
 *
 * @OA\SecurityScheme(
 *     securityScheme="BearerToken",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="Sanctum"
 * )
 *
 * @OA\Schema(
 *     schema="User",
 *
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="John Doe"),
 *     @OA\Property(property="email", type="string", example="john@example.com"),
 *     @OA\Property(property="role", type="string", example="customer")
 * )
 *
 * @OA\Schema(
 *     schema="Tenant",
 *
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Warung Nusantara"),
 *     @OA\Property(property="opens_at", type="string", example="08:00:00"),
 *     @OA\Property(property="closes_at", type="string", example="21:00:00")
 * )
 *
 * @OA\Schema(
 *     schema="Menu",
 *
 *     @OA\Property(property="id", type="integer"),
 *     @OA\Property(property="tenant_id", type="integer"),
 *     @OA\Property(property="name", type="string", example="Nasi Goreng"),
 *     @OA\Property(property="price", type="integer", example=25000),
 *     @OA\Property(property="category", type="string", example="main"),
 *     @OA\Property(property="photo_url", type="string", nullable=true),
 *     @OA\Property(property="stock", type="integer", example=10)
 * )
 *
 * @OA\Schema(
 *     schema="OrderItem",
 *
 *     @OA\Property(property="id", type="integer"),
 *     @OA\Property(property="menu_id", type="integer"),
 *     @OA\Property(property="quantity", type="integer", example=2),
 *     @OA\Property(property="unit_price", type="integer", example=12000),
 *     @OA\Property(property="subtotal", type="integer", example=24000),
 *     @OA\Property(property="menu", ref="#/components/schemas/Menu", nullable=true)
 * )
 *
 * @OA\Schema(
 *     schema="Order",
 *
 *     @OA\Property(property="id", type="integer"),
 *     @OA\Property(property="user_id", type="integer"),
 *     @OA\Property(property="tenant_id", type="integer"),
 *     @OA\Property(property="tenant", ref="#/components/schemas/Tenant"),
 *     @OA\Property(property="type", type="string", example="pickup"),
 *     @OA\Property(property="status", type="string", example="ready_for_pickup"),
 *     @OA\Property(property="payment_status", type="string", example="paid"),
 *     @OA\Property(property="total_price", type="integer", example=24000),
 *     @OA\Property(property="paid_amount", type="integer", example=24000),
 *     @OA\Property(property="picked_up_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(property="completed_by_user", type="boolean", example=false),
 *     @OA\Property(property="completed_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(property="items", type="array", @OA\Items(ref="#/components/schemas/OrderItem"))
 * )
 */
class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/v1/auth/register",
     *     tags={"Auth"},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation"},
     *
     *             @OA\Property(property="name", type="string"),
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password"),
     *             @OA\Property(property="password_confirmation", type="string", format="password")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Register success",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="user", ref="#/components/schemas/User"),
     *             @OA\Property(property="token", type="string")
     *         )
     *     )
     * )
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => Role::Customer,
        ]);

        $token = $user->createToken('auth_token', [$user->role->value])->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/login",
     *     tags={"Auth"},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"email","password"},
     *
     *             @OA\Property(property="email", type="string", format="email"),
     *             @OA\Property(property="password", type="string", format="password")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Login success",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="user", ref="#/components/schemas/User"),
     *             @OA\Property(property="token", type="string")
     *         )
     *     ),
     *
     *     @OA\Response(response=401, description="Invalid credentials")
     * )
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Kredensial tidak valid.',
            ], 401);
        }

        /** @var \App\Models\User $user */
        $user = User::where('email', $credentials['email'])->firstOrFail();

        $token = $user->createToken('auth_token', [$user->role->value])->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/logout",
     *     tags={"Auth"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\Response(response=200, description="Logout success")
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/auth/me",
     *     tags={"Auth"},
     *     security={{"BearerToken":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Current user",
     *
     *         @OA\JsonContent(ref="#/components/schemas/User")
     *     )
     * )
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
