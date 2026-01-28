import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "La nueva contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verificar que el usuario esté autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    // Verificar la contraseña actual intentando iniciar sesión
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { success: false, message: "La contraseña actual es incorrecta" },
        { status: 400 }
      );
    }

    // Actualizar la contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json(
        { success: false, message: updateError.message },
        { status: 400 }
      );
    }

    // Registrar evento de seguridad
    await supabase.from("security_events").insert({
      user_id: user.id,
      event_type: "password_changed",
      event_description: "Contraseña cambiada exitosamente",
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { success: false, message: "Error al cambiar la contraseña" },
      { status: 500 }
    );
  }
}
