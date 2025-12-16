/**
 * Application route constants
 * Centralized route paths to avoid typos and improve maintainability
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  TENANT_DETAIL: (id: number | string) => `/tenants/${id}`,

  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    TENANTS: '/admin/tenants',
    USERS: '/admin/users',
    PROFILE: '/admin/profile',
  },

  // Tenant routes
  TENANT: {
    DASHBOARD: '/tenant/dashboard',
    MENUS: '/tenant/menus',
    ORDERS: '/tenant/orders',
    PROFILE: '/tenant/profile',
  },

  // Customer routes
  CUSTOMER: {
    DASHBOARD: '/customer/dashboard',
    ORDERS: '/customer/orders',
    PROFILE: '/customer/profile',
  },
} as const;

export type RouteKey = keyof typeof ROUTES;
