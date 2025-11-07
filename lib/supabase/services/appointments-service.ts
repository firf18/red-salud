import { supabase } from "../client";
import type {
  Appointment,
  DoctorProfile,
  MedicalSpecialty,
  CreateAppointmentData,
  TimeSlot,
  DoctorSchedule,
} from "../types/appointments";

// Obtener todas las especialidades
export async function getMedicalSpecialties() {
  try {
    const { data, error } = await supabase
      .from("specialties")
      .select("*")
      .eq("active", true)
      .order("name");

    if (error) throw error;
    return { success: true, data: data as MedicalSpecialty[] };
  } catch (error) {
    console.error("Error fetching specialties:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener doctores disponibles (con filtros opcionales)
export async function getAvailableDoctors(specialtyId?: string) {
  try {
    let query = supabase
      .from("doctor_details")
      .select(`
        *,
        specialty:specialties!doctor_details_especialidad_id_fkey(id, name, description),
        profile:profiles!doctor_details_profile_id_fkey(id, nombre_completo, email, avatar_url, role)
      `)
      .eq("verified", true);

    if (specialtyId) {
      query = query.eq("especialidad_id", specialtyId);
    }

    const { data, error } = await query.order("created_at");

    if (error) throw error;

    // Transformar datos para incluir información del perfil
    const doctors = data?.map((doc: any) => ({
      id: doc.profile_id,
      specialty_id: doc.especialidad_id,
      license_number: doc.licencia_medica,
      years_experience: doc.anos_experiencia,
      bio: doc.biografia,
      consultation_price: doc.tarifa_consulta ? parseFloat(doc.tarifa_consulta) : undefined,
      consultation_duration: 30, // Por defecto 30 minutos
      is_available: doc.verified,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      nombre_completo: doc.profile?.nombre_completo,
      email: doc.profile?.email,
      avatar_url: doc.profile?.avatar_url,
      specialty: doc.specialty,
    })) || [];

    return { success: true, data: doctors as DoctorProfile[] };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener perfil de un doctor específico
export async function getDoctorProfile(doctorId: string) {
  try {
    const { data, error } = await supabase
      .from("doctor_details")
      .select(`
        *,
        specialty:specialties!doctor_details_especialidad_id_fkey(id, name, description),
        profile:profiles!doctor_details_profile_id_fkey(id, nombre_completo, email, avatar_url)
      `)
      .eq("profile_id", doctorId)
      .single();

    if (error) throw error;

    const doctor = {
      id: data.profile_id,
      specialty_id: data.especialidad_id,
      license_number: data.licencia_medica,
      years_experience: data.anos_experiencia,
      bio: data.biografia,
      consultation_price: data.tarifa_consulta ? parseFloat(data.tarifa_consulta) : undefined,
      consultation_duration: 30,
      is_available: data.verified,
      created_at: data.created_at,
      updated_at: data.updated_at,
      nombre_completo: data.profile?.nombre_completo,
      email: data.profile?.email,
      avatar_url: data.profile?.avatar_url,
      specialty: data.specialty,
    };

    return { success: true, data: doctor as DoctorProfile };
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return { success: false, error, data: null };
  }
}

// Obtener horarios de un doctor (desde doctor_details.horario_atencion)
export async function getDoctorSchedules(doctorId: string) {
  try {
    const { data, error} = await supabase
      .from("doctor_details")
      .select("horario_atencion")
      .eq("profile_id", doctorId)
      .single();

    if (error) throw error;
    
    // Convertir horario_atencion JSON a formato DoctorSchedule
    const schedules: DoctorSchedule[] = [];
    const horario = data?.horario_atencion as any;
    
    if (horario) {
      const dayMap: Record<string, number> = {
        'domingo': 0,
        'lunes': 1,
        'martes': 2,
        'miercoles': 3,
        'jueves': 4,
        'viernes': 5,
        'sabado': 6
      };
      
      Object.entries(horario).forEach(([day, time]) => {
        if (typeof time === 'string' && time.includes('-')) {
          const [start, end] = time.split('-');
          schedules.push({
            id: `${doctorId}-${day}`,
            doctor_id: doctorId,
            day_of_week: dayMap[day.toLowerCase()] || 0,
            start_time: start + ':00',
            end_time: end + ':00',
            is_active: true,
            created_at: new Date().toISOString()
          });
        }
      });
    }
    
    return { success: true, data: schedules };
  } catch (error) {
    console.error("Error fetching doctor schedules:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener slots disponibles para un doctor en una fecha específica
export async function getAvailableTimeSlots(
  doctorId: string,
  date: string
): Promise<{ success: boolean; data: TimeSlot[]; error?: any }> {
  try {
    // Obtener el día de la semana (0-6)
    const dayOfWeek = new Date(date).getDay();

    // Obtener horarios del doctor para ese día
    const { data: schedules, error: scheduleError } = await supabase
      .from("doctor_schedules")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("day_of_week", dayOfWeek)
      .eq("is_active", true);

    if (scheduleError) throw scheduleError;

    if (!schedules || schedules.length === 0) {
      return { success: true, data: [] };
    }

    // Obtener citas existentes para ese día
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("appointment_time, duration, id")
      .eq("doctor_id", doctorId)
      .eq("appointment_date", date)
      .in("status", ["pending", "confirmed"]);

    if (appointmentsError) throw appointmentsError;

    // Generar slots de tiempo
    const timeSlots: TimeSlot[] = [];
    const bookedTimes = new Set(
      appointments?.map((apt) => apt.appointment_time) || []
    );

    schedules.forEach((schedule) => {
      const startTime = schedule.start_time;
      const endTime = schedule.end_time;
      const duration = 30; // minutos por slot

      let currentTime = startTime;
      while (currentTime < endTime) {
        const isBooked = bookedTimes.has(currentTime);
        timeSlots.push({
          time: currentTime,
          available: !isBooked,
          appointment_id: isBooked
            ? appointments?.find((apt) => apt.appointment_time === currentTime)?.id
            : undefined,
        });

        // Incrementar tiempo
        const [hours, minutes] = currentTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        currentTime = `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}:00`;
      }
    });

    return { success: true, data: timeSlots };
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return { success: false, error, data: [] };
  }
}

// Crear una cita
export async function createAppointment(
  patientId: string,
  appointmentData: CreateAppointmentData
) {
  try {
    // Obtener precio del doctor
    const { data: doctor } = await getDoctorProfile(appointmentData.doctor_id);

    // Combinar fecha y hora para la tabla existente
    const fechaHora = `${appointmentData.appointment_date}T${appointmentData.appointment_time}`;

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        paciente_id: patientId,
        medico_id: appointmentData.doctor_id,
        fecha_hora: fechaHora,
        duracion_minutos: doctor?.consultation_duration || 30,
        motivo: appointmentData.reason || '',
        status: "pendiente",
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: patientId,
      activity_type: "appointment_created",
      description: `Cita creada con doctor para ${appointmentData.appointment_date}`,
      status: "success",
    });

    // Transformar respuesta al formato esperado
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.paciente_id,
      doctor_id: data.medico_id,
      appointment_date: appointmentData.appointment_date,
      appointment_time: appointmentData.appointment_time,
      duration: data.duracion_minutos,
      status: data.status === 'pendiente' ? 'pending' : data.status === 'confirmada' ? 'confirmed' : data.status === 'completada' ? 'completed' : 'cancelled',
      consultation_type: appointmentData.consultation_type,
      reason: data.motivo,
      price: doctor?.consultation_price,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return { success: false, error, data: null };
  }
}

// Obtener citas de un paciente
export async function getPatientAppointments(patientId: string) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        doctor:profiles!appointments_medico_id_fkey(
          id,
          nombre_completo,
          avatar_url
        )
      `)
      .eq("paciente_id", patientId)
      .order("fecha_hora", { ascending: false });

    if (error) throw error;

    // Transformar datos al formato esperado
    const appointments = data?.map((apt: any) => {
      const fechaHora = new Date(apt.fecha_hora);
      return {
        id: apt.id,
        patient_id: apt.paciente_id,
        doctor_id: apt.medico_id,
        appointment_date: fechaHora.toISOString().split('T')[0],
        appointment_time: fechaHora.toTimeString().split(' ')[0],
        duration: apt.duracion_minutos,
        status: apt.status === 'pendiente' ? 'pending' : apt.status === 'confirmada' ? 'confirmed' : apt.status === 'completada' ? 'completed' : 'cancelled',
        consultation_type: 'video' as const,
        reason: apt.motivo,
        notes: apt.notas,
        created_at: apt.created_at,
        updated_at: apt.updated_at,
        doctor: {
          id: apt.doctor?.id,
          nombre_completo: apt.doctor?.nombre_completo,
          avatar_url: apt.doctor?.avatar_url,
          specialty: { name: 'Medicina General' }, // Por ahora sin especialidad
        },
      };
    }) || [];

    return { success: true, data: appointments as Appointment[] };
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    return { success: false, error, data: [] };
  }
}

// Obtener citas de un doctor
export async function getDoctorAppointments(doctorId: string) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        patient:profiles!appointments_paciente_id_fkey(
          id,
          nombre_completo,
          email,
          avatar_url
        )
      `)
      .eq("medico_id", doctorId)
      .order("fecha_hora", { ascending: false });

    if (error) throw error;
    
    // Transformar datos
    const appointments = data?.map((apt: any) => {
      const fechaHora = new Date(apt.fecha_hora);
      return {
        id: apt.id,
        patient_id: apt.paciente_id,
        doctor_id: apt.medico_id,
        appointment_date: fechaHora.toISOString().split('T')[0],
        appointment_time: fechaHora.toTimeString().split(' ')[0],
        duration: apt.duracion_minutos,
        status: apt.status === 'pendiente' ? 'pending' : apt.status === 'confirmada' ? 'confirmed' : apt.status === 'completada' ? 'completed' : 'cancelled',
        consultation_type: 'video' as const,
        reason: apt.motivo,
        notes: apt.notas,
        created_at: apt.created_at,
        updated_at: apt.updated_at,
        patient: apt.patient,
      };
    }) || [];
    
    return { success: true, data: appointments as Appointment[] };
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    return { success: false, error, data: [] };
  }
}

// Cancelar una cita
export async function cancelAppointment(
  appointmentId: string,
  userId: string,
  reason?: string
) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "cancelada",
        notas: reason ? `Cancelada: ${reason}` : 'Cancelada',
      })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await supabase.from("user_activity_log").insert({
      user_id: userId,
      activity_type: "appointment_cancelled",
      description: `Cita cancelada: ${appointmentId}`,
      status: "success",
    });

    const fechaHora = new Date(data.fecha_hora);
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.paciente_id,
      doctor_id: data.medico_id,
      appointment_date: fechaHora.toISOString().split('T')[0],
      appointment_time: fechaHora.toTimeString().split(' ')[0],
      duration: data.duracion_minutos,
      status: 'cancelled',
      consultation_type: 'video',
      reason: data.motivo,
      notes: data.notas,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return { success: false, error, data: null };
  }
}

