import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import * as speakeasy from "speakeasy";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Código requerido" },
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

    // Obtener configuración 2FA
    const { data: twoFactorData, error: fetchError } = await supabase
      .from("two_factor_auth")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError || !twoFactorData) {
      return NextResponse.json(
        { success: false, message: "2FA no configurado" },
        { status: 400 }
      );
    }

    // Verificar el token
    const verified = speakeasy.totp.verify({
      secret: twoFactorData.secret,
      encoding: "base32",
      token: token,
      window: 2, // Permitir 2 ventanas de tiempo (60 segundos antes/después)
    });

    if (!verified) {
      return NextResponse.json(
        { success: false, message: "Código inválido" },
        { status: 400 }
      );
    }

    // Activar 2FA
    const { error: updateError } = await supabase
      .from("two_factor_auth")
      .update({
        enabled: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, message: "Error al activar 2FA" },
        { status: 500 }
      );
    }

    // Registrar evento de seguridad
    await supabase.from("security_events").insert({
      user_id: user.id,
      event_type: "2fa_enabled",
      event_description: "Autenticación de dos factores activada",
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: "2FA activado correctamente",
    });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return NextResponse.json(
      { success: false, message: "Error al verificar código" },
      { status: 500 }
    );
  }
}
