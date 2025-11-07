import { supabase } from "../client";
import type {
  MedicationCatalog,
  Prescription,
  PrescriptionMedication,
  MedicationReminder,
  MedicationIntakeLog,
  CreatePrescriptionData,
  CreateReminderData,
  AdherenceStats,
  ActiveMedicationsSummary,
} from "../types/medications";

// ============ CATÁLOGO DE MEDICAMENTOS ============

// Buscar medicamentos en el catálogo
export async function searchMedicationsCatalog(searchTerm: string) {
  try {
    const { data, error } = await supabase
      .from("medications_catalog")
      .select("*")
      .eq("activo", true)
      .or(
        `nombre_comercial.ilike.%${searchTerm}%,nombre_generico.ilike.%${searchTerm}%,principio_activo.ilike.%${searchTerm}%`
      )
      .order("nombre_comercial")
      .limit(20);

    if (error) throw error;
    return { success: true, data: data as MedicationCatalog[] };
  } catch (error) {
    console.error("Error searching medications:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener medicamento por ID
export async function getMedicationById(medicationId: string) {
  try {
    const { data, error } = await supabase
      .from("medications_catalog")
      .select("*")
      .eq("id", medicationId)
      .single();

    if (error) throw error;
    return { success: true, data: data as MedicationCatalog };
  } catch (error) {
    console.error("Error fetching medication:", error);
    return { success: false, error, data: null };
  }
}

// ============ PRESCRIPCIONES ============

// Obtener prescripciones del paciente
export async function getPatientPrescriptions(patientId: string) {
  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        *,
        medico:profiles!prescriptions_medico_id_fkey(
          id,
          nombre_completo,
          especialidad
        ),
        medications:prescription_medications(
          *,
          medication:medications_catalog(*)
        )
      `)
      .eq("paciente_id", patientId)
      .order("fecha_prescripcion", { ascending: false });

    if (error) throw error;
    return { success: true, data: data as Prescription[] };
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener prescripción específica
export async function getPrescription(prescriptionId: string) {
  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        *,
        medico:profiles!prescriptions_medico_id_fkey(
          id,
          nombre_completo,
          especialidad,
          avatar_url
        ),
        medications:prescription_medications(
          *,
          medication:medications_catalog(*)
        )
      `)
      .eq("id", prescriptionId)
      .single();

    if (error) throw error;
    return { success: true, data: data as Prescription };
  } catch (error) {
    console.error("Error fetching prescription:", error);
    return { success: false, error, data: null };
  }
}

// Crear prescripción (para doctores)
export async function createPrescription(prescriptionData: CreatePrescriptionData) {
  try {
    // Crear la prescripción
    const { data: prescription, error: prescriptionError } = await supabase
      .from("prescriptions")
      .insert({
        paciente_id: prescriptionData.paciente_id,
        medico_id: prescriptionData.medico_id,
        medical_record_id: prescriptionData.medical_record_id,
        appointment_id: prescriptionData.appointment_id,
        fecha_prescripcion: prescriptionData.fecha_prescripcion || new Date().toISOString().split('T')[0],
        fecha_vencimiento: prescriptionData.fecha_vencimiento,
        diagnostico: prescriptionData.diagnostico,
        instrucciones_generales: prescriptionData.instrucciones_generales,
      })
      .select()
      .single();

    if (prescriptionError) throw prescriptionError;

    // Agregar medicamentos
    const medicationsToInsert = prescriptionData.medications.map((med) => ({
      prescription_id: prescription.id,
      medication_id: med.medication_id,
      nombre_medicamento: med.nombre_medicamento,
      dosis: med.dosis,
      frecuencia: med.frecuencia,
      via_administracion: med.via_administracion,
      duracion_dias: med.duracion_dias,
      cantidad_total: med.cantidad_total,
      instrucciones_especiales: med.instrucciones_especiales,
    }));

    const { error: medicationsError } = await supabase
      .from("prescription_medications")
      .insert(medicationsToInsert);

    if (medicationsError) throw medicationsError;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: prescriptionData.medico_id,
      activity_type: "prescription_created",
      description: `Prescripción creada para paciente ${prescriptionData.paciente_id}`,
      status: "success",
    });

    return { success: true, data: prescription as Prescription };
  } catch (error) {
    console.error("Error creating prescription:", error);
    return { success: false, error, data: null };
  }
}

