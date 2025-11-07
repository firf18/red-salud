import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Proxy de autenticación para Next.js 16
 * 
 * Características:
 * - Protección de rutas por autenticación
 * - Protección de rutas por rol
 * - Sincronización de cookies de Supabase
 * - Redirecciones inteligentes
 */

// Rutas públicas que no requieren autenticación
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/callback',
  '/public',
]

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ['/dashboard']

// Rutas de autenticación (si ya está autenticado, redirigir al dashboard)
const AUTH_ROUTES = ['/auth/login', '/auth/register']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirigir raíz a /public
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/public', request.url))
  }

  // Permitir todas las rutas que empiezan con /public
  if (pathname.startsWith('/public')) {
    return NextResponse.next()
  }

  // Crear respuesta que se puede modificar
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Crear cliente de Supabase con manejo de cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Obtener usuario autenticado
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // Si hay error de autenticación (token inválido), limpiar cookies
  // PERO solo si NO estamos ya en una ruta de auth (evitar loop)
  if (authError && !pathname.startsWith('/auth') && !pathname.startsWith('/public')) {
    // Limpiar todas las cookies de Supabase
    const cookiesToDelete = request.cookies.getAll()
      .filter(cookie => cookie.name.startsWith('sb-'))
      .map(cookie => cookie.name);

    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    
    cookiesToDelete.forEach(cookieName => {
      response.cookies.delete(cookieName);
    });

    return response;
  }

  // ============================================================================
  // CASO 1: Usuario NO autenticado intenta acceder a ruta protegida
  // ============================================================================
  if (!user && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ============================================================================
  // CASO 2: Usuario autenticado intenta acceder a rutas de auth (login/register)
  // ============================================================================
  if (user && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    // Obtener el rol del usuario desde user_metadata o profiles
    let role = user.user_metadata?.role
    
    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      role = profile?.role
    }
    
    // Si tiene rol, redirigir a su dashboard
    if (role) {
      const dashboardUrl = new URL(`/dashboard/${role}`, request.url)
      return NextResponse.redirect(dashboardUrl)
    }
    
    // Si no tiene rol, permitir acceso a las rutas de auth
    return NextResponse.next()
  }

  // ============================================================================
  // CASO 3: Usuario autenticado accede al dashboard
  // ============================================================================
  if (user && pathname.startsWith('/dashboard')) {
    // Primero intentar obtener el rol de user_metadata
    let role = user.user_metadata?.role

    // Si no está en user_metadata, consultar la tabla profiles
    if (!role) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      role = profile?.role
    }

    // Si no tiene rol en ningún lado, CERRAR SESIÓN y redirigir a login
    if (!role) {
      await supabase.auth.signOut();
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('error', 'no_role');
      loginUrl.searchParams.set('message', 'Debes registrarte con un rol específico');
      
      const response = NextResponse.redirect(loginUrl);
      
      // Limpiar cookies
      const cookiesToDelete = request.cookies.getAll()
        .filter(cookie => cookie.name.startsWith('sb-'))
        .map(cookie => cookie.name);
      
      cookiesToDelete.forEach(cookieName => {
        response.cookies.delete(cookieName);
      });
      
      return response;
    }

    // Extraer el rol de la URL (ej: /dashboard/paciente -> paciente)
    const urlParts = pathname.split('/')
    const dashboardRole = urlParts[2] // dashboard/[role]/...

    // Si está en /dashboard sin rol específico, redirigir a su dashboard
    if (!dashboardRole || dashboardRole === 'redirect') {
      const dashboardUrl = new URL(`/dashboard/${role}`, request.url)
      return NextResponse.redirect(dashboardUrl)
    }

    // Verificar que el usuario accede a su dashboard correcto
    // Permitir acceso a rutas compartidas (shared, api, etc.)
    const sharedRoutes = ['shared', 'api', '_next']
    if (
      dashboardRole &&
      dashboardRole !== role &&
      !sharedRoutes.includes(dashboardRole)
    ) {
      // Usuario intenta acceder a dashboard de otro rol
      const correctDashboardUrl = new URL(`/dashboard/${role}`, request.url)
      return NextResponse.redirect(correctDashboardUrl)
    }
  }

  // ============================================================================
  // CASO 4: Todo está bien, continuar
  // ============================================================================
  return response
}

// Configuración del matcher
// Excluye archivos estáticos, imágenes, y rutas de Next.js
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
