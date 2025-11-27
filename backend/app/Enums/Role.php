<?php

namespace App\Enums;

enum Role: string
{
    case Customer = 'customer';
    case TenantAdmin = 'tenant_admin';
    case SuperAdmin = 'superadmin';
}
