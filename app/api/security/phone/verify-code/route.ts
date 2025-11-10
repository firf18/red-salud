import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { success: false, message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    // Buscar verificación pendiente
    const { data: verification, error: fetchError } = await supabase
      .from("phone_verifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("phone_number", phoneNumber)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !verification) {
      return NextResponse.json(
        { success: false, message: "No se encontró solicitud de verificación" },
        { status: 400 }
      );
    }

    // Verificar si expiró
    if (new Date(verification.expires_at) < new Date()) {
      return NextResponse.json(
        { success: false, message: "El código ha expirado" },
        { status: 400 }
      );
    }

    // Verificar intentos
    if (verification.attempts >= 3) {
      return NextResponse.json(
        { success: false, message: "Demasiados intentos. Solicita un nuevo código" },
        { status: 400 }
      );
    }

    // Verificar código
    if (verification.verification_code !== code) {
      // Incrementar intentos
      await supabase
        .from("phone_verifications")
        .update({ attempts: verification.attempts + 1 })
        .eq("id", verification.id);

      return NextResponse.json(
        { success: false, message: "Código incorrecto" },
        { status: 400 }
      );
    }

    // Marcar como verificado
    const { error: updateError } = await supabase
      .from("phone_verifications")
      .update({
        verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq("id", verification.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: "Error al verificar teléfono" },
        { status: 500 }
      );
    }

    // Actualizar teléfono en el perfil
    await supabase
      .from("profiles")
      .update({ telefono: phoneNumber })
      .eq("id", user.id);

    // Registrar evento de seguridad
    await supabase.from("security_events").insert({
      user_id: user.id,
      event_type: "phone_verified",
      event_description: `Teléfono ${phoneNumber} verificado exitosamente`,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: "Teléfono verificado correctamente",
    });
  } catch (error) {
    console.error("Error verifying phone:", error);
    return NextResponse.json(
      { success: false, message: "Error al verificar teléfono" },
      { status: 500 }
    );
  }
}
