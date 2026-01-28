import { NextRequest, NextResponse } from "next/server";

const DIDIT_API_URL = "https://verification.didit.me/v2/id-verification/";
const DIDIT_API_KEY =
  process.env.DIDIT_API_KEY || "KHVEmC8VlOdXqZNTBf1hvvfvLs_0VRlPhwEKtNitVHs";

interface DiditIDVerificationResponse {
  request_id: string;
  id_verification: {
    status: "Approved" | "Rejected" | "Pending";
    document_type: string;
    issuing_country: string;
    document_number: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    expiration_date: string;
    nationality: string;
    sex: string;
    extracted_data: {
      document_number: string;
      first_name: string;
      last_name: string;
      date_of_birth: string;
      nationality: string;
    };
    validations: {
      document_authenticity: string;
      data_consistency: string;
      expiration_date: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const frontImage = formData.get("front_image") as File;
    const backImage = formData.get("back_image") as File | null;
    const expectedCedula = formData.get("expected_cedula") as string;
    const expectedNombre = formData.get("expected_nombre") as string;

    if (!frontImage) {
      return NextResponse.json(
        { error: true, message: "Se requiere la imagen frontal de la cédula" },
        { status: 400 },
      );
    }

    // Preparar FormData para Didit
    const diditFormData = new FormData();
    diditFormData.append("front_image", frontImage);
    if (backImage) {
      diditFormData.append("back_image", backImage);
    }
    diditFormData.append("issuing_country", "VEN"); // Venezuela
    diditFormData.append("save_api_request", "true");

    // Llamar a la API de Didit
    const response = await fetch(DIDIT_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": DIDIT_API_KEY,
        accept: "application/json",
      },
      body: diditFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Didit API error:", errorText);
      return NextResponse.json(
        { error: true, message: "Error al verificar la cédula con Didit" },
        { status: response.status },
      );
    }

    const data: DiditIDVerificationResponse = await response.json();

    // Verificar que la verificación fue aprobada
    if (data.id_verification.status !== "Approved") {
      return NextResponse.json(
        {
          error: true,
          message:
            "La cédula no pudo ser verificada. Por favor intente con una imagen más clara.",
          status: data.id_verification.status,
        },
        { status: 400 },
      );
    }

    // Extraer datos de la cédula
    const extractedData = {
      documentNumber: data.id_verification.document_number,
      firstName: data.id_verification.first_name,
      lastName: data.id_verification.last_name,
      fullName:
        `${data.id_verification.first_name} ${data.id_verification.last_name}`.trim(),
      dateOfBirth: data.id_verification.date_of_birth,
      nationality: data.id_verification.nationality,
      sex: data.id_verification.sex,
      expirationDate: data.id_verification.expiration_date,
      documentType: data.id_verification.document_type,
    };

    // Comparar con los datos esperados si se proporcionaron
    interface ValidationResult {
      documentMatch: boolean;
      nameMatch: boolean;
      warnings: string[];
    }
    const validations: ValidationResult = {
      documentMatch: true,
      nameMatch: true,
      warnings: [],
    };

    if (expectedCedula) {
      // Limpiar y comparar números de cédula
      const cleanExpected = expectedCedula.replace(/\D/g, "");
      const cleanExtracted = extractedData.documentNumber.replace(/\D/g, "");

      validations.documentMatch = cleanExpected === cleanExtracted;

      if (!validations.documentMatch) {
        validations.warnings.push(
          `La cédula de la foto (${extractedData.documentNumber}) no coincide con la ingresada (${expectedCedula})`,
        );
      }
    }

    if (expectedNombre) {
      // Comparación simple de nombres (normalizada)
      const normalizeString = (str: string) =>
        str.toLowerCase().replace(/\s+/g, " ").trim();

      const expectedNormalized = normalizeString(expectedNombre);
      const extractedNormalized = normalizeString(extractedData.fullName);

      validations.nameMatch =
        extractedNormalized.includes(expectedNormalized) ||
        expectedNormalized.includes(extractedNormalized);

      if (!validations.nameMatch) {
        validations.warnings.push(
          `El nombre de la foto (${extractedData.fullName}) no coincide con el esperado (${expectedNombre})`,
        );
      }
    }

    // Determinar si la verificación es exitosa
    const isVerified =
      data.id_verification.status === "Approved" &&
      validations.documentMatch &&
      validations.nameMatch;

    return NextResponse.json({
      error: false,
      verified: isVerified,
      requestId: data.request_id,
      extractedData,
      validations,
      diditStatus: data.id_verification.status,
      message: isVerified
        ? "Cédula verificada exitosamente"
        : "La cédula fue procesada pero hay discrepancias en los datos",
    });
  } catch (error) {
    console.error("Error verifying cedula photo:", error);
    return NextResponse.json(
      { error: true, message: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
