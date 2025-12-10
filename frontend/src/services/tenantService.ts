/**
 * Tenant Service
 * Handles all tenant-related API calls
 */

import api from '../config/api';

export interface TenantStats {
  today_orders: number;
  today_revenue: number;
  total_menus: number;
  pending_orders: number;
  total_orders: number;
  total_revenue: number;
  orders_by_status: Record<string, number>;
  low_stock_menus: number;
}

export interface TenantMenu {
  id: number;
  tenant_id: number;
  name: string;
  price: number;
  category: string | null;
  photo_url: string | null;
  stock: number;
  created_at: string;
  updated_at: string;
}

export interface TenantOrder {
  id: number;
  user_id: number;
  tenant_id: number;
  total_price: number;
  type: string;
  status: string;
  payment_status: string;
  paid_amount: number;
  picked_up_at: string | null;
  completed_by_user: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  items: Array<{
    id: number;
    menu_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    menu: {
      id: number;
      name: string;
      price: number;
    };
  }>;
}

export class TenantService {
  private static readonly ENDPOINTS = {
    ALL_TENANTS: '/tenants', // tambahkan baris ini
    STATS: '/tenant/stats',
    MENUS: '/tenant/menus',
    MENU_DETAIL: (menuId: number) => `/tenant/menus/${menuId}`,
    UPDATE_STOCK: (menuId: number) => `/tenant/menus/${menuId}/stock`,
    ORDERS: '/tenant/orders',
    UPDATE_ORDER_STATUS: (orderId: number) => `/tenant/orders/${orderId}/status`,
    TENANT_INFO: '/tenant/info',
  };

  static async getAllTenants(): Promise<any> {
    try {
      const response = await api.get(this.ENDPOINTS.ALL_TENANTS);
      return response.data.data || response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch tenants';
      throw new Error(message);
    }
  }

  /**
   * Get tenant dashboard statistics
   */
  static async getStats(): Promise<TenantStats> {
    try {
      const response = await api.get(this.ENDPOINTS.STATS);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch stats';
      throw new Error(message);
    }
  }

  /**
   * Get tenant info
   */
  static async getTenantInfo(): Promise<any> {
    try {
      const response = await api.get(this.ENDPOINTS.TENANT_INFO);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch tenant info';
      throw new Error(message);
    }
  }

  /**
   * Get all menus for tenant
   */
  static async getMenus(page = 1, perPage = 15): Promise<any> {
    try {
      const response = await api.get(this.ENDPOINTS.MENUS, {
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch menus';
      throw new Error(message);
    }
  }

  /**
   * Create new menu
   */
  static async createMenu(menuData: {
    name: string;
    price: number;
    category?: string;
    photo_url?: string;
    stock: number;
  }): Promise<TenantMenu> {
    try {
      const response = await api.post(this.ENDPOINTS.MENUS, menuData);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create menu';
      throw new Error(message);
    }
  }

  /**
   * Update menu
   */
  static async updateMenu(
    menuId: number,
    menuData: Partial<{
      name: string;
      price: number;
      category: string;
      photo_url: string;
      stock: number;
    }>
  ): Promise<TenantMenu> {
    try {
      const response = await api.patch(this.ENDPOINTS.MENU_DETAIL(menuId), menuData);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update menu';
      throw new Error(message);
    }
  }

  /**
   * Update menu stock only
   */
  static async updateStock(menuId: number, stock: number): Promise<TenantMenu> {
    try {
      const response = await api.patch(this.ENDPOINTS.UPDATE_STOCK(menuId), {
        stock,
      });
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update stock';
      throw new Error(message);
    }
  }

  /**
   * Delete menu
   */
  static async deleteMenu(menuId: number): Promise<void> {
    try {
      await api.delete(this.ENDPOINTS.MENU_DETAIL(menuId));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete menu';
      throw new Error(message);
    }
  }

  /**
   * Get tenant orders
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
   * Update order status (preparing, ready_for_pickup)
   */
  static async updateOrderStatus(
    orderId: number,
    status: 'preparing' | 'ready_for_pickup'
  ): Promise<TenantOrder> {
    try {
      const response = await api.patch(this.ENDPOINTS.UPDATE_ORDER_STATUS(orderId), {
        status,
      });
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update order status';
      throw new Error(message);
    }
  }

  /**
   * Accept order (change to preparing)
   */
  static async acceptOrder(orderId: number): Promise<TenantOrder> {
    return this.updateOrderStatus(orderId, 'preparing');
  }

  /**
   * Mark order ready for pickup
   */
  static async markOrderReady(orderId: number): Promise<TenantOrder> {
    return this.updateOrderStatus(orderId, 'ready_for_pickup');
  }
}
