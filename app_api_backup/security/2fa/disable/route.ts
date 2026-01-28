import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Contraseña requerida" },
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

    // Verificar contraseña
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password,
    });

    if (signInError) {
      return NextResponse.json(
        { success: false, message: "Contraseña incorrecta" },
        { status: 400 }
      );
    }

    // Desactivar 2FA
    const { error: deleteError } = await supabase
      .from("two_factor_auth")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json(
        { success: false, message: "Error al desactivar 2FA" },
        { status: 500 }
      );
    }

    // Registrar evento de seguridad
    await supabase.from("security_events").insert({
      user_id: user.id,
      event_type: "2fa_disabled",
      event_description: "Autenticación de dos factores desactivada",
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: "2FA desactivado correctamente",
    });
  } catch (error) {
    console.error("Error disabling 2FA:", error);
    return NextResponse.json(
      { success: false, message: "Error al desactivar 2FA" },
      { status: 500 }
    );
  }
}
