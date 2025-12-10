/**
 * Customer Service
 * Handles all customer-related API calls
 */

import api from '../config/api';

export interface CustomerStats {
  total_orders: number;
  active_orders: number;
  completed_orders: number;
  total_spent: number;
  orders_by_status: Record<string, number>;
  favorite_tenant: {
    id: number;
    name: string;
    order_count: number;
  } | null;
}

export class CustomerService {
  private static readonly ENDPOINTS = {
    STATS: '/customer/stats',
  };

  /**
   * Get customer dashboard statistics
   */
  static async getStats(): Promise<CustomerStats> {
    try {
      const response = await api.get(this.ENDPOINTS.STATS);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch stats';
      throw new Error(message);
    }
  }
}
