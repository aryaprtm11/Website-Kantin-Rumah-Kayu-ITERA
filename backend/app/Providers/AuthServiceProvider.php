<?php

namespace App\Providers;

use App\Models\Menu;
use App\Models\Order;
use App\Models\Tenant;
use App\Policies\MenuPolicy;
use App\Policies\OrderPolicy;
use App\Policies\TenantPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Menu::class => MenuPolicy::class,
        Order::class => OrderPolicy::class,
        Tenant::class => TenantPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
