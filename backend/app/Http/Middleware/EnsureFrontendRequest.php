<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFrontendRequest
{
    public function handle(Request $request, Closure $next): Response
    {
        $secretKey = env('FRONTEND_SECRET_KEY');

        if ($request->header('X-Kantin-Key') !== $secretKey) {
            return response()->json([
                'message' => 'Akses ditolak. Request harus berasal dari Frontend resmi.'
            ], 403);
        }

        return $next($request);
    }
}