// Marcar prescripción como surtida
export async function markPrescriptionAsFilled(prescriptionId: string, pharmacyId?: string) {
  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .update({
        status: "surtida",
        fecha_surtida: new Date().toISOString(),
        farmacia_id: pharmacyId,
      })
      .eq("id", prescriptionId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as Prescription };
  } catch (error) {
    console.error("Error marking prescription as filled:", error);
    return { success: false, error, data: null };
  }
}

// ============ RECORDATORIOS ============

// Obtener recordatorios activos del paciente
export async function getPatientReminders(patientId: string) {
  try {
    const { data, error } = await supabase
      .from("medication_reminders")
      .select("*")
      .eq("paciente_id", patientId)
      .eq("activo", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data as MedicationReminder[] };
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return { success: false, error, data: [] };
  }
}

// Crear recordatorio
export async function createReminder(reminderData: CreateReminderData) {
  try {
    const { data, error } = await supabase
      .from("medication_reminders")
      .insert({
        paciente_id: reminderData.paciente_id,
        prescription_medication_id: reminderData.prescription_medication_id,
        nombre_medicamento: reminderData.nombre_medicamento,
        dosis: reminderData.dosis,
        horarios: reminderData.horarios,
        dias_semana: reminderData.dias_semana,
        fecha_inicio: reminderData.fecha_inicio,
        fecha_fin: reminderData.fecha_fin,
        notificar_email: reminderData.notificar_email || false,
        notificar_push: reminderData.notificar_push !== false,
        notas: reminderData.notas,
      })
      .select()
      .single();

    if (error) throw error;

    // Crear registros de tomas programadas para los próximos 7 días
    await generateIntakeSchedule(data.id, reminderData);

    return { success: true, data: data as MedicationReminder };
  } catch (error) {
    console.error("Error creating reminder:", error);
    return { success: false, error, data: null };
  }
}

// Generar horario de tomas
async function generateIntakeSchedule(reminderId: string, reminderData: CreateReminderData) {
  const intakeLogs = [];
  const startDate = new Date(reminderData.fecha_inicio);
  const endDate = reminderData.fecha_fin ? new Date(reminderData.fecha_fin) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    
    // Si hay días específicos, verificar si este día aplica
    if (reminderData.dias_semana && !reminderData.dias_semana.includes(dayOfWeek)) {
      continue;
    }

    // Crear entrada para cada horario del día
    for (const time of reminderData.horarios) {
      const [hours, minutes] = time.split(':');
      const scheduledDate = new Date(date);
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      intakeLogs.push({
        reminder_id: reminderId,
        paciente_id: reminderData.paciente_id,
        fecha_programada: scheduledDate.toISOString(),
        status: 'pendiente',
      });
    }
  }

  if (intakeLogs.length > 0) {
    await supabase.from("medication_intake_log").insert(intakeLogs);
  }
}

// Actualizar recordatorio
export async function updateReminder(reminderId: string, updates: Partial<MedicationReminder>) {
  try {
    const { data, error } = await supabase
      .from("medication_reminders")
      .update(updates)
      .eq("id", reminderId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as MedicationReminder };
  } catch (error) {
    console.error("Error updating reminder:", error);
    return { success: false, error, data: null };
  }
}

// Desactivar recordatorio
export async function deactivateReminder(reminderId: string) {
  return updateReminder(reminderId, { activo: false });
}

// ============ REGISTRO DE TOMAS ============

// Obtener registro de tomas del día
export async function getTodayIntakeLog(patientId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data, error } = await supabase
      .from("medication_intake_log")
      .select(`
        *,
        reminder:medication_reminders(*)
      `)
      .eq("paciente_id", patientId)
      .gte("fecha_programada", today.toISOString())
      .lt("fecha_programada", tomorrow.toISOString())
      .order("fecha_programada");

    if (error) throw error;
    return { success: true, data: data as MedicationIntakeLog[] };
  } catch (error) {
    console.error("Error fetching today intake log:", error);
    return { success: false, error, data: [] };
  }
}

