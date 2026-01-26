import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CEDULA_API_URL = "https://api.cedula.com.ve/api/v1";
const APP_ID = "1461";
const ACCESS_TOKEN = "96bc48c83b180e4529fe91c6700e98d3";

interface CedulaAPIResponse {
  error: boolean;
  error_str: boolean | string;
  data?: {
    nacionalidad: string;
    cedula: number;
    rif: string;
    primer_apellido: string;
    segundo_apellido: string;
    primer_nombre: string;
    segundo_nombre: string;
    cne: {
      estado: string;
      municipio: string;
      parroquia: string;
      centro_electoral: string;
    };
    request_date: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: true, message: "No autenticado" },
        { status: 401 }
      );
    }

    const { nacionalidad, cedula } = await request.json();

    if (!nacionalidad || !cedula) {
      return NextResponse.json(
        { error: true, message: "Nacionalidad y cédula son requeridos" },
        { status: 400 }
      );
    }

    // Limpiar la cédula (solo dígitos)
    const cedulaLimpia = cedula.toString().replace(/\D/g, "");

    if (!cedulaLimpia) {
      return NextResponse.json(
        { error: true, message: "Cédula inválida" },
        { status: 400 }
      );
    }

    // Verificar si la cédula ya está registrada en otra cuenta
    const cedulaFormateada = `${nacionalidad}-${cedulaLimpia}`;
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, nombre_completo, email")
      .eq("cedula", cedulaFormateada)
      .single();

    if (existingProfile && existingProfile.id !== user.id) {
      return NextResponse.json(
        {
          error: true,
          message: "Esta cédula ya está registrada en otra cuenta. Si crees que esto es un error, contacta a soporte.",
          code: "CEDULA_DUPLICADA",
        },
        { status: 409 }
      );
    }

    // Consultar la API de cedula.com.ve
    const url = `${CEDULA_API_URL}?app_id=${APP_ID}&token=${ACCESS_TOKEN}&nacionalidad=${nacionalidad}&cedula=${cedulaLimpia}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: true, message: "Error al consultar la API de cédula" },
        { status: response.status }
      );
    }

    const data: CedulaAPIResponse = await response.json();

    if (data.error) {
      return NextResponse.json(
        {
          error: true,
          message: typeof data.error_str === "string" ? data.error_str : "Cédula no encontrada",
        },
        { status: 404 }
      );
    }

    if (!data.data) {
      return NextResponse.json(
        { error: true, message: "No se encontraron datos para esta cédula" },
        { status: 404 }
      );
    }

    // Verificar si tiene datos CNE (opcional, solo para información adicional)
    const hasCneData = data.data.cne && data.data.cne.estado;

    // Formatear los datos para el frontend
    const formattedData = {
      nacionalidad: data.data.nacionalidad,
      cedula: data.data.cedula,
      rif: data.data.rif || "",
      nombreCompleto: `${data.data.primer_nombre} ${data.data.segundo_nombre || ""} ${data.data.primer_apellido} ${data.data.segundo_apellido || ""}`.trim(),
      primerNombre: data.data.primer_nombre,
      segundoNombre: data.data.segundo_nombre || "",
      primerApellido: data.data.primer_apellido,
      segundoApellido: data.data.segundo_apellido || "",
      cne: hasCneData ? {
        estado: data.data.cne.estado,
        municipio: data.data.cne.municipio,
        parroquia: data.data.cne.parroquia,
        centroElectoral: data.data.cne.centro_electoral || "",
      } : null,
      fechaConsulta: data.data.request_date,
    };

    console.log("✅ Cédula validada exitosamente:", {
      cedula: formattedData.cedula,
      nombre: formattedData.nombreCompleto,
      tieneDatosCNE: hasCneData,
    });

    return NextResponse.json({
      error: false,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error validating cedula:", error);
    return NextResponse.json(
      { error: true, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

