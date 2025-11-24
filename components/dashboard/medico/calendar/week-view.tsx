"use client";

import { useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { AppointmentCard } from "./appointment-card";
import type { CalendarAppointment } from "./types";

interface WeekViewProps {
  date: Date;
  appointments: CalendarAppointment[];
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  onMessage?: (appointment: CalendarAppointment) => void;
  onStartVideo?: (appointment: CalendarAppointment) => void;
  startHour?: number;
  endHour?: number;
}

export function WeekView({
  date,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
  onMessage,
  onStartVideo,
  startHour = 7,
  endHour = 20,
}: WeekViewProps) {
  const weekStart = useMemo(() => startOfWeek(date, { weekStartsOn: 1 }), [date]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const hours = useMemo(() => {
    const result = [];
    for (let i = startHour; i <= endHour; i++) {
      result.push(i);
    }
    return result;
  }, [startHour, endHour]);

  const getAppointmentsForDayAndHour = (day: Date, hour: number) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.fecha_hora);
      return isSameDay(aptDate, day) && aptDate.getHours() === hour;
    });
  };

  const isToday = (day: Date) => isSameDay(day, new Date());

  return (
    <div className="flex flex-col h-full">
      {/* Header with Days */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="flex border-b">
          {/* Time column header */}
          <div className="w-16 flex-shrink-0 border-r bg-gray-50" />
          
          {/* Day headers */}
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={`flex-1 p-3 text-center border-r last:border-r-0 ${
                isToday(day) ? "bg-blue-50" : "bg-white"
              }`}
            >
              <div className="text-xs font-medium text-gray-600 uppercase">
                {format(day, "EEE", { locale: es })}
              </div>
              <div
                className={`text-2xl font-bold mt-1 ${
                  isToday(day) ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-full">
          {hours.map((hour) => (
            <div key={hour} className="flex border-b">
              {/* Time Label */}
              <div className="w-16 flex-shrink-0 p-2 text-xs font-medium text-gray-600 border-r">
                {format(new Date().setHours(hour, 0, 0, 0), "HH:mm")}
              </div>

              {/* Day Columns */}
              {weekDays.map((day) => {
                const dayAppointments = getAppointmentsForDayAndHour(day, hour);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className={`flex-1 p-1 min-h-[60px] border-r transition-colors ${
                      isToday(day) ? "bg-blue-50/30" : ""
                    } ${
                      new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour) < new Date()
                        ? "bg-gray-100 cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      const slotTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour);
                      if (slotTime >= new Date()) {
                        onTimeSlotClick?.(day, hour);
                      }
                    }}
                  >
                    {dayAppointments.length > 0 ? (
                      <div className="space-y-1">
                        {dayAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            className="p-1 rounded text-xs border-l-2 bg-white hover:shadow-md transition-shadow cursor-pointer"
                            style={{ borderLeftColor: apt.color }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAppointmentClick?.(apt);
                            }}
                          >
                            <div className="font-medium truncate">
                              {apt.paciente_nombre}
                            </div>
                            <div className="text-gray-500 truncate">
                              {apt.motivo}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
