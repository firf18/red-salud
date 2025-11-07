"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

/**
 * Sincroniza la sesión de Supabase del cliente con el servidor
 * Esto permite que proxy.ts pueda leer la sesión de las cookies
 */
export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Sincronizar sesión inicial
    const syncSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Hacer una petición al servidor para que guarde la sesión en cookies
          // Esto es automático con el proxy.ts que maneja las cookies
          console.log("✅ Sesión sincronizada del cliente");
        }
      } catch (error) {
        console.error("Error sincronizando sesión:", error);
      }
    };

    syncSession();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        console.log(`📧 Auth event: ${event}`, session?.user?.email);
        // La sesión se ha actualizado, forzar refresh del servidor
        // Esto hará que proxy.ts re-evalúe la sesión
        const response = await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            accessToken: session?.access_token,
            refreshToken: session?.refresh_token,
          }),
        }).catch(() => null);

        if (response?.ok) {
          console.log("✅ Sesión sincronizada con servidor");
        }
      } else if (event === "SIGNED_OUT") {
        console.log("🔓 Usuario desconectado");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
