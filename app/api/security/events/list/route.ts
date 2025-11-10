import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    // Obtener eventos de seguridad
    const { data: events, error, count } = await supabase
      .from("security_events")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { success: false, message: "Error al obtener eventos" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      events: events || [],
      total: count || 0,
    });
  } catch (error) {
    console.error("Error getting security events:", error);
    return NextResponse.json(
      { success: false, message: "Error al obtener eventos" },
      { status: 500 }
    );
  }
}
