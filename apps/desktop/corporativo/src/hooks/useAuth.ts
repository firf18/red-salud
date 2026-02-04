import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { MedicalService } from '@/services/medical.service';

export function useAuth() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const {
        setUser,
        setProfile,
        setToken,
        logout: clearAuth,
        isAuthenticated
    } = useAuthStore();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    setUser(session.user);
                    setToken(session.access_token);

                    const profile = await MedicalService.getProfile(session.user.id);
                    setProfile(profile);
                }
            } catch (err) {
                console.error('Error initializing auth:', err);
                setError(err instanceof Error ? err.message : 'Error de autenticación');
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                setUser(session.user);
                setToken(session.access_token);

                try {
                    const profile = await MedicalService.getProfile(session.user.id);
                    setProfile(profile);
                } catch (err) {
                    console.error('Error getting profile:', err);
                }
            } else {
                // DON'T clear if it's a Master Seed session
                const currentProfile = useAuthStore.getState().profile;
                if (currentProfile?.email !== 'master@seed.vault') {
                    clearAuth();
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            setUser(data.user);
            setToken(data.session?.access_token || null);

            const profile = await MedicalService.getProfile(data.user.id);
            setProfile(profile);

            return { user: data.user, profile };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        setError(null);

        try {
            await supabase.auth.signOut();
            clearAuth();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al cerrar sesión';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        isAuthenticated: isAuthenticated(),
        signIn,
        signOut,
    };
}
