import { supabase } from "../client";

async function logActivity(
  userId: string,
  activityType: string,
  description: string
) {
  try {
    const { error } = await supabase.from("user_activity_log").insert({
      user_id: userId,
      activity_type: activityType,
      description,
      status: "success",
    });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export interface PatientProfile {
  id: string;
  email: string;
  nombre_completo: string;
  telefono?: string;
  cedula?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  avatar_url?: string;
  grupo_sanguineo?: string;
  alergias?: string[];
  contacto_emergencia_nombre?: string;
  contacto_emergencia_telefono?: string;
  contacto_emergencia_relacion?: string;
  enfermedades_cronicas?: string[];
  medicamentos_actuales?: string;
  cirugias_previas?: string;
}

export async function getPatientProfile(
  userId: string
): Promise<PatientProfile | null> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    const { data: medicalData, error: medicalError } = await supabase
      .from("patient_details")
      .select("*")
      .eq("profile_id", userId)
      .single();

    if (medicalError && medicalError.code === "PGRST116") {
      await supabase.from("patient_details").insert({
        profile_id: userId,
      });
    }

    return {
      ...profile,
      ...medicalData,
    };
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    return null;
  }
}

export async function updateBasicProfile(
  userId: string,
  data: Partial<PatientProfile>
) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        nombre_completo: data.nombre_completo,
        telefono: data.telefono,
        cedula: data.cedula,
        fecha_nacimiento: data.fecha_nacimiento,
        direccion: data.direccion,
        ciudad: data.ciudad,
        estado: data.estado,
        codigo_postal: data.codigo_postal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) throw error;

    await logActivity(userId, "profile_update", "Perfil actualizado");

    return { success: true };
  } catch (error) {
    console.error("Error updating basic profile:", error);
    return { success: false, error };
  }
}

export async function updateMedicalInfo(
  userId: string,
  data: Partial<PatientProfile>
) {
  try {
    const { error } = await supabase
      .from("patient_details")
      .upsert({
        profile_id: userId,
        grupo_sanguineo: data.grupo_sanguineo,
        alergias: data.alergias,
        contacto_emergencia_nombre: data.contacto_emergencia_nombre,
        contacto_emergencia_telefono: data.contacto_emergencia_telefono,
        contacto_emergencia_relacion: data.contacto_emergencia_relacion,
        enfermedades_cronicas: data.enfermedades_cronicas,
        medicamentos_actuales: data.medicamentos_actuales,
        cirugias_previas: data.cirugias_previas,
        updated_at: new Date().toISOString(),
      })
      .eq("profile_id", userId);

    if (error) throw error;

    await logActivity(
      userId,
      "medical_info_update",
      "Información médica actualizada"
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating medical info:", error);
    return { success: false, error };
  }
}
