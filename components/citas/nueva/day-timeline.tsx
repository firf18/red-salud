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
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>{workingHours.start}:00</span>
        <span>{Math.floor((workingHours.end + workingHours.start) / 2)}:00</span>
        <span>{workingHours.end}:00</span>
      </div>
      
      <div className="h-6 w-full flex rounded-md overflow-hidden border border-gray-200 bg-gray-50 relative">
        <TooltipProvider delayDuration={0}>
            {slots.map((slot, index) => {
            const status = getSlotStatus(slot.date);
            let bgColor = "bg-transparent hover:bg-gray-200";
            let cursor = "cursor-pointer";
            
            if (status === "busy") {
                bgColor = "bg-red-400/80 hover:bg-red-500";
                cursor = "cursor-not-allowed";
            } else if (status === "selected") {
                bgColor = "bg-blue-500 hover:bg-blue-600";
            }

            return (
                <Tooltip key={slot.time}>
                <TooltipTrigger asChild>
                    <div
                    className={`flex-1 h-full transition-colors border-r border-gray-100 last:border-0 ${bgColor} ${cursor}`}
                    onClick={() => status !== "busy" && onTimeSelect?.(slot.time)}
                    />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                    <p>{slot.time}</p>
                    {status === "busy" && <p className="text-red-500 font-semibold">Ocupado</p>}
                    {status === "selected" && <p className="text-blue-500 font-semibold">Seleccionado</p>}
                    {status === "free" && <p className="text-green-500">Disponible</p>}
                </TooltipContent>
                </Tooltip>
            );
            })}
        </TooltipProvider>
      </div>
      
      <div className="flex gap-4 text-xs justify-center">
        <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-sm"></div>
            <span className="text-muted-foreground">Libre</span>
        </div>
        <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <span className="text-muted-foreground">Selección</span>
        </div>
        <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
            <span className="text-muted-foreground">Ocupado</span>
        </div>
      </div>
    </div>
  );
}
