"use client";

import { useMemo } from "react";
import { format, parse, addMinutes, isWithinInterval, startOfDay, isSameDay } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ConflictingAppointment {
  id: string;
  fecha_hora: string;
  duracion_minutos: number;
  motivo: string;
}

interface DayTimelineProps {
  date: string; // YYYY-MM-DD
  selectedTime: string; // HH:mm
  duration: number; // minutes
  conflictingAppointments: ConflictingAppointment[];
  onTimeSelect?: (time: string) => void;
  workingHours?: { start: number; end: number }; // 0-23
}

export function DayTimeline({
  date,
  selectedTime,
  duration,
  conflictingAppointments,
  onTimeSelect,
  workingHours = { start: 8, end: 18 },
}: DayTimelineProps) {
  // Generar slots de 15 minutos
  const slots = useMemo(() => {
    const slotsArray = [];
    const baseDate = parse(date, "yyyy-MM-dd", new Date());

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const slotDate = parse(`${date} ${timeString}`, "yyyy-MM-dd HH:mm", new Date());

        slotsArray.push({
          time: timeString,
          date: slotDate,
        });
      }
    }
    return slotsArray;
  }, [date, workingHours]);

  // Calcular estado de cada slot
  const getSlotStatus = (slotTime: Date) => {
    // Verificar si es parte de la selección actual
    const selectionStart = parse(`${date} ${selectedTime}`, "yyyy-MM-dd HH:mm", new Date());
    const selectionEnd = addMinutes(selectionStart, duration);

    // El slot actual
    const slotEnd = addMinutes(slotTime, 15);

    // Verificar conflictos
    const conflict = conflictingAppointments.find(apt => {
      const aptStart = new Date(apt.fecha_hora);
      const aptEnd = addMinutes(aptStart, apt.duracion_minutos);

      // Intersección simple
      return (
        (slotTime >= aptStart && slotTime < aptEnd) ||
        (slotEnd > aptStart && slotEnd <= aptEnd)
      );
    });

    if (conflict) return "busy";

    // Verificar selección
    if (selectedTime) {
      if (slotTime >= selectionStart && slotTime < selectionEnd) {
        return "selected";
      }
    }

    return "free";
  };

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
        <span>{workingHours.start}:00</span>
        <span>{Math.floor((workingHours.end + workingHours.start) / 2)}:00</span>
        <span>{workingHours.end}:00</span>
      </div>

      <div className="h-5 w-full flex rounded overflow-hidden border border-border/50 bg-muted/20 dark:bg-muted/10 relative">
        <TooltipProvider delayDuration={0}>
          {slots.map((slot, index) => {
            const status = getSlotStatus(slot.date);
            let bgColor = "bg-transparent hover:bg-muted/40 dark:hover:bg-muted/30";
            let cursor = "cursor-pointer";

            if (status === "busy") {
              bgColor = "bg-red-400/70 dark:bg-red-500/60 hover:bg-red-500/80";
              cursor = "cursor-not-allowed";
            } else if (status === "selected") {
              bgColor = "bg-primary/80 hover:bg-primary";
            }

            return (
              <Tooltip key={slot.time}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex-1 h-full transition-colors border-r border-border/20 last:border-0 ${bgColor} ${cursor}`}
                    onClick={() => status !== "busy" && onTimeSelect?.(slot.time)}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs py-1 px-2">
                  <p className="font-medium">{slot.time}</p>
                  {status === "busy" && <p className="text-red-400 text-[10px]">Ocupado</p>}
                  {status === "selected" && <p className="text-primary text-[10px]">Seleccionado</p>}
                  {status === "free" && <p className="text-emerald-500 text-[10px]">Disponible</p>}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <div className="flex gap-3 text-[10px] justify-center">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-muted/30 border border-border/50 rounded-sm"></div>
          <span className="text-muted-foreground">Libre</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-primary/80 rounded-sm"></div>
          <span className="text-muted-foreground">Selección</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 bg-red-400/70 rounded-sm"></div>
          <span className="text-muted-foreground">Ocupado</span>
        </div>
      </div>
    </div>
  );
}
