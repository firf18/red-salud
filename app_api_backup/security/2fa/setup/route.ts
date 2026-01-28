import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";

export async function POST() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "No autenticado" },
        { status: 401 }
      );
    }

    // Generar secreto para TOTP
    const secret = speakeasy.generateSecret({
      name: `Red-Salud (${user.email})`,
      issuer: "Red-Salud",
    });

    // Generar códigos de respaldo
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    // Guardar en la base de datos (sin verificar aún)
    const { error: insertError } = await supabase
      .from("two_factor_auth")
      .upsert({
        user_id: user.id,
        secret: secret.base32,
        backup_codes: backupCodes,
        enabled: false,
      });

    if (insertError) {
      return NextResponse.json(
        { success: false, message: "Error al configurar 2FA" },
        { status: 500 }
      );
    }

    // Generar QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return NextResponse.json({
      success: true,
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes,
    });
  } catch (error) {
    console.error("Error setting up 2FA:", error);
    return NextResponse.json(
      { success: false, message: "Error al configurar 2FA" },
      { status: 500 }
    );
  }
}

