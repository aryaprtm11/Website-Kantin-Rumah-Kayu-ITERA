/**
 * Service layer untuk tenant-related API calls
 * Memisahkan business logic dari components
 */

import api from '../config/api';
import type { Tenant, ApiResponse } from '../types';

export class TenantService {
  private static readonly ENDPOINTS = {
    TENANTS: '/tenants',
    TENANT_MENUS: (tenantId: number) => `/tenants/${tenantId}/menus`,
  };

  /**
   * Fetch all tenants from API
   * @returns Promise with array of tenants
   * @throws Error if request fails
   */
  static async getAllTenants(): Promise<Tenant[]> {
    try {
      const response = await api.get<ApiResponse<Tenant[]>>(
        this.ENDPOINTS.TENANTS
      );
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch tenants';
      throw new Error(message);
    }
  }

  /**
   * Fetch single tenant by ID
   * @param tenantId - The ID of the tenant
   * @returns Promise with tenant data
   */
  static async getTenantById(tenantId: number): Promise<Tenant> {
    try {
      const response = await api.get<ApiResponse<Tenant>>(
        `${this.ENDPOINTS.TENANTS}/${tenantId}`
      );
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch tenant';
      throw new Error(message);
    }
  }

  /**
   * Check if tenant is currently active/open
   * @param tenant - Tenant object
   * @returns boolean indicating if tenant is active
   */
  static isOpen(tenant: Tenant): boolean {
    return tenant.is_open;
  }
}



