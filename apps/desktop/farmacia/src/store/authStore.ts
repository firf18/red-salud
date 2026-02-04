import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';
import type { PharmacyUser, UserRole } from '@/types/user.types';

interface AuthState {
  user: User | null;
  pharmacyUser: PharmacyUser | null;
  token: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setPharmacyUser: (pharmacyUser: PharmacyUser | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  
  // Helpers
  isAuthenticated: () => boolean;
  hasRole: (roles: UserRole[]) => boolean;
  getFullName: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      pharmacyUser: null,
      token: null,

      setUser: (user) => set({ user }),
      setPharmacyUser: (pharmacyUser) => set({ pharmacyUser }),
      setToken: (token) => set({ token }),
      
      logout: () => set({ 
        user: null, 
        pharmacyUser: null, 
        token: null 
      }),

      isAuthenticated: () => {
        const { token, user } = get();
        return !!token && !!user;
      },

      hasRole: (roles) => {
        const { pharmacyUser } = get();
        return pharmacyUser ? roles.includes(pharmacyUser.role) : false;
      },

      getFullName: () => {
        const { pharmacyUser } = get();
        if (!pharmacyUser) return '';
        return `${pharmacyUser.first_name} ${pharmacyUser.last_name}`;
      },
    }),
    {
      name: 'farmacia-auth',
    }
  )
);
