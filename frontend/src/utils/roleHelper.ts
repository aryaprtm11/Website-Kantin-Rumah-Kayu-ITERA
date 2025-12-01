/**
 * Helper utilities untuk handle Laravel Enum Role
 */

import type { User, RoleEnum } from '../types';

/**
 * Extract role value dari Laravel Enum atau string
 * Laravel mengembalikan role sebagai: { name: "Customer", value: "customer" }
 * Fungsi ini normalize ke string "customer"
 */
export function getRoleValue(role: RoleEnum | string | undefined): string {
  if (!role) return '';
  
  // Jika sudah string, return langsung
  if (typeof role === 'string') {
    return role;
  }
  
  // Jika Enum object, ambil value
  if (typeof role === 'object' && 'value' in role) {
    return role.value;
  }
  
  return '';
}

/**
 * Normalize user object untuk ensure role dalam format string
 */
export function normalizeUser(user: User): User {
  return {
    ...user,
    role: getRoleValue(user.role),
  };
}

/**
 * Check user role
 */
export function hasRole(user: User | null, role: string): boolean {
  if (!user) return false;
  return getRoleValue(user.role) === role;
}

export function isSuperAdmin(user: User | null): boolean {
  return hasRole(user, 'superadmin');
}

export function isTenantAdmin(user: User | null): boolean {
  return hasRole(user, 'tenant_admin');
}

export function isCustomer(user: User | null): boolean {
  return hasRole(user, 'customer');
}

