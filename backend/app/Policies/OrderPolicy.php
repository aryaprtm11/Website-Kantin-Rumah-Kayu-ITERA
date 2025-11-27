<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\Tenant;
use App\Models\User;

class OrderPolicy
{
    public function create(User $user, Tenant $tenant): bool
    {
        return $user->isSuperAdmin() || $user->isCustomer();
    }

    public function view(User $user, Order $order): bool
    {
        return $this->isOwner($user, $order) || $this->isTenantOwner($user, $order) || $user->isSuperAdmin();
    }

    public function updateStatus(User $user, Order $order): bool
    {
        return $this->isTenantOwner($user, $order) || $user->isSuperAdmin();
    }

    public function pay(User $user, Order $order): bool
    {
        return $this->isOwner($user, $order) || $user->isSuperAdmin();
    }

    public function pickup(User $user, Order $order): bool
    {
        return $this->isOwner($user, $order) || $user->isSuperAdmin();
    }

    public function complete(User $user, Order $order): bool
    {
        return $this->isOwner($user, $order) || $user->isSuperAdmin();
    }

    private function isOwner(User $user, Order $order): bool
    {
        return $order->user_id === $user->id;
    }

    private function isTenantOwner(User $user, Order $order): bool
    {
        return $user->isTenantAdmin() && $order->tenant?->user_id === $user->id;
    }
}
