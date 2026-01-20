"use client";

import { useEffect, useState } from "react";
import { Calendar, Stethoscope, Pill, Clock } from "lucide-react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

interface LastAppointmentProps {
  patientId: string;
}

interface AppointmentSummary {
  date: Date;
  reason: string;
  treatment: string;
  type: string;
}

export function LastAppointmentCard({ patientId }: LastAppointmentProps) {
  const [lastAppointment, setLastAppointment] = useState<AppointmentSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patientId) {
      setLastAppointment(null);
      return;
    }

    // Simulación de fetch de datos
    setLoading(true);
    
    // En un caso real, esto sería una llamada a la API
    // const fetchLast = async () => { ... }
    
    // Simulamos un delay y datos aleatorios para demostración
    const timer = setTimeout(() => {
        // Solo simulamos datos para IDs que no sean temporales (offline)
        if (!patientId.startsWith("temp_")) {
            setLastAppointment({
                date: subDays(new Date(), Math.floor(Math.random() * 60) + 1), // Hace 1-60 días
                reason: Math.random() > 0.5 ? "Control de Hipertensión" : "Dolor Abdominal Recurrente",
                treatment: Math.random() > 0.5 ? "Losartán 50mg cada 12h" : "Omeprazol 20mg en ayunas",
                type: Math.random() > 0.5 ? "Presencial" : "Telemedicina"
            });
        } else {
            setLastAppointment(null); // Pacientes nuevos no tienen historial
        }
        setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [patientId]);

  if (!patientId || !lastAppointment) return null;

  if (loading) {
    return (
      <div className="bg-muted/30 rounded-lg p-3 border border-dashed border-muted animate-pulse">
        <div className="h-4 bg-muted/50 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-muted/50 rounded w-3/4"></div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-lg p-3 text-sm space-y-2 mt-2">
      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium text-xs uppercase tracking-wide">
        <Clock className="h-3 w-3" />
        Última Visita
      </div>
      
      <div className="grid gap-2">
        <div className="flex items-start gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
          <div>
            <span className="font-medium text-foreground">
              {format(lastAppointment.date, "EEEE d 'de' MMMM", { locale: es })}
            </span>
            <span className="text-muted-foreground text-xs ml-2">
              (hace {Math.floor((new Date().getTime() - lastAppointment.date.getTime()) / (1000 * 60 * 60 * 24))} días)
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Stethoscope className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
          <span className="text-foreground">{lastAppointment.reason}</span>
        </div>

        <div className="flex items-start gap-2">
          <Pill className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
          <span className="text-muted-foreground italic">{lastAppointment.treatment}</span>
        </div>
      </div>
    </div>
  );
}
