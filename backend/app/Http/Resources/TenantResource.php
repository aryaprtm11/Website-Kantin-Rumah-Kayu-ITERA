<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Tenant
 */
class TenantResource extends JsonResource
{
    /**
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $now = Carbon::now();
        $opensAt = $this->opens_at ? Carbon::createFromTimeString($this->opens_at->format('H:i:s')) : null;
        $closesAt = $this->closes_at ? Carbon::createFromTimeString($this->closes_at->format('H:i:s')) : null;
        $isOpen = $opensAt && $closesAt ? $now->between($opensAt, $closesAt) : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'opens_at' => $this->opens_at?->format('H:i:s'),
            'closes_at' => $this->closes_at?->format('H:i:s'),
            'is_open' => $isOpen,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
