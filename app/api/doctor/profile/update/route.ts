import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      nombre_completo,
      telefono,
      mpps,
      especialidad,
      universidad,
      anos_experiencia,
      bio,
      subespecialidades,
      certificaciones,
      idiomas,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Actualizar perfil básico
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        nombre_completo,
        telefono,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return NextResponse.json(
        { error: "Error al actualizar el perfil" },
        { status: 500 }
      );
    }

    // Actualizar o insertar datos del médico
    const { error: doctorError } = await supabase
      .from("doctors")
      .upsert(
        {
          user_id: userId,
          mpps,
          especialidad,
          universidad,
          anos_experiencia,
          bio,
          subespecialidades,
          certificaciones,
          idiomas,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

    if (doctorError) {
      console.error("Error updating doctor:", doctorError);
      return NextResponse.json(
        { error: "Error al actualizar información del médico" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Perfil actualizado correctamente",
    });
  } catch (error) {
    console.error("Error in POST /api/doctor/profile/update:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
