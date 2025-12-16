/**
 * API endpoint constants
 * Centralized API paths
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    LOGOUT: '/logout',
    ME: '/me',
  },

  // Tenants
  TENANTS: '/tenants',
  TENANT_DETAIL: (id: number | string) => `/tenants/${id}`,
  TENANT_MENUS: (id: number | string) => `/tenants/${id}/menus`,

  // Orders
  ORDERS: '/orders',
  ORDER_DETAIL: (id: number | string) => `/orders/${id}`,
  ORDER_STATUS: (id: number | string) => `/orders/${id}/status`,

  // Tenant Admin
  TENANT_ADMIN: {
    MENUS: '/tenant/menus',
    MENU_DETAIL: (id: number | string) => `/tenant/menus/${id}`,
    MENU_STOCK: (id: number | string) => `/tenant/menus/${id}/stock`,
    ORDERS: '/tenant/orders',
    ORDER_STATUS: (id: number | string) => `/tenant/orders/${id}/status`,
  },

  // Admin
  ADMIN: {
    USERS: '/admin/users',
    USER_DETAIL: (id: number | string) => `/admin/users/${id}`,
    TENANTS: '/admin/tenants',
    TENANT_DETAIL: (id: number | string) => `/admin/tenants/${id}`,
    STATISTICS: '/admin/statistics',
  },

  // Customer
  CUSTOMER: {
    ORDERS: '/customer/orders',
    PROFILE: '/customer/profile',
  },
} as const;
