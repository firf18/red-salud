"use client";

import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { AppointmentCard } from "./appointment-card";
import type { CalendarAppointment } from "./types";

interface DayViewProps {
  date: Date;
  appointments: CalendarAppointment[];
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  onMessage?: (appointment: CalendarAppointment) => void;
  onStartVideo?: (appointment: CalendarAppointment) => void;
  startHour?: number;
  endHour?: number;
}

export function DayView({
  date,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
  onMessage,
  onStartVideo,
  startHour = 7,
  endHour = 20,
}: DayViewProps) {
  const hours = useMemo(() => {
    const result = [];
    for (let i = startHour; i <= endHour; i++) {
      result.push(i);
    }
    return result;
  }, [startHour, endHour]);

  const dayAppointments = useMemo(() => {
    return appointments.filter((apt) =>
      isSameDay(new Date(apt.fecha_hora), date)
    );
  }, [appointments, date]);

  const getAppointmentsForHour = (hour: number) => {
    return dayAppointments.filter((apt) => {
      const aptHour = new Date(apt.fecha_hora).getHours();
      return aptHour === hour;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4 sticky top-0 z-10">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {dayAppointments.length} cita{dayAppointments.length !== 1 ? "s" : ""} programada{dayAppointments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-w-full">
          {hours.map((hour) => {
            const hourAppointments = getAppointmentsForHour(hour);
            return (
              <div
                key={hour}
                className="flex border-b hover:bg-gray-50 transition-colors"
              >
                {/* Time Label */}
                <div className="w-20 flex-shrink-0 p-4 text-sm font-medium text-gray-600 border-r">
                  {format(new Date().setHours(hour, 0, 0, 0), "HH:mm")}
                </div>

                {/* Content Area */}
                <div
                  className={`flex-1 p-2 min-h-[80px] ${
                    new Date(date.setHours(hour, 0, 0, 0)) < new Date()
                      ? "bg-gray-100 cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
                  onClick={() => {
                    const slotTime = new Date(date);
                    slotTime.setHours(hour, 0, 0, 0);
                    if (slotTime >= new Date()) {
                      onTimeSlotClick?.(date, hour);
                    }
                  }}
                >
                  {hourAppointments.length > 0 ? (
                    <div className="space-y-2">
                      {hourAppointments.map((apt) => (
                        <AppointmentCard
                          key={apt.id}
                          appointment={apt}
                          onView={onAppointmentClick}
                          onMessage={onMessage}
                          onStartVideo={onStartVideo}
                          compact
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                      Click para agendar
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
