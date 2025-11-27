<?php

namespace App\Policies;

use App\Models\Menu;
use App\Models\Tenant;
use App\Models\User;

class MenuPolicy
{
    public function create(User $user, Tenant $tenant): bool
    {
        return $this->canManageTenant($user, $tenant);
    }

    public function update(User $user, Menu $menu): bool
    {
        return $this->canManageTenant($user, $menu->tenant);
    }

    public function delete(User $user, Menu $menu): bool
    {
        return $this->canManageTenant($user, $menu->tenant);
    }

    private function canManageTenant(User $user, Tenant $tenant): bool
    {
        return $user->isSuperAdmin() || ($user->isTenantAdmin() && $tenant->user_id === $user->id);
    }
}
