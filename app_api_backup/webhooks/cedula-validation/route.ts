import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Webhook para recibir notificaciones de validación de cédula
 * URL: https://tu-dominio.com/api/webhooks/cedula-validation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Obtener datos del webhook
    const data = await request.json();

    // Validar que tenga los campos necesarios
    if (!data.userId || !data.cedula) {
      return NextResponse.json(
        { error: true, message: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Registrar el evento en la base de datos
    await supabase.from("user_activity_log").insert({
      user_id: data.userId,
      activity_type: "cedula_validation_webhook",
      description: `Webhook recibido para cédula ${data.cedula}`,
      status: data.success ? "success" : "failed",
      metadata: data,
    });

    // Si la validación fue exitosa, actualizar el perfil
    if (data.success && data.cedulaData) {
      await supabase
        .from("profiles")
        .update({
          cedula_verificada: true,
          nombre_completo: data.cedulaData.nombreCompleto,
          cne_estado: data.cedulaData.cne?.estado,
          cne_municipio: data.cedulaData.cne?.municipio,
          cne_parroquia: data.cedulaData.cne?.parroquia,
          cne_centro_electoral: data.cedulaData.cne?.centroElectoral,
          rif: data.cedulaData.rif,
          nacionalidad: data.cedulaData.nacionalidad,
          primer_nombre: data.cedulaData.primerNombre,
          segundo_nombre: data.cedulaData.segundoNombre,
          primer_apellido: data.cedulaData.primerApellido,
          segundo_apellido: data.cedulaData.segundoApellido,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.userId);
    }

    return NextResponse.json({
      success: true,
      message: "Webhook procesado correctamente",
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: true, message: "Error al procesar el webhook" },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar que el webhook está activo
export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "/api/webhooks/cedula-validation",
    message: "Webhook de validación de cédula activo",
  });
}