// Registrar toma de medicamento
export async function recordMedicationIntake(intakeId: string, status: 'tomado' | 'omitido', notes?: string) {
  try {
    const { data, error } = await supabase
      .from("medication_intake_log")
      .update({
        status,
        fecha_tomada: status === 'tomado' ? new Date().toISOString() : null,
        notas: notes,
      })
      .eq("id", intakeId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as MedicationIntakeLog };
  } catch (error) {
    console.error("Error recording intake:", error);
    return { success: false, error, data: null };
  }
}

// Obtener estadísticas de adherencia
export async function getAdherenceStats(patientId: string, days: number = 30): Promise<{ success: boolean; data: AdherenceStats | null; error?: any }> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from("medication_intake_log")
      .select("status, fecha_programada, fecha_tomada")
      .eq("paciente_id", patientId)
      .gte("fecha_programada", startDate.toISOString())
      .lte("fecha_programada", new Date().toISOString());

    if (error) throw error;

    const total = data.length;
    const tomadas = data.filter(log => log.status === 'tomado').length;
    const omitidas = data.filter(log => log.status === 'omitido').length;
    const retrasadas = data.filter(log => log.status === 'retrasado').length;

    // Calcular racha actual
    let rachaActual = 0;
    let mejorRacha = 0;
    let rachaTemp = 0;

    const sortedData = [...data].sort((a, b) => 
      new Date(a.fecha_programada).getTime() - new Date(b.fecha_programada).getTime()
    );

    for (const log of sortedData) {
      if (log.status === 'tomado') {
        rachaTemp++;
        if (rachaTemp > mejorRacha) mejorRacha = rachaTemp;
      } else {
        rachaTemp = 0;
      }
    }
    rachaActual = rachaTemp;

    const stats: AdherenceStats = {
      total_tomas_programadas: total,
      tomas_completadas: tomadas,
      tomas_omitidas: omitidas,
      tomas_retrasadas: retrasadas,
      porcentaje_adherencia: total > 0 ? Math.round((tomadas / total) * 100) : 0,
      racha_actual: rachaActual,
      mejor_racha: mejorRacha,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error("Error calculating adherence stats:", error);
    return { success: false, error, data: null };
  }
}

// Obtener resumen de medicamentos activos
export async function getActiveMedicationsSummary(patientId: string): Promise<{ success: boolean; data: ActiveMedicationsSummary | null; error?: any }> {
  try {
    const { data: reminders, error } = await supabase
      .from("medication_reminders")
      .select("*")
      .eq("paciente_id", patientId)
      .eq("activo", true);

    if (error) throw error;

    const now = new Date();
    let proximaToma: any = null;
    let minMinutos = Infinity;

    const medicamentosActivos = reminders.map((reminder: any) => {
      // Encontrar próxima toma
      const horarios = reminder.horarios as string[];
      for (const hora of horarios) {
        const [hours, minutes] = hora.split(':');
        const horaDate = new Date();
        horaDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (horaDate > now) {
          const minutosRestantes = Math.floor((horaDate.getTime() - now.getTime()) / 60000);
          if (minutosRestantes < minMinutos) {
            minMinutos = minutosRestantes;
            proximaToma = {
              medicamento: reminder.nombre_medicamento,
              hora: hora,
              minutos_restantes: minutosRestantes,
            };
          }
        }
      }

      return {
        nombre: reminder.nombre_medicamento,
        dosis: reminder.dosis,
        frecuencia: `${horarios.length} veces al día`,
        proxima_toma: horarios[0],
      };
    });

    const summary: ActiveMedicationsSummary = {
      total_medicamentos: reminders.length,
      total_recordatorios: reminders.reduce((sum: number, r: any) => sum + r.horarios.length, 0),
      proxima_toma: proximaToma,
      medicamentos_activos: medicamentosActivos,
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error("Error fetching active medications summary:", error);
    return { success: false, error, data: null };
  }
}
