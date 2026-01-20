import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/profile?userId=xxx
 * Obtiene el perfil completo del usuario incluyendo:
 * - Datos básicos (profiles)
 * - Información médica (patient_details)
 */
export async function GET(request: NextRequest) {
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
        { status: 401 },
      );
    }

    // Obtener userId del query param
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Verificar que el usuario solo pueda ver su propio perfil
    if (!userId || userId !== user.id) {
      return NextResponse.json(
        { error: true, message: "No autorizado" },
        { status: 403 },
      );
    }

    // Obtener datos del perfil principal
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: true, message: "Error al obtener el perfil" },
        { status: 500 },
      );
    }

    // Obtener datos médicos del paciente
    // Dynamic data from patient_details table - Record with unknown values
    let medicalData: Record<string, unknown> = {};
    const { data: patientDetails, error: medicalError } = await supabase
      .from("patient_details")
      .select("*")
      .eq("profile_id", userId)
      .single();

    if (medicalError && medicalError.code !== "PGRST116") {
      console.error("Error fetching medical data:", medicalError);
    } else if (patientDetails) {
      medicalData = patientDetails;
    }

    // Formatear datos para el frontend
    const formattedProfile = {
      // Datos básicos
      nombre: profile.nombre_completo || "",
      email: profile.email || "",
      telefono: profile.telefono || "",
      cedula: profile.cedula || "",
      fechaNacimiento: profile.fecha_nacimiento || "",
      direccion: profile.direccion || "",
      ciudad: profile.ciudad || "",
      estado: profile.estado || "",
      codigoPostal: profile.codigo_postal || "",

      // Campos CNE
      cneEstado: profile.cne_estado || "",
      cneMunicipio: profile.cne_municipio || "",
      cneParroquia: profile.cne_parroquia || "",
      cneCentroElectoral: profile.cne_centro_electoral || "",
      rif: profile.rif || "",
      nacionalidad: profile.nacionalidad || "V",
      primerNombre: profile.primer_nombre || "",
      segundoNombre: profile.segundo_nombre || "",
      primerApellido: profile.primer_apellido || "",
      segundoApellido: profile.segundo_apellido || "",

      // Verificación
      cedulaVerificada: profile.cedula_verificada || false,
      photoVerified: profile.cedula_photo_verified || false,
      diditRequestId: profile.didit_request_id || "",
      photoUploadDeadline: profile.photo_upload_deadline || null,
      cedulaVerifiedAt: profile.cedula_verified_at || null,
      cedulaPhotoVerifiedAt: profile.cedula_photo_verified_at || null,

      // Información médica básica
      tipoSangre: medicalData.grupo_sanguineo || "",
      alergias: Array.isArray(medicalData.alergias)
        ? medicalData.alergias.join(", ")
        : medicalData.alergias || "",
      condicionesCronicas: Array.isArray(medicalData.enfermedades_cronicas)
        ? medicalData.enfermedades_cronicas.join(", ")
        : medicalData.enfermedades_cronicas || "",
      medicamentosActuales: medicalData.medicamentos_actuales || "",
      cirugiasPrevias: medicalData.cirugias_previas || "",
      contactoEmergencia: medicalData.contacto_emergencia_nombre || "",
      telefonoEmergencia: medicalData.contacto_emergencia_telefono || "",
      relacionEmergencia: medicalData.contacto_emergencia_relacion || "",
      peso: medicalData.peso_kg || "",
      altura: medicalData.altura_cm || "",

      // Campos médicos expandidos
      sexoBiologico: medicalData.sexo_biologico || "",
      perimetroCintura: medicalData.perimetro_cintura_cm || "",
      presionSistolica: medicalData.presion_arterial_sistolica || "",
      presionDiastolica: medicalData.presion_arterial_diastolica || "",
      frecuenciaCardiaca: medicalData.frecuencia_cardiaca || "",

      // Campos específicos para mujeres
      embarazada: medicalData.embarazada || false,
      lactancia: medicalData.lactancia || false,
      fechaUltimaMenstruacion: medicalData.fecha_ultima_menstruacion || "",
      usaAnticonceptivos: medicalData.usa_anticonceptivos || false,
      tipoAnticonceptivo: medicalData.tipo_anticonceptivo || "",
      embarazosPrevios: medicalData.embarazos_previos || "",

      // Alergias expandidas
      alergiasAlimentarias: medicalData.alergias_alimentarias || "",
      otrasAlergias: medicalData.otras_alergias || "",

      // Condiciones
      condicionesMentales: medicalData.condiciones_mentales || "",
      discapacidades: medicalData.discapacidades || "",

      // Medicamentos y tratamientos
      suplementos: medicalData.suplementos || "",
      tratamientosActuales: medicalData.tratamientos_actuales || "",

      // Hábitos
      fuma: medicalData.fuma || "no",
      cigarrillosPorDia: medicalData.cigarrillos_por_dia || "",
      exFumadorDesde: medicalData.ex_fumador_desde || "",
      consumeAlcohol: medicalData.consume_alcohol || "no",
      frecuenciaAlcohol: medicalData.frecuencia_alcohol || "",
      actividadFisica: medicalData.actividad_fisica || "sedentario",
      horasEjercicioSemanal: medicalData.horas_ejercicio_semanal || "",
      horasSuenoPromedio: medicalData.horas_sueno_promedio || "",

      // Otros
      dispositivosMedicos: medicalData.dispositivos_medicos || "",
      donanteOrganos: medicalData.donante_organos || "no_especificado",
      observacionesAdicionales: medicalData.observaciones_adicionales || "",
    };

    return NextResponse.json(formattedProfile);
  } catch (error) {
    console.error("Error in profile GET:", error);
    return NextResponse.json(
      { error: true, message: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
