/**
 * @file unified-calendar.tsx
 * @description Calendario unificado compacto con vistas integradas (Día, Semana, Mes, Lista)
 * @module Dashboard/Medico/Calendar
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday } from "date-fns";
import { es } from "date-fns/locale";
import type { CalendarAppointment } from "./types";
import { cn } from "@/lib/utils";
import { AppointmentCard } from "./appointment-card";
import { AppointmentStack } from "./appointment-stack";

type ViewMode = "day" | "week" | "month" | "list";

interface UnifiedCalendarProps {
  appointments: CalendarAppointment[];
  onNewAppointment?: () => void;
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onTimeSlotClick?: (date: Date, hour?: number) => void;
  onMessage?: (appointment: CalendarAppointment) => void;
  onStartVideo?: (appointment: CalendarAppointment) => void;
  loading?: boolean;
}

export function UnifiedCalendar({
  appointments,
  onNewAppointment,
  onAppointmentClick,
  onTimeSlotClick,
  onMessage,
  onStartVideo,
  loading = false,
}: UnifiedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  const handlePrevious = () => {
    switch (viewMode) {
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
    switch (viewMode) {
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
    switch (viewMode) {
      case "day":
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, "d MMM", { locale: es })} - ${format(weekEnd, "d MMM yyyy", { locale: es })}`;
      case "month":
        return format(currentDate, "MMMM yyyy", { locale: es });
      case "list":
        return "Todas las citas";
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.fecha_hora), date));
  };

  const getAppointmentsForHour = (date: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.fecha_hora);
      return isSameDay(aptDate, date) && aptDate.getHours() === hour;
    });
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM - 8 PM
    const dayAppointments = getAppointmentsForDate(currentDate);

    return (
      <div className="h-full">
        <div className="min-w-[600px]">
          {hours.map(hour => {
            const hourAppointments = getAppointmentsForHour(currentDate, hour);
            return (
              <div
                key={hour}
                className="flex border-b border-border hover:bg-muted/30 transition-colors"
                onClick={() => hourAppointments.length === 0 && onTimeSlotClick?.(currentDate, hour)}
              >
                <div className="w-16 flex-shrink-0 p-1 text-xs text-muted-foreground font-medium">
                  {format(new Date().setHours(hour, 0), "HH:mm")}
                </div>
                <div className="flex-1 min-h-[40px] p-1 relative">
                  {hourAppointments.length > 0 ? (
                    <AppointmentStack
                      appointments={hourAppointments}
                      maxVisible={2}
                      compact={false}
                      onAppointmentClick={onAppointmentClick}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground opacity-0 hover:opacity-100 transition-opacity">
                      Click para agendar
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });
    const hours = Array.from({ length: 14 }, (_, i) => i + 7);

    return (
      <div className="h-full">
        <div className="min-w-[900px]">
          {/* Header con días - MÁS COMPACTO */}
          <div className="flex border-b border-border bg-muted/50 sticky top-0 z-10">
            <div className="w-12 flex-shrink-0" />
            {weekDays.map(day => (
              <div key={day.toISOString()} className="flex-1 p-1 text-center">
                <div className="text-[10px] text-muted-foreground uppercase">
                  {format(day, "EEE", { locale: es })}
                </div>
                <div className={cn(
                  "text-sm font-semibold",
                  isToday(day) && "text-primary"
                )}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Grid de horas - MÁS COMPACTO */}
          {hours.map(hour => (
            <div key={hour} className="flex border-b border-border">
              <div className="w-12 flex-shrink-0 p-1 text-[10px] text-muted-foreground font-medium">
                {format(new Date().setHours(hour, 0), "HH:mm")}
              </div>
              {weekDays.map(day => {
                const hourAppointments = getAppointmentsForHour(day, hour);
                return (
                  <div
                    key={day.toISOString()}
                    className="flex-1 min-h-[36px] p-0.5 border-l border-border hover:bg-muted/30 transition-colors cursor-pointer relative"
                    onClick={() => hourAppointments.length === 0 && onTimeSlotClick?.(day, hour)}
                  >
                    {hourAppointments.length > 0 && (
                      <AppointmentStack
                        appointments={hourAppointments}
                        maxVisible={2}
                        compact={true}
                        onAppointmentClick={onAppointmentClick}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="h-full p-4">
        <div className="grid grid-cols-7 gap-px bg-border h-full">
          {/* Header */}
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
            <div key={day} className="bg-muted/50 p-2 text-center text-xs font-semibold text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Days */}
          {calendarDays.map(day => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "bg-card min-h-[100px] p-2 cursor-pointer hover:bg-muted/30 transition-colors",
                  !isCurrentMonth && "opacity-40"
                )}
                onClick={() => {
                  setCurrentDate(day);
                  setViewMode("day");
                }}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday(day) && "text-primary font-bold"
                )}>
                  {format(day, "d")}
                </div>
                {dayAppointments.length > 0 && (
                  <AppointmentStack
                    appointments={dayAppointments}
                    maxVisible={3}
                    compact={true}
                    onAppointmentClick={(apt) => {
                      onAppointmentClick?.(apt);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="h-full p-4">
        {appointments.length > 0 ? (
          <div className="space-y-3 max-w-4xl mx-auto">
            {appointments.map(apt => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onView={onAppointmentClick}
                onMessage={onMessage}
                onStartVideo={onStartVideo}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay citas programadas</h3>
              <p className="text-muted-foreground mb-4">Las citas que agendes aparecerán aquí</p>
              <Button onClick={onNewAppointment}>
                <Plus className="h-4 w-4 mr-2" />
                Agendar Primera Cita
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar compacto - MÁS PEQUEÑO */}
      <div className="flex-shrink-0 flex items-center justify-between px-2 py-1.5 border-b border-border bg-card">
        {/* Navigation */}
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleToday}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevious}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNext}>
            <ChevronRight className="h-3 w-3" />
          </Button>
          <div className="text-xs font-semibold text-foreground min-w-[180px] ml-1">
            {getDateRangeText()}
          </div>
        </div>

        {/* View Selector */}
        <div className="flex items-center gap-0.5">
          <Button
            variant={viewMode === "day" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setViewMode("day")}
          >
            Día
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setViewMode("week")}
          >
            Semana
          </Button>
          <Button
            variant={viewMode === "month" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setViewMode("month")}
          >
            Mes
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setViewMode("list")}
          >
            Lista
          </Button>
        </div>

        {/* New Appointment */}
        <Button onClick={onNewAppointment} size="sm" className="h-7 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Nueva Cita
        </Button>
      </div>

      {/* Calendar Content - Con scroll interno oculto */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {viewMode === "day" && renderDayView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "month" && renderMonthView()}
        {viewMode === "list" && renderListView()}
      </div>
    </div>
  );
}
