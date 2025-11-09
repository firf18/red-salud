import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: true, message: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: true, message: "Error al obtener el perfil" },
        { status: 500 }
      );
    }

    // Formatear datos para el frontend
    const formattedProfile = {
      nombre: profile.nombre_completo || "",
      email: profile.email || "",
      telefono: profile.telefono || "",
      cedula: profile.cedula || "",
      fechaNacimiento: profile.fecha_nacimiento || "",
      direccion: profile.direccion || "",
      ciudad: profile.ciudad || "",
      estado: profile.estado || "",
      codigoPostal: profile.codigo_postal || "",
      cneEstado: profile.cne_estado || "",
      cneMunicipio: profile.cne_municipio || "",
      cneParroquia: profile.cne_parroquia || "",
      cneCentroElectoral: profile.cne_centro_electoral || "",
      rif: profile.rif || "",
      nacionalidad: profile.nacionalidad || "V",
      primerNombre: profile.primer_nombre || "",
      segundoNombre: profile.segundo_nombre || "",
      primerApellido: profile.primer_apellido || "",
      segundoApellido: profile.segundo_apellido || "",
      cedulaVerificada: profile.cedula_verificada || false,
      photoVerified: profile.cedula_photo_verified || false,
      diditRequestId: profile.didit_request_id || "",
      photoUploadDeadline: profile.photo_upload_deadline || null,
      cedulaVerifiedAt: profile.cedula_verified_at || null,
      cedulaPhotoVerifiedAt: profile.cedula_photo_verified_at || null,
    };

    return NextResponse.json({
      error: false,
      data: formattedProfile,
    });
  } catch (error) {
    console.error("Error in profile get:", error);
    return NextResponse.json(
      { error: true, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
