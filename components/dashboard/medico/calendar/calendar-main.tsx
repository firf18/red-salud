"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarViewSelector, type CalendarView } from "./calendar-view-selector";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";
import { AppointmentCard } from "./appointment-card";
import type { CalendarAppointment } from "./types";

interface CalendarMainProps {
  appointments: CalendarAppointment[];
  onNewAppointment?: () => void;
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onTimeSlotClick?: (date: Date, hour?: number) => void;
  onMessage?: (appointment: CalendarAppointment) => void;
  onStartVideo?: (appointment: CalendarAppointment) => void;
  loading?: boolean;
}

export function CalendarMain({
  appointments,
  onNewAppointment,
  onAppointmentClick,
  onTimeSlotClick,
  onMessage,
  onStartVideo,
  loading = false,
}: CalendarMainProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("week");

  const handlePrevious = () => {
    switch (view) {
      case "day":
        setCurrentDate(subDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRangeText = () => {
    switch (view) {
      case "day":
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
      case "week":
        const weekStart = subDays(currentDate, currentDate.getDay() - 1);
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, "d MMM", { locale: es })} - ${format(weekEnd, "d MMM yyyy", { locale: es })}`;
      case "month":
        return format(currentDate, "MMMM yyyy", { locale: es });
      case "list":
        return "Todas las citas";
      default:
        return "";
    }
  };

  // Estadísticas del día/período actual
  const stats = {
    total: appointments.length,
    pendientes: appointments.filter(a => a.status === "pendiente").length,
    confirmadas: appointments.filter(a => a.status === "confirmada").length,
    completadas: appointments.filter(a => a.status === "completada").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Hoy
              </Button>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-lg font-semibold text-gray-900 min-w-[200px]">
                {getDateRangeText()}
              </div>
            </div>

            {/* View Selector and Actions */}
            <div className="flex items-center gap-2">
              <CalendarViewSelector currentView={view} onViewChange={setView} />
              <Button onClick={onNewAppointment}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cita
              </Button>
            </div>
          </div>

          {/* Stats - Clickeable */}
          {view !== "list" && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t flex-wrap">
              <button
                className="text-sm px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => {/* TODO: Filtrar todas */}}
              >
                <span className="text-gray-600">Total:</span>{" "}
                <span className="font-semibold text-gray-900">{stats.total}</span>
              </button>
              <button
                className="text-sm px-3 py-1.5 rounded-md hover:bg-yellow-50 transition-colors"
                onClick={() => {/* TODO: Filtrar pendientes */}}
              >
                <span className="text-gray-600">Pendientes:</span>{" "}
                <span className="font-semibold text-yellow-600">{stats.pendientes}</span>
              </button>
              <button
                className="text-sm px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                onClick={() => {/* TODO: Filtrar confirmadas */}}
              >
                <span className="text-gray-600">Confirmadas:</span>{" "}
                <span className="font-semibold text-blue-600">{stats.confirmadas}</span>
              </button>
              <button
                className="text-sm px-3 py-1.5 rounded-md hover:bg-green-50 transition-colors"
                onClick={() => {/* TODO: Filtrar completadas */}}
              >
                <span className="text-gray-600">Completadas:</span>{" "}
                <span className="font-semibold text-green-600">{stats.completadas}</span>
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar Views */}
      <Card className="overflow-hidden">
        <div className="h-[calc(100vh-300px)]">
          {view === "day" && (
            <DayView
              date={currentDate}
              appointments={appointments}
              onAppointmentClick={onAppointmentClick}
              onTimeSlotClick={onTimeSlotClick}
              onMessage={onMessage}
              onStartVideo={onStartVideo}
            />
          )}
          {view === "week" && (
            <WeekView
              date={currentDate}
              appointments={appointments}
              onAppointmentClick={onAppointmentClick}
              onTimeSlotClick={onTimeSlotClick}
              onMessage={onMessage}
              onStartVideo={onStartVideo}
            />
          )}
          {view === "month" && (
            <MonthView
              date={currentDate}
              appointments={appointments}
              onDayClick={(date) => {
                setCurrentDate(date);
                setView("day");
              }}
              onAppointmentClick={onAppointmentClick}
            />
          )}
          {view === "list" && (
            <div className="p-4 space-y-4 overflow-y-auto h-full">
              {appointments.length > 0 ? (
                appointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onView={onAppointmentClick}
                    onMessage={onMessage}
                    onStartVideo={onStartVideo}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay citas programadas
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Las citas que agendes aparecerán aquí
                  </p>
                  <Button onClick={onNewAppointment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar Primera Cita
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
