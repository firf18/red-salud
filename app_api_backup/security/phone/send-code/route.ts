import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: "Número de teléfono requerido" },
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

    // Generar código de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar en la base de datos
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expira en 10 minutos

    const { error: insertError } = await supabase
      .from("phone_verifications")
      .insert({
        user_id: user.id,
        phone_number: phoneNumber,
        verification_code: verificationCode,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      return NextResponse.json(
        { success: false, message: "Error al enviar código" },
        { status: 500 }
      );
    }

    // TODO: Integrar con servicio de SMS (Twilio, AWS SNS, etc.)
    console.log(`Código de verificación para ${phoneNumber}: ${verificationCode}`);

    // Registrar evento de seguridad
    await supabase.from("security_events").insert({
      user_id: user.id,
      event_type: "phone_verification_sent",
      event_description: `Código de verificación enviado a ${phoneNumber}`,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: "Código enviado correctamente",
      // En desarrollo, devolver el código (REMOVER EN PRODUCCIÓN)
      devCode: process.env.NODE_ENV === "development" ? verificationCode : undefined,
    });
  } catch (error) {
    console.error("Error sending verification code:", error);
    return NextResponse.json(
      { success: false, message: "Error al enviar código" },
      { status: 500 }
    );
  }
}