// Confirmar una cita (doctor)
export async function confirmAppointment(appointmentId: string) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "confirmada" })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) throw error;
    
    const fechaHora = new Date(data.fecha_hora);
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.paciente_id,
      doctor_id: data.medico_id,
      appointment_date: fechaHora.toISOString().split('T')[0],
      appointment_time: fechaHora.toTimeString().split(' ')[0],
      duration: data.duracion_minutos,
      status: 'confirmed',
      consultation_type: 'video',
      reason: data.motivo,
      notes: data.notas,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error confirming appointment:", error);
    return { success: false, error, data: null };
  }
}

// Completar una cita (doctor)
export async function completeAppointment(appointmentId: string) {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "completada" })
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) throw error;
    
    const fechaHora = new Date(data.fecha_hora);
    const appointment: Appointment = {
      id: data.id,
      patient_id: data.paciente_id,
      doctor_id: data.medico_id,
      appointment_date: fechaHora.toISOString().split('T')[0],
      appointment_time: fechaHora.toTimeString().split(' ')[0],
      duration: data.duracion_minutos,
      status: 'completed',
      consultation_type: 'video',
      reason: data.motivo,
      notes: data.notas,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
    
    return { success: true, data: appointment };
  } catch (error) {
    console.error("Error completing appointment:", error);
    return { success: false, error, data: null };
  }
}
