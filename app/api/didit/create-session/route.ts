import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DIDIT_API_KEY = process.env.DIDIT_API_KEY;
const DIDIT_WORKFLOW_ID = process.env.DIDIT_WORKFLOW_ID;
const DIDIT_API_URL = "https://verification.didit.me/v2/session/";

export async function POST() {
  try {
    // Verificar que las variables de entorno estén configuradas
    if (!DIDIT_API_KEY || !DIDIT_WORKFLOW_ID) {
      console.error("Faltan variables de entorno de Didit");
      return NextResponse.json(
        {
          error:
            "Configuración de Didit incompleta. Contacta al administrador.",
        },
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

    // Obtener datos del perfil
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 },
      );
    }

    // Crear sesión en Didit
    const requestBody: {
      workflow_id: string | undefined;
      vendor_data: string;
      contact_details: {
        email: string | null | undefined;
        email_lang: string;
      };
      callback: string;
      expected_details?: {
        first_name: string;
        last_name: string;
      };
    } = {
      workflow_id: DIDIT_WORKFLOW_ID,
      vendor_data: user.id, // ID del usuario para identificarlo en el webhook
      contact_details: {
        email: user.email,
        email_lang: "es",
      },
      callback: `${process.env.NEXT_PUBLIC_APP_URL || "https://red-salud.vercel.app"}/dashboard/paciente`,
    };

    // Solo enviar expected_details si tenemos datos completos del perfil
    // Esto evita discrepancias con el documento real
    if (
      profile.primer_nombre &&
      profile.segundo_nombre &&
      profile.primer_apellido &&
      profile.segundo_apellido
    ) {
      requestBody.expected_details = {
        first_name: `${profile.primer_nombre} ${profile.segundo_nombre}`.trim(),
        last_name:
          `${profile.primer_apellido} ${profile.segundo_apellido}`.trim(),
      };
    }

    console.log("📤 Enviando solicitud a Didit:", {
      url: DIDIT_API_URL,
      workflow_id: DIDIT_WORKFLOW_ID,
      user_id: user.id,
    });

    const diditResponse = await fetch(DIDIT_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": DIDIT_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!diditResponse.ok) {
      const errorData = await diditResponse.json();
      console.error("Error de Didit:", errorData);
      return NextResponse.json(
        { error: "Error al crear sesión de verificación", details: errorData },
        { status: diditResponse.status },
      );
    }

    const sessionData = await diditResponse.json();
    console.log("✅ Respuesta de Didit:", sessionData);

    // Guardar el session_id en el perfil
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        didit_request_id: sessionData.session_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error al actualizar perfil:", updateError);
    }

    // Didit devuelve 'url' en lugar de 'session_url'
    const verificationUrl = sessionData.url || sessionData.session_url;

    console.log("📤 Enviando respuesta al cliente:", {
      success: true,
      session_id: sessionData.session_id,
      session_url: verificationUrl,
    });

    return NextResponse.json({
      success: true,
      session_id: sessionData.session_id,
      session_url: verificationUrl,
    });
  } catch (error) {
    console.error("Error en create-session:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
