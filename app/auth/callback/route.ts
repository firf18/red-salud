import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Callback de OAuth (Google, GitHub, etc.)
 * Maneja el intercambio de código por sesión y redirección
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options || {})
              );
            } catch {
              // Ignore - puede fallar en Server Components
            }
          },
        },
      }
    );
    
    // Intercambiar código por sesión
    await supabase.auth.exchangeCodeForSession(code);
    
    // Obtener el usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Leer el rol desde la tabla profiles (NO desde user_metadata)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      
      if (profile?.role) {
        // Usuario tiene perfil completo → redirigir a su dashboard
        return NextResponse.redirect(new URL(`/dashboard/${profile.role}`, requestUrl.origin));
      } else {
        // Usuario NO tiene perfil → redirigir a completar perfil
        return NextResponse.redirect(new URL("/auth/complete-profile", requestUrl.origin));
      }
    }
  }

  // Si algo sale mal, redirigir al login
  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}

