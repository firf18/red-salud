import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const WEBHOOK_SECRET_KEY =
  process.env.DIDIT_WEBHOOK_SECRET ||
  "NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck";

// Cliente de Supabase con service role para operaciones del servidor
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener headers y body raw
    const signature = request.headers.get("X-Signature");
    const timestamp = request.headers.get("X-Timestamp");
    const rawBody = await request.text();

    // 2. Validar que tenemos todos los datos necesarios
    if (!signature || !timestamp || !rawBody || !WEBHOOK_SECRET_KEY) {
      console.error("Faltan datos requeridos para validar webhook");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 3. Validar timestamp (dentro de 5 minutos)
    const currentTime = Math.floor(Date.now() / 1000);
    const incomingTime = parseInt(timestamp, 10);
    if (Math.abs(currentTime - incomingTime) > 300) {
      console.error("Timestamp obsoleto");
      return NextResponse.json(
        { message: "Request timestamp is stale." },
        { status: 401 },
      );
    }

    // 4. Generar HMAC del raw body
    const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET_KEY);
    const expectedSignature = hmac.update(rawBody).digest("hex");

    // 5. Comparar firmas de forma segura
    const expectedSignatureBuffer = Buffer.from(expectedSignature, "utf8");
    const providedSignatureBuffer = Buffer.from(signature, "utf8");

    if (
      expectedSignatureBuffer.length !== providedSignatureBuffer.length ||
      !crypto.timingSafeEqual(expectedSignatureBuffer, providedSignatureBuffer)
    ) {
      console.error("Firma inválida");
      return NextResponse.json(
        {
          message: `Invalid signature. Computed (${expectedSignature}), Provided (${signature})`,
        },
        { status: 401 },
      );
    }

    // 6. Parsear el JSON (firma válida)
    const jsonBody = JSON.parse(rawBody);
    const { session_id, status, vendor_data, webhook_type, decision } =
      jsonBody;

    console.log("🔔 Webhook recibido de Didit:", {
      session_id,
      status,
      vendor_data,
      webhook_type,
      decision: decision ? "Presente" : "No presente",
    });

    console.log(
      "📋 Datos completos del webhook:",
      JSON.stringify(jsonBody, null, 2),
    );

    // 7. Procesar según el tipo de webhook
    if (webhook_type === "status.updated") {
      // Actualizar el estado en la base de datos
      const userId = vendor_data; // El vendor_data contiene el user ID

      if (!userId) {
        console.error("No se encontró vendor_data (user ID)");
        return NextResponse.json(
          { message: "Webhook event dispatched" },
          { status: 200 },
        );
      }

      // Preparar datos para actualizar
      // Dynamic data from external webhook API - Record with unknown values
      const updateData: Record<string, unknown> = {
        didit_request_id: session_id,
        updated_at: new Date().toISOString(),
      };

      // Si el estado es Approved, marcar como verificado
      if (status === "Approved" && decision) {
        console.log("✅ Estado Approved detectado, actualizando perfil...");
        updateData.cedula_verificada = true;
        updateData.photo_verified = true;
        updateData.cedula_verified_at = new Date().toISOString();
        updateData.cedula_photo_verified_at = new Date().toISOString();

        // Extraer datos del documento si están disponibles
        if (decision.id_verification) {
          const idData = decision.id_verification;
          console.log("📄 Datos de ID extraídos:", idData);

          if (idData.document_number) {
            updateData.cedula = idData.document_number;
          }

          // Extraer nombres completos del documento
          if (idData.first_name) {
            const nombres = idData.first_name.split(" ");
            updateData.primer_nombre = nombres[0];
            if (nombres.length > 1) {
              updateData.segundo_nombre = nombres.slice(1).join(" ");
            }
          }

          if (idData.last_name) {
            const apellidos = idData.last_name.split(" ");
            updateData.primer_apellido = apellidos[0];
            if (apellidos.length > 1) {
              updateData.segundo_apellido = apellidos.slice(1).join(" ");
            }
          }

          // Nombre completo
          if (idData.first_name && idData.last_name) {
            updateData.nombre =
              `${idData.first_name} ${idData.last_name}`.trim();
          }

          if (idData.date_of_birth) {
            updateData.fecha_nacimiento = idData.date_of_birth;
          }

          if (idData.gender) {
            updateData.sexo_biologico =
              idData.gender === "F" ? "femenino" : "masculino";
          }

          if (idData.address) {
            updateData.direccion = idData.address;
          }

          if (idData.nationality) {
            updateData.nacionalidad = idData.nationality;
          }
        }
      } else if (status === "Declined") {
        console.log("❌ Estado Declined detectado");
        updateData.photo_verified = false;
        updateData.cedula_verificada = false;
      } else {
        console.log(`ℹ️ Estado: ${status}`);
      }

      // Actualizar el perfil
      console.log("💾 Actualizando perfil con datos:", updateData);

      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (updateError) {
        console.error("❌ Error al actualizar perfil:", updateError);
      } else {
        console.log("✅ Perfil actualizado exitosamente para usuario:", userId);
      }

      // Registrar actividad
      try {
        await supabaseAdmin.from("activity_logs").insert({
          user_id: userId,
          action: "didit_verification",
          details: `Verificación Didit: ${status}`,
          ip_address: request.headers.get("x-forwarded-for") || "unknown",
          user_agent: request.headers.get("user-agent") || "unknown",
          created_at: new Date().toISOString(),
        });
      } catch (logError) {
        console.error("Error al registrar actividad:", logError);
      }
    }

    return NextResponse.json({ message: "Webhook event dispatched" });
  } catch (error) {
    console.error("Error en webhook handler:", error);
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
