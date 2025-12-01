/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import api from '../config/api';
import type { ApiResponse } from '../types';
import { normalizeUser } from '../utils/roleHelper';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export class AuthService {
  private static readonly ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  };

  private static readonly TOKEN_KEY = 'token';
  private static readonly USER_KEY = 'user';

  /**
   * Login user with email and password
   * @param credentials - User login credentials
   * @returns Promise with auth response (user & token)
   * @throws Error if login fails
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post(
        this.ENDPOINTS.LOGIN,
        credentials
      );

      // Normalize different possible response shapes:
      // { user, token } or { data: { user, token } }
      const authData = this.normalizeAuthResponse(response.data);

      // Store token and user in localStorage
      this.setToken(authData.token);
      this.setUser(authData.user);

      return authData;
    } catch (error: any) {
      console.error('Login error full:', error);
      console.error('Login error response:', error.response);
      
      const message = error.response?.data?.message || error.message || 'Login gagal';
      throw new Error(message);
    }
  }

  /**
   * Register new user
   * @param data - User registration data
   * @returns Promise with auth response
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post(
        this.ENDPOINTS.REGISTER,
        data
      );

      // Normalize different possible response shapes:
      // { user, token } or { data: { user, token } }
      const authData = this.normalizeAuthResponse(response.data);

      // Store token and user
      this.setToken(authData.token);
      this.setUser(authData.user);

      return authData;
    } catch (error: any) {
      console.error('Register error full:', error);
      console.error('Register error response:', error.response);
      
      const message = error.response?.data?.message || error.message || 'Registrasi gagal';
      throw new Error(message);
    }
  }

  /**
   * Logout current user
   * @returns Promise
   */
  static async logout(): Promise<void> {
    try {
      await api.post(this.ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      this.clearAuth();
    }
  }

  /**
   * Get current authenticated user
   * @returns Promise with user data
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>(this.ENDPOINTS.ME);
      return response.data.data;
    } catch (error: any) {
      throw new Error('Failed to get user data');
    }
  }

  /**
   * Store token in localStorage
   * @param token - Auth token
   */
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Get token from localStorage
   * @returns Token string or null
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Store user data in localStorage
   * Normalize role dari Laravel Enum ke string
   * @param user - User object
   */
  static setUser(user: User): void {
    const normalizedUser = normalizeUser(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(normalizedUser));
  }

  /**
   * Get user from localStorage
   * @returns User object or null
   */
  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Clear authentication data
   */
  static clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if user is authenticated
   * @returns boolean
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Normalize auth response from backend to a consistent shape
   * Supports both { user, token } and { data: { user, token } }
   */
  private static normalizeAuthResponse(payload: any): AuthResponse {
    const data = payload?.data ?? payload;

    if (!data?.user || !data?.token) {
      console.error('Invalid auth response format:', payload);
      throw new Error('Invalid response from server');
    }

    return {
      user: data.user,
      token: data.token,
    };
  }
}



