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

    // Obtener sesiones activas
    const { data: sessions, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("last_active_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: "Error al obtener sesiones" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
    });
  } catch (error) {
    console.error("Error getting sessions:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener sesiones" },
      { status: 500 }
    );
  }
}
