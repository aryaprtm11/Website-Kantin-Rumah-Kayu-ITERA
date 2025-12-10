/**
 * Admin Service
 * Handles all admin-related API calls
 */

import api from '../config/api';

export interface AdminStats {
  total_tenants: number;
  total_users: number;
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  total_menus: number;
  orders_by_status: Record<string, number>;
  today_orders: number;
  today_revenue: number;
  pending_orders: number;
}

export interface TenantWithStats {
  id: number;
  user_id: number;
  name: string;
  opens_at: string;
  closes_at: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  menus_count: number;
  orders_count: number;
}

export interface UserWithStats {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  orders_count: number;
}

export class AdminService {
  private static readonly ENDPOINTS = {
    STATS: '/admin/stats',
    TENANTS: '/admin/tenants',
    USERS: '/admin/users',
    ORDERS: '/admin/orders',
    ACTIVITIES: '/admin/activities',
    UPDATE_USER_ROLE: (userId: number) => `/admin/users/${userId}/role`,
    DELETE_USER: (userId: number) => `/admin/users/${userId}`,
    DELETE_TENANT: (tenantId: number) => `/admin/tenants/${tenantId}`,
  };

  /**
   * Get dashboard statistics
   */
  static async getStats(): Promise<AdminStats> {
    try {
      const response = await api.get(this.ENDPOINTS.STATS);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch stats';
      throw new Error(message);
    }
  }

  /**
   * Get all tenants with pagination
   */
  static async getTenants(page = 1, perPage = 15): Promise<any> {
    try {
      const response = await api.get(this.ENDPOINTS.TENANTS, {
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch tenants';
      throw new Error(message);
    }
  }

  /**
   * Get all users with pagination
   */
  static async getUsers(page = 1, perPage = 15, role?: string): Promise<any> {
    try {
      const response = await api.get(this.ENDPOINTS.USERS, {
        params: { page, per_page: perPage, role },
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch users';
      throw new Error(message);
    }
  }

  /**
   * Get all orders with pagination
   */
  static async getOrders(page = 1, perPage = 15, status?: string): Promise<any> {
    try {
      const response = await api.get(this.ENDPOINTS.ORDERS, {
        params: { page, per_page: perPage, status },
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch orders';
      throw new Error(message);
    }
  }

  /**
   * Get recent activities
   */
  static async getRecentActivities(): Promise<any> {
    try {
      const response = await api.get(this.ENDPOINTS.ACTIVITIES);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch activities';
      throw new Error(message);
    }
  }

  /**
   * Update user role
   */
  static async updateUserRole(userId: number, role: string): Promise<any> {
    try {
      const response = await api.patch(this.ENDPOINTS.UPDATE_USER_ROLE(userId), {
        role,
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update user role';
      throw new Error(message);
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: number): Promise<void> {
    try {
      await api.delete(this.ENDPOINTS.DELETE_USER(userId));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete user';
      throw new Error(message);
    }
  }

  /**
   * Delete tenant
   */
  static async deleteTenant(tenantId: number): Promise<void> {
    try {
      await api.delete(this.ENDPOINTS.DELETE_TENANT(tenantId));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete tenant';
      throw new Error(message);
    }
  }
}
