export type UserRole = 'admin' | 'manager' | 'pharmacist' | 'cashier' | 'supervisor';

export interface PharmacyUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
