import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DIDIT_API_KEY = process.env.DIDIT_API_KEY;

export async function GET() {
  try {
    if (!DIDIT_API_KEY) {
      return NextResponse.json(
        { error: "Configuración de Didit incompleta" },
        { status: 500 },
      );
    }

    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener el session_id del perfil
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("didit_request_id, photo_verified, cedula_verificada")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !profile.didit_request_id) {
      return NextResponse.json(
        { error: "No hay sesión de verificación activa" },
        { status: 404 },
      );
    }

    // Consultar el estado en Didit
    const diditResponse = await fetch(
      `https://verification.didit.me/v2/session/${profile.didit_request_id}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-api-key": DIDIT_API_KEY,
        },
      },
    );

    if (!diditResponse.ok) {
      const errorData = await diditResponse.json();
      console.error("Error al consultar Didit:", errorData);
      return NextResponse.json(
        { error: "Error al consultar estado de verificación" },
        { status: diditResponse.status },
      );
    }

    const sessionData = await diditResponse.json();
    console.log("📊 Estado de sesión en Didit:", {
      session_id: sessionData.session_id,
      status: sessionData.status,
      decision: sessionData.decision ? "Presente" : "No presente",
    });

    return NextResponse.json({
      session_id: sessionData.session_id,
      status: sessionData.status,
      didit_status: sessionData.status,
      local_photo_verified: profile.photo_verified,
      local_cedula_verificada: profile.cedula_verificada,
      needs_update:
        sessionData.status === "Approved" && !profile.photo_verified,
    });
  } catch (error) {
    console.error("Error en check-status:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
