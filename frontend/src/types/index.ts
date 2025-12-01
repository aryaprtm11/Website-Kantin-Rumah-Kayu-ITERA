export interface Tenant {
  id: number;
  name: string;
  opens_at: string;
  closes_at: string;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

export interface Menu {
  id: number;
  tenant_id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  stock: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Laravel Enum format
export interface RoleEnum {
  name: string;
  value: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: RoleEnum | string; // Support both Enum object and string
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

