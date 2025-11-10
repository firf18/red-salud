import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Obtener datos del perfil
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Error al obtener el perfil" },
        { status: 500 }
      );
    }

    // Obtener datos del médico
    const { data: doctor, error: doctorError } = await supabase
      .from("doctors")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (doctorError && doctorError.code !== "PGRST116") {
      console.error("Error fetching doctor:", doctorError);
    }

    // Combinar datos
    const combinedData = {
      nombre_completo: profile.nombre_completo,
      email: profile.email,
      telefono: profile.telefono,
      cedula: profile.cedula,
      mpps: doctor?.mpps || "",
      especialidad: doctor?.especialidad || "",
      universidad: doctor?.universidad || "",
      anos_experiencia: doctor?.anos_experiencia || 0,
      bio: doctor?.bio || "",
      subespecialidades: doctor?.subespecialidades || "",
      certificaciones: doctor?.certificaciones || "",
      idiomas: doctor?.idiomas || "",
    };

    return NextResponse.json(combinedData);
  } catch (error) {
    console.error("Error in GET /api/doctor/profile:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
