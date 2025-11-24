"use client";

import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns";
import { es } from "date-fns/locale";
import type { CalendarAppointment } from "./types";

interface MonthViewProps {
  date: Date;
  appointments: CalendarAppointment[];
  onDayClick?: (date: Date) => void;
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
}

export function MonthView({
  date,
  appointments,
  onDayClick,
  onAppointmentClick,
}: MonthViewProps) {
  const monthStart = useMemo(() => startOfMonth(date), [date]);
  const monthEnd = useMemo(() => endOfMonth(date), [date]);
  const calendarStart = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 1 }), [monthStart]);
  const calendarEnd = useMemo(() => endOfWeek(monthEnd, { weekStartsOn: 1 }), [monthEnd]);

  const calendarDays = useMemo(() => {
    const days = [];
    let currentDay = calendarStart;
    while (currentDay <= calendarEnd) {
      days.push(currentDay);
      currentDay = addDays(currentDay, 1);
    }
    return days;
  }, [calendarStart, calendarEnd]);

  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((apt) =>
      isSameDay(new Date(apt.fecha_hora), day)
    );
  };

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(date, "MMMM yyyy", { locale: es })}
        </h2>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-semibold text-gray-600 border-r last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((day) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isCurrentMonth = isSameMonth(day, date);
              const isDayToday = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[120px] p-2 border-r last:border-r-0 transition-colors ${
                    !isCurrentMonth ? "bg-gray-50" : ""
                  } ${isDayToday ? "bg-blue-50" : ""} ${
                    day < new Date(new Date().setHours(0, 0, 0, 0))
                      ? "bg-gray-100 cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    if (day >= new Date(new Date().setHours(0, 0, 0, 0))) {
                      onDayClick?.(day);
                    }
                  }}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-semibold ${
                        !isCurrentMonth
                          ? "text-gray-400"
                          : isDayToday
                          ? "text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center"
                          : "text-gray-900"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {dayAppointments.length > 0 && (
                      <span className="text-xs font-medium text-gray-600 bg-gray-200 rounded-full px-2 py-0.5">
                        {dayAppointments.length}
                      </span>
                    )}
                  </div>

                  {/* Appointments */}
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((apt) => (
                      <div
                        key={apt.id}
                        className="text-xs p-1 rounded border-l-2 bg-white hover:shadow-sm transition-shadow truncate"
                        style={{ borderLeftColor: apt.color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick?.(apt);
                        }}
                      >
                        <div className="font-medium truncate">
                          {format(new Date(apt.fecha_hora), "HH:mm")} {apt.paciente_nombre}
                        </div>
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayAppointments.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
