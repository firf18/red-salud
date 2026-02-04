import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/services/auth.service';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    setUser, 
    setPharmacyUser, 
    setToken, 
    logout: clearAuth,
    isAuthenticated 
  } = useAuthStore();

  useEffect(() => {
    // Check active session on mount
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setUser(session.user);
          setToken(session.access_token);
          
          // Get pharmacy user details
          const pharmacyUser = await AuthService.getPharmacyUser(session.user.id);
          setPharmacyUser(pharmacyUser);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err instanceof Error ? err.message : 'Error de autenticación');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
        
        try {
          const pharmacyUser = await AuthService.getPharmacyUser(session.user.id);
          setPharmacyUser(pharmacyUser);
        } catch (err) {
          console.error('Error getting pharmacy user:', err);
        }
      } else {
        clearAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { user, session, pharmacyUser } = await AuthService.login(email, password);
      
      setUser(user);
      setToken(session?.access_token || null);
      setPharmacyUser(pharmacyUser);
      
      return { user, pharmacyUser };
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
      await AuthService.logout();
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
