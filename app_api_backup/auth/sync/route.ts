import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * Endpoint para sincronizar la sesión de Supabase
 * Cuando el cliente llama a este endpoint después de signIn(),
 * el servidor se asegura de que la sesión esté disponible en las cookies
 */
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { success: true, message: "Sesión sincronizada" },
      { status: 200 }
    );

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    );

    // Simplemente obtener el usuario fuerza a que Supabase sincronice las cookies
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      console.log(`✅ Sesión sincronizada para: ${user.email}`);
    } else {
      console.log(`⚠️ No hay sesión activa`);
    }

    return response;
  } catch (error) {
    console.error("Error en /api/auth/session:", error);
    return NextResponse.json(
      { success: false, error: "Error sincronizando sesión" },
      { status: 500 }
    );
  }
}

