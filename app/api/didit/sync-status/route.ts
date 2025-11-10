import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DIDIT_API_KEY = process.env.DIDIT_API_KEY;
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    if (!DIDIT_API_KEY) {
      return NextResponse.json(
        { error: "Configuración de Didit incompleta" },
        { status: 500 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId requerido" },
        { status: 400 }
      );
    }

    // Obtener el session_id del perfil
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("didit_request_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile || !profile.didit_request_id) {
      return NextResponse.json(
        { error: "No hay sesión de verificación activa" },
        { status: 404 }
      );
    }

    console.log("🔄 Sincronizando estado para sesión:", profile.didit_request_id);

    // Consultar el estado en Didit
    const diditResponse = await fetch(
      `https://verification.didit.me/v2/session/${profile.didit_request_id}`,
      {
        method: "GET",
        headers: {
          "accept": "application/json",
          "x-api-key": DIDIT_API_KEY,
        },
      }
    );

    if (!diditResponse.ok) {
      const errorData = await diditResponse.json();
      console.error("Error al consultar Didit:", errorData);
      return NextResponse.json(
        { error: "Error al consultar estado de verificación" },
        { status: diditResponse.status }
      );
    }

    const sessionData = await diditResponse.json();
    console.log("📊 Estado de sesión en Didit:", sessionData);

    // Si está aprobado, actualizar el perfil
    if (sessionData.status === "Approved" && sessionData.decision) {
      const updateData: any = {
        cedula_verificada: true,
        photo_verified: true,
        cedula_verified_at: new Date().toISOString(),
        cedula_photo_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Extraer datos del documento
      if (sessionData.decision.id_verification) {
        const idData = sessionData.decision.id_verification;
        
        if (idData.document_number) {
          updateData.cedula = idData.document_number;
        }
        
        if (idData.first_name) {
          const nombres = idData.first_name.split(" ");
          updateData.primer_nombre = nombres[0];
          if (nombres.length > 1) {
            updateData.segundo_nombre = nombres.slice(1).join(" ");
          }
        }
        
        if (idData.last_name) {
          const apellidos = idData.last_name.split(" ");
          updateData.primer_apellido = apellidos[0];
          if (apellidos.length > 1) {
            updateData.segundo_apellido = apellidos.slice(1).join(" ");
          }
        }
        
        if (idData.first_name && idData.last_name) {
          updateData.nombre = `${idData.first_name} ${idData.last_name}`.trim();
        }
        
        if (idData.date_of_birth) {
          updateData.fecha_nacimiento = idData.date_of_birth;
        }
        
        if (idData.gender) {
          updateData.sexo_biologico = idData.gender === "F" ? "femenino" : "masculino";
        }
      }

      console.log("💾 Actualizando perfil con datos:", updateData);

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (updateError) {
        console.error("❌ Error al actualizar perfil:", updateError);
        return NextResponse.json(
          { error: "Error al actualizar perfil" },
          { status: 500 }
        );
      }

      console.log("✅ Perfil actualizado exitosamente");

      return NextResponse.json({
        success: true,
        status: sessionData.status,
        updated: true,
        message: "Perfil actualizado con datos de verificación",
      });
    }

    return NextResponse.json({
      success: true,
      status: sessionData.status,
      updated: false,
      message: `Estado actual: ${sessionData.status}`,
    });
  } catch (error) {
    console.error("Error en sync-status:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
