export interface Tenant {
  id: number;
  name: string;
  description: string;
  logo?: string;
  is_active: boolean;
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

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

