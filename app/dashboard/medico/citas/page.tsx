
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { CalendarMain } from "@/components/dashboard/medico/calendar/calendar-main";
import { PatientSummaryModal } from "@/components/dashboard/medico/calendar/patient-summary-modal";
import type { CalendarAppointment } from "@/components/dashboard/medico/calendar/types";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";

export default function DoctorCitasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }
      await loadAppointments(user.id);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointments = async (doctorId: string) => {
    // Cargar citas del mes actual y siguiente
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(addMonths(new Date(), 1));

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        paciente_id,
        offline_patient_id,
        fecha_hora,
        duracion_minutos,
        motivo,
        status,
        tipo_cita,
        color,
        notas_internas,
        paciente:profiles!appointments_paciente_id_fkey(
          nombre_completo,
          telefono,
          email,
          avatar_url
        ),
        offline_patient:offline_patients!appointments_offline_patient_id_fkey(
          nombre_completo,
          telefono,
          email
        )
      `)
      .eq("medico_id", doctorId)
      .gte("fecha_hora", startDate.toISOString())
      .lte("fecha_hora", endDate.toISOString())
      .order("fecha_hora", { ascending: true });

    if (error) {
      console.error("Error loading appointments:", error);
      return;
    }

    if (data) {
      const formattedAppointments: CalendarAppointment[] = data.map((apt: any) => {
        // Determinar si es paciente registrado u offline
        const isOfflinePatient = !apt.paciente_id && apt.offline_patient_id;
        const patientData = isOfflinePatient ? apt.offline_patient : apt.paciente;

        return {
          id: apt.id,
          paciente_id: apt.paciente_id,
          offline_patient_id: apt.offline_patient_id,
          paciente_nombre: patientData?.nombre_completo || "Paciente",
          paciente_telefono: patientData?.telefono || null,
          paciente_email: patientData?.email || null,
          paciente_avatar: isOfflinePatient ? null : (patientData?.avatar_url || null),
          fecha_hora: apt.fecha_hora,
          fecha_hora_fin: new Date(
            new Date(apt.fecha_hora).getTime() + (apt.duracion_minutos || 30) * 60000
          ).toISOString(),
          duracion_minutos: apt.duracion_minutos || 30,
          motivo: apt.motivo || "Sin motivo",
          status: apt.status || "pendiente",
          tipo_cita: apt.tipo_cita || "presencial",
          color: apt.color || "#3B82F6",
          notas_internas: apt.notas_internas || null,
        };
      });
      
      console.log(`Loaded ${formattedAppointments.length} appointments (${data.filter((a: any) => a.offline_patient_id).length} offline patients)`);
      setAppointments(formattedAppointments);
    }
  };

  const handleNewAppointment = () => {
    router.push("/dashboard/medico/citas/nueva");
  };

  const handleAppointmentClick = (appointment: CalendarAppointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleTimeSlotClick = (date: Date, hour?: number) => {
    // Validar que no sea fecha/hora pasada
    const now = new Date();
    const selectedDateTime = new Date(date);
    
    if (hour !== undefined) {
      selectedDateTime.setHours(hour, 0, 0, 0);
    }
    
    // Si es fecha/hora pasada, no permitir
    if (selectedDateTime < now) {
      alert("No puedes agendar citas en fechas u horas pasadas");
      return;
    }
    
    const dateParam = date.toISOString();
    const hourParam = hour !== undefined ? `&hour=${hour}` : "";
    router.push(`/dashboard/medico/citas/nueva?date=${dateParam}${hourParam}`);
  };

  const handleMessage = (appointment: CalendarAppointment) => {
    if (!appointment.paciente_id) {
      alert("No se puede enviar mensajes a pacientes sin cuenta en el sistema");
      return;
    }
    router.push(`/dashboard/medico/mensajeria?patient=${appointment.paciente_id}`);
  };

  const handleStartVideo = (appointment: CalendarAppointment) => {
    if (!appointment.paciente_id) {
      alert("No se puede iniciar videollamada con pacientes sin cuenta en el sistema");
      return;
    }
    router.push(`/dashboard/medico/telemedicina/${appointment.id}`);
  };

  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tus citas y disponibilidad
          </p>
        </div>

        <CalendarMain
          appointments={appointments}
          onNewAppointment={handleNewAppointment}
          onAppointmentClick={handleAppointmentClick}
          onTimeSlotClick={handleTimeSlotClick}
          onMessage={handleMessage}
          onStartVideo={handleStartVideo}
          loading={loading}
        />

        <PatientSummaryModal
          appointment={selectedAppointment}
          open={modalOpen}
          onClose={handleCloseModal}
          onMessage={handleMessage}
          onStartVideo={handleStartVideo}
        />
      </div>
    </VerificationGuard>
  );
}
