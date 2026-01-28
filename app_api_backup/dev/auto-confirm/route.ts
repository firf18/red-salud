import { NextResponse } from "next/server";

/**
 * POST /api/dev/auto-confirm
 * Body: { userId: string }
 *
 * Endpoint para auto-confirmar emails en desarrollo.
 * En desarrollo, los usuarios pueden continuar sin confirmar email.
 * Esta es una ruta no-op en desarrollo para mantener compatibilidad.
 */
export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Forbidden - Este endpoint solo funciona en desarrollo" },
      { status: 403 }
    );
  }

  try {
    const { userId } = (await req.json()) as { userId?: string };

    if (!userId) {
      return NextResponse.json({ error: "userId es requerido" }, { status: 400 });
    }

    // En desarrollo, simplemente permitimos que continúe sin confirmación
    // La tabla profiles ya fue creada por signUp() en lib/supabase/auth.ts
    console.log(`📧 Auto-confirm (dev): Usuario ${userId} continúa sin confirmación de email`);

    return NextResponse.json({
      ok: true,
      message: "Email auto-confirmado (desarrollo)",
      userId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error inesperado";
    console.error("Error en auto-confirm:", message);
    // No fallar, permitir que continúe
    return NextResponse.json({
      ok: true,
      message: "Auto-confirm permitido en desarrollo",
      warning: message,
    });
  }
}
