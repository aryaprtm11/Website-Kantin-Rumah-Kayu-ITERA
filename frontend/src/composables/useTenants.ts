/**
 * Composable untuk tenant management
 * Reusable logic untuk fetching dan managing tenant data
 */

import { ref } from 'vue';
import { TenantService } from '../services/tenantService';
import type { Tenant } from '../types';
import { ERROR_MESSAGES } from '../constants/messages';

export function useTenants() {
  const tenants = ref<Tenant[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch tenants from API
   */
  const fetchTenants = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      tenants.value = await TenantService.getAllTenants();
    } catch (err: any) {
      error.value = err.message || ERROR_MESSAGES.FETCH_TENANTS_FAILED;
      console.error('Error fetching tenants:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Retry fetching tenants (useful for error handling)
   */
  const retry = () => {
    fetchTenants();
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    tenants,
    loading,
    error,
    
    // Methods
    fetchTenants,
    retry,
    clearError,
  };
}

