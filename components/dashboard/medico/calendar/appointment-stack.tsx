/**
 * @file appointment-stack.tsx
 * @description Componente para mostrar múltiples citas en el mismo horario sin solapamiento
 * @module Dashboard/Medico/Calendar
 */

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CalendarAppointment } from "./types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AppointmentStackProps {
  appointments: CalendarAppointment[];
  maxVisible?: number;
  compact?: boolean;
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
}

export function AppointmentStack({
  appointments,
  maxVisible = 3,
  compact = false,
  onAppointmentClick,
}: AppointmentStackProps) {
  const [expanded, setExpanded] = useState(false);

  if (appointments.length === 0) return null;

  const visibleAppointments = expanded
    ? appointments
    : appointments.slice(0, maxVisible);
  const hiddenCount = appointments.length - maxVisible;

  return (
    <div className="space-y-1">
      {visibleAppointments.map((apt) => (
        <div
          key={apt.id}
          className={cn(
            "rounded cursor-pointer hover:opacity-80 transition-opacity",
            compact ? "p-1 text-xs" : "p-2 text-sm"
          )}
          style={{
            backgroundColor: apt.color + "20",
            borderLeft: `${compact ? "2px" : "3px"} solid ${apt.color}`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onAppointmentClick?.(apt);
          }}
        >
          <div className="font-medium truncate">{apt.paciente_nombre}</div>
          {!compact && (
            <div className="text-xs text-muted-foreground truncate">
              {apt.motivo}
            </div>
          )}
        </div>
      ))}

      {/* Botón para expandir/colapsar */}
      {hiddenCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={cn(
            "w-full text-center text-muted-foreground hover:text-foreground transition-colors rounded",
            compact ? "text-xs py-0.5" : "text-sm py-1"
          )}
        >
          {expanded ? (
            <div className="flex items-center justify-center gap-1">
              <ChevronUp className="h-3 w-3" />
              <span>Mostrar menos</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1">
              <ChevronDown className="h-3 w-3" />
              <span>+{hiddenCount} más</span>
            </div>
          )}
        </button>
      )}
    </div>
  );
}
