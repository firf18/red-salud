import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener configuración de notificaciones
    const { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { success: false, message: "Error al obtener notificaciones" },
        { status: 500 }
      );
    }

    // Si no existe, crear con valores por defecto
    if (!data) {
      const { data: newData, error: insertError } = await supabase
        .from("notification_settings")
        .insert({
          user_id: user.id,
          login_alerts: true,
          account_changes: true,
          appointment_reminders: true,
          lab_results: true,
          doctor_messages: true,
          security_alerts: true,
          password_changes: true,
          new_device_login: true,
          suspicious_activity: true,
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { success: false, message: "Error al crear configuración" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        settings: newData,
      });
    }

    return NextResponse.json({
      success: true,
      settings: data,
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener notificaciones" },
      { status: 500 }
    );
  }
}
