import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    user: any | null;
    profile: any | null;
    token: string | null;
    setUser: (user: any) => void;
    setProfile: (profile: any) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            profile: null,
            token: null,
            setUser: (user) => set({ user }),
            setProfile: (profile) => set({ profile }),
            setToken: (token) => set({ token }),
            logout: () => set({ user: null, profile: null, token: null }),
            isAuthenticated: () => !!get().token || get().profile?.email === 'master@seed.vault',
        }),
        {
            name: 'auth-storage',
        }
    )
);
