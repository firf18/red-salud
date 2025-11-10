import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const settings = await request.json();

    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    // Actualizar configuración de notificaciones
    const { error: updateError } = await supabase
      .from("notification_settings")
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      return NextResponse.json(
        { success: false, message: "Error al actualizar notificaciones" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notificaciones actualizadas correctamente",
    });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { success: false, message: "Error al actualizar notificaciones" },
      { status: 500 }
    );
  }
}
