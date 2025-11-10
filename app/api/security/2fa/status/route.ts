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

    // Verificar si tiene 2FA configurado
    const { data: twoFactorData, error } = await supabase
      .from("two_factor_auth")
      .select("enabled, verified_at")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { success: false, message: "Error al verificar 2FA" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      enabled: twoFactorData?.enabled || false,
      verified: !!twoFactorData?.verified_at,
    });
  } catch (error) {
    console.error("Error checking 2FA status:", error);
    return NextResponse.json(
      { success: false, message: "Error al verificar 2FA" },
      { status: 500 }
    );
  }
}
