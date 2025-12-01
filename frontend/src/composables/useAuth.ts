/**
 * Auth Composable
 * Reusable authentication logic
 */

import { ref, computed } from 'vue';
import { AuthService, type LoginCredentials, type RegisterData, type User } from '../services/authService';
import { ERROR_MESSAGES } from '../constants/messages';

// Shared state across all instances
const currentUser = ref<User | null>(AuthService.getUser());
const isAuthenticated = ref<boolean>(AuthService.isAuthenticated());

export function useAuth() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Login user
   * @param credentials - Login credentials (email & password)
   */
  const login = async (credentials: LoginCredentials) => {
    loading.value = true;
    error.value = null;

    try {
      const authData = await AuthService.login(credentials);
      currentUser.value = authData.user;
      isAuthenticated.value = true;
      return authData;
    } catch (err: any) {
      error.value = err.message || ERROR_MESSAGES.UNAUTHORIZED;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Register new user
   * @param data - Registration data
   */
  const register = async (data: RegisterData) => {
    loading.value = true;
    error.value = null;

    try {
      const authData = await AuthService.register(data);
      currentUser.value = authData.user;
      isAuthenticated.value = true;
      return authData;
    } catch (err: any) {
      error.value = err.message || 'Registrasi gagal';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    loading.value = true;
    error.value = null;

    try {
      await AuthService.logout();
      currentUser.value = null;
      isAuthenticated.value = false;
    } catch (err: any) {
      error.value = err.message || 'Logout gagal';
      console.error('Logout error:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get current user data from API
   */
  const fetchCurrentUser = async () => {
    if (!AuthService.isAuthenticated()) {
      currentUser.value = null;
      isAuthenticated.value = false;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const user = await AuthService.getCurrentUser();
      currentUser.value = user;
      isAuthenticated.value = true;
    } catch (err: any) {
      error.value = err.message;
      // If fetch fails, clear auth
      await logout();
    } finally {
      loading.value = false;
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null;
  };

  // Computed properties
  const userName = computed(() => currentUser.value?.name || '');
  const userEmail = computed(() => currentUser.value?.email || '');

  return {
    // State
    currentUser,
    isAuthenticated,
    loading,
    error,
    
    // Computed
    userName,
    userEmail,
    
    // Methods
    login,
    register,
    logout,
    fetchCurrentUser,
    clearError,
  };
}



