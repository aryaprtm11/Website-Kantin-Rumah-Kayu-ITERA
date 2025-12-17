<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Order
 */
class OrderResource extends JsonResource
{
    /**
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'tenant_id' => $this->tenant_id,
            'tenant' => new TenantResource($this->whenLoaded('tenant')),
            'type' => $this->type,
            'status' => $this->status?->value,
            'payment_status' => $this->payment_status?->value,
            'total_price' => $this->total_price,
            'paid_amount' => $this->paid_amount,
            'picked_up_at' => $this->picked_up_at,
            'completed_by_user' => $this->completed_by_user,
            'completed_at' => $this->completed_at,
            'created_at' => $this->created_at,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
        ];
    }
}
