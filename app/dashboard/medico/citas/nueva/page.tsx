"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { searchConsultationReasons } from "@/lib/data/consultation-reasons";

// Components
import { PatientSelector } from "@/components/citas/nueva/patient-selector";
import { AppointmentForm } from "@/components/citas/nueva/appointment-form";
import { SummaryView } from "@/components/citas/nueva/summary-view";

function NuevaCitaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  // Obtener fecha, hora y paciente de los parámetros URL
  const dateParam = searchParams.get("date");
  const hourParam = searchParams.get("hour");
  const pacienteParam = searchParams.get("paciente");

  const [formData, setFormData] = useState({
    paciente_id: pacienteParam || "",
    fecha: dateParam ? format(new Date(dateParam), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    hora: hourParam ? `${hourParam.padStart(2, "0")}:00` : "09:00",
    duracion_minutos: "30",
    tipo_cita: "presencial",
    motivo: "",
    notas_internas: "",
    precio: "",
    metodo_pago: "efectivo",
    enviar_recordatorio: true,
  });

  // Validar que la fecha no sea pasada
  const getMinDate = () => {
    return format(new Date(), "yyyy-MM-dd");
  };

  const getMinTime = () => {
    const now = new Date();
    const selectedDate = formData.fecha;
    const today = format(now, "yyyy-MM-dd");

    // Si es hoy, la hora mínima es la actual + 15 minutos
    if (selectedDate === today) {
      const minTime = new Date(now.getTime() + 15 * 60000); // +15 minutos
      return format(minTime, "HH:mm");
    }
    return "00:00";
  };

  // Validar que la hora seleccionada no sea pasada
  const isTimeValid = () => {
    if (!formData.fecha || !formData.hora) return true;

    const selectedDateTime = new Date(`${formData.fecha}T${formData.hora}:00`);
    const now = new Date();

    return selectedDateTime > now;
  };

  // Estado para sugerencias de motivo
  const [motivoSuggestions, setMotivoSuggestions] = useState<string[]>([]);

  // Función para obtener el término actual (después de la última coma)
  const getCurrentMotivo = (text: string) => {
    const lastCommaIndex = text.lastIndexOf(",");
    if (lastCommaIndex === -1) {
      return text.trim();
    }
    return text.substring(lastCommaIndex + 1).trim();
  };

  // Actualizar sugerencias cuando cambia el motivo
  useEffect(() => {
    const currentTerm = getCurrentMotivo(formData.motivo);
    if (currentTerm.length >= 2) {
      const suggestions = searchConsultationReasons(currentTerm);
      setMotivoSuggestions(suggestions);
    } else {
      setMotivoSuggestions([]);
    }
  }, [formData.motivo]);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Cargar pacientes registrados
      const { data: registeredPatients } = await supabase
        .from("doctor_patients")
        .select(`
          patient_id,
          patient:profiles!doctor_patients_patient_id_fkey(
            id,
            nombre_completo,
            email
          )
        `)
        .eq("doctor_id", user.id);

      // Cargar pacientes offline
      const { data: offlinePatients } = await supabase
        .from("offline_patients")
        .select("id, nombre_completo, cedula")
        .eq("doctor_id", user.id)
        .eq("status", "offline");

      const allPatients = [
        ...(registeredPatients?.map((rp: any) => ({
          id: rp.patient.id,
          nombre_completo: rp.patient.nombre_completo,
          email: rp.patient.email,
          cedula: null,
          type: "registered",
        })) || []),
        ...(offlinePatients?.map((op: any) => ({
          id: op.id,
          nombre_completo: op.nombre_completo,
          email: null,
          cedula: op.cedula,
          type: "offline",
        })) || []),
      ];

      setPatients(allPatients);
    } catch (err) {
      console.error("Error loading patients:", err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }

      if (!formData.paciente_id) {
        setError("Debes seleccionar un paciente");
        setLoading(false);
        return;
      }

      // Validar que la hora no sea pasada
      if (!isTimeValid()) {
        setError("La fecha y hora seleccionadas ya pasaron. Por favor, elige una hora futura.");
        setLoading(false);
        return;
      }

      // Verificar si el paciente es offline o registrado
      const selectedPatient = patients.find(p => p.id === formData.paciente_id);
      const isOfflinePatient = selectedPatient?.type === "offline";

      // Combinar fecha y hora
      const fechaHora = new Date(`${formData.fecha}T${formData.hora}:00`);

      // Determinar color según tipo de cita
      const colors: Record<string, string> = {
        presencial: "#3B82F6",
        telemedicina: "#10B981",
        urgencia: "#EF4444",
        seguimiento: "#8B5CF6",
        primera_vez: "#F59E0B",
      };

      // Generar URL de videollamada si es telemedicina (solo para pacientes registrados)
      const appointmentId = crypto.randomUUID();
      const meetingUrl = formData.tipo_cita === "telemedicina" && !isOfflinePatient
        ? `https://meet.jit.si/cita-${appointmentId.substring(0, 8)}`
        : null;

      // Preparar datos de la cita
      const appointmentData: any = {
        id: appointmentId,
        medico_id: user.id,
        fecha_hora: fechaHora.toISOString(),
        duracion_minutos: parseInt(formData.duracion_minutos),
        tipo_cita: formData.tipo_cita,
        motivo: formData.motivo,
        notas_internas: formData.notas_internas || null,
        status: "pendiente",
        color: colors[formData.tipo_cita] || colors.presencial,
        price: formData.precio ? parseFloat(formData.precio) : null,
        meeting_url: meetingUrl,
      };

      // Asignar el ID correcto según el tipo de paciente
      if (isOfflinePatient) {
        appointmentData.offline_patient_id = formData.paciente_id;
        appointmentData.paciente_id = null;
      } else {
        appointmentData.paciente_id = formData.paciente_id;
        appointmentData.offline_patient_id = null;
      }

      const { error: insertError } = await supabase
        .from("appointments")
        .insert(appointmentData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Log de actividad
      await supabase.from("user_activity_log").insert({
        user_id: user.id,
        activity_type: "appointment_created",
        description: `Cita creada para ${fechaHora.toLocaleString()}`,
        status: "success",
      });

      router.push("/dashboard/medico/citas");
    } catch (err: any) {
      console.error("Error creating appointment:", err);
      setError(err.message || "Error al crear la cita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VerificationGuard>
      <div className="min-h-screen bg-gray-50 px-6 py-6">
        {/* Header minimalista */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Cita</h1>
          <p className="text-gray-600 mt-1">Agenda una nueva cita con un paciente</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <PatientSelector
                patients={patients}
                loadingPatients={loadingPatients}
                selectedPatientId={formData.paciente_id}
                onPatientSelect={(value) =>
                  setFormData({ ...formData, paciente_id: value })
                }
              />

              <AppointmentForm
                formData={formData}
                setFormData={setFormData}
                getMinDate={getMinDate}
                getMinTime={getMinTime}
                isTimeValid={isTimeValid}
                motivoSuggestions={motivoSuggestions}
                patients={patients}
              />
            </div>

            {/* Sidebar - Resumen compacto */}
            <SummaryView formData={formData} loading={loading} />
          </div>
        </form>
      </div>
    </VerificationGuard>
  );
}

export default function NuevaCitaPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    }>
      <NuevaCitaContent />
    </Suspense>
  );
}
