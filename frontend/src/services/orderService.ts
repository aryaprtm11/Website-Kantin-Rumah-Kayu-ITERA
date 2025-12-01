/**
 * Order Service
 * Handles all order-related API calls
 */

import api from '../config/api';
import type { ApiResponse } from '../types';

export interface OrderItem {
  id: number;
  menu_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  menu?: {
    id: number;
    name: string;
    price: number;
    category?: string;
    photo_url?: string;
  };
}

export interface Order {
  id: number;
  user_id: number;
  tenant_id: number;
  tenant?: {
    id: number;
    name: string;
    opens_at: string;
    closes_at: string;
  };
  type: string;
  status: string;
  payment_status: string;
  total_price: number;
  paid_amount: number;
  picked_up_at: string | null;
  completed_by_user: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface CreateOrderData {
  tenant_id: number;
  type: string;
  items: {
    menu_id: number;
    qty: number;
  }[];
}

export interface PaginatedOrdersResponse {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export class OrderService {
  private static readonly ENDPOINTS = {
    ORDERS: '/orders',
    ORDER_DETAIL: (orderId: number) => `/orders/${orderId}`,
    PAY_ORDER: (orderId: number) => `/orders/${orderId}/pay`,
    PICKUP_ORDER: (orderId: number) => `/orders/${orderId}/pickup`,
    COMPLETE_ORDER: (orderId: number) => `/orders/${orderId}/complete`,
  };

  /**
   * Fetch all orders for current user
   * @returns Promise with array of orders
   * @throws Error if request fails
   */
  static async getUserOrders(): Promise<Order[]> {
    try {
      const response = await api.get<ApiResponse<Order[]>>(
        this.ENDPOINTS.ORDERS
      );
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch orders';
      throw new Error(message);
    }
  }

  /**
   * Fetch single order by ID
   * @param orderId - The ID of the order
   * @returns Promise with order data
   */
  static async getOrderById(orderId: number): Promise<Order> {
    try {
      const response = await api.get<ApiResponse<Order>>(
        this.ENDPOINTS.ORDER_DETAIL(orderId)
      );
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch order';
      throw new Error(message);
    }
  }

  /**
   * Create new order
   * @param orderData - Order data with items
   * @returns Promise with created order
   */
  static async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const response = await api.post<ApiResponse<Order>>(
        this.ENDPOINTS.ORDERS,
        orderData
      );
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create order';
      throw new Error(message);
    }
  }

  /**
   * Mark order as paid
   * @param orderId - The ID of the order
   * @param paidAmount - Amount paid (optional, defaults to total_price)
   * @returns Promise with updated order
   */
  static async payOrder(orderId: number, paidAmount?: number): Promise<Order> {
    try {
      const response = await api.post<ApiResponse<Order>>(
        this.ENDPOINTS.PAY_ORDER(orderId),
        paidAmount ? { paid_amount: paidAmount } : {}
      );
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to pay order';
      throw new Error(message);
    }
  }

  /**
   * Mark order as picked up
   * @param orderId - The ID of the order
   * @returns Promise with updated order
   */
  static async pickupOrder(orderId: number): Promise<Order> {
    try {
      const response = await api.post<ApiResponse<Order>>(
        this.ENDPOINTS.PICKUP_ORDER(orderId)
      );
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to pickup order';
      throw new Error(message);
    }
  }

  /**
   * Mark order as completed
   * @param orderId - The ID of the order
   * @returns Promise with updated order
   */
  static async completeOrder(orderId: number): Promise<Order> {
    try {
      const response = await api.post<ApiResponse<Order>>(
        this.ENDPOINTS.COMPLETE_ORDER(orderId)
      );
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to complete order';
      throw new Error(message);
    }
  }

  /**
   * Get status badge color based on order status
   * @param status - Order status
   * @returns CSS class for status badge
   */
  static getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      created: 'status-created',
      preparing: 'status-preparing',
      ready_for_pickup: 'status-ready',
      picked_up: 'status-picked',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
    };
    return statusColors[status] || 'status-default';
  }

  /**
   * Get payment status badge color
   * @param paymentStatus - Payment status
   * @returns CSS class for payment status badge
   */
  static getPaymentStatusColor(paymentStatus: string): string {
    const statusColors: Record<string, string> = {
      unpaid: 'payment-unpaid',
      pending: 'payment-pending',
      paid: 'payment-paid',
      failed: 'payment-failed',
      expired: 'payment-expired',
    };
    return statusColors[paymentStatus] || 'payment-default';
  }

  /**
   * Format status text to readable Indonesian
   * @param status - Order status
   * @returns Formatted status text
   */
  static formatStatus(status: string): string {
    const statusTexts: Record<string, string> = {
      created: 'Dibuat',
      preparing: 'Sedang Diproses',
      ready_for_pickup: 'Siap Diambil',
      picked_up: 'Sudah Diambil',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    return statusTexts[status] || status;
  }

  /**
   * Format payment status text to readable Indonesian
   * @param paymentStatus - Payment status
   * @returns Formatted payment status text
   */
  static formatPaymentStatus(paymentStatus: string): string {
    const statusTexts: Record<string, string> = {
      unpaid: 'Belum Bayar',
      pending: 'Menunggu',
      paid: 'Lunas',
      failed: 'Gagal',
      expired: 'Kedaluwarsa',
    };
    return statusTexts[paymentStatus] || paymentStatus;
  }
}

