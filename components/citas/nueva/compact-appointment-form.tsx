"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, Video, AlertCircle, User, ChevronDown } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { AutocompleteTextarea } from "@/components/ui/autocomplete-textarea";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { AppointmentFormValues } from "@/lib/validations/appointment";
import { ConflictChecker } from "./conflict-checker";
import { PatientAutocomplete, PatientOption } from "./patient-autocomplete";
import { DayTimeline } from "./day-timeline";
import { LastAppointmentCard } from "./last-appointment-card";
import { ServiceSelector } from "./service-selector";

interface Patient extends PatientOption { }

interface ConflictingAppointmentData {
  id: string;
  fecha_hora: string;
  duracion_minutos: number;
  motivo: string;
}

interface CompactAppointmentFormProps {
  getMinDate: () => string;
  getMinTime: (fecha: string) => string;
  isTimeValid: (fecha: string, hora: string) => boolean;
  motivoSuggestions: string[];
  patients: Patient[];
  checkingConflict: boolean;
  conflictingAppointments: ConflictingAppointmentData[];
  error: string | null;
  onConflictCheck: (fecha: string, hora: string, duracion: number) => Promise<void>;
  advancedMode: boolean;
  onToggleAdvancedMode?: () => void;
  isInitialLoad?: boolean;
}

const tiposCita = [
  {
    value: "presencial",
    label: "Presencial",
    icon: <MapPin className="h-4 w-4" />,
    color: "text-blue-600",
  },
  {
    value: "telemedicina",
    label: "Telemedicina",
    icon: <Video className="h-4 w-4" />,
    color: "text-green-600",
  },
  {
    value: "urgencia",
    label: "Urgencia",
    icon: <AlertCircle className="h-4 w-4" />,
    color: "text-red-600",
  },
  {
    value: "seguimiento",
    label: "Seguimiento",
    icon: <Clock className="h-4 w-4" />,
    color: "text-purple-600",
  },
  {
    value: "primera_vez",
    label: "Primera Vez",
    icon: <User className="h-4 w-4" />,
    color: "text-amber-600",
  },
];

export function CompactAppointmentForm({
  getMinDate,
  getMinTime,
  isTimeValid,
  motivoSuggestions,
  patients,
  checkingConflict,
  conflictingAppointments,
  error,
  onConflictCheck,
  advancedMode = false,
  onToggleAdvancedMode,
  isInitialLoad = false,
}: CompactAppointmentFormProps) {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<AppointmentFormValues>();
  const fecha = watch("fecha");
  const hora = watch("hora");
  const duracion = watch("duracion_minutos");
  const tipoCita = watch("tipo_cita");
  const pacienteId = watch("paciente_id");
  const enviarRecordatorio = watch("enviar_recordatorio");

  // Estado local para pacientes (para incluir los temporales creados por Cédula)
  const [localPatients, setLocalPatients] = useState<Patient[]>(patients);

  // Sincronizar si cambian los props
  useEffect(() => {
    setLocalPatients(patients);
  }, [patients]);

  // Actualizar hora automáticamente si es el día actual y la hora es pasada o vacía
  useEffect(() => {
    if (fecha && fecha === format(new Date(), "yyyy-MM-dd")) {
      const minTime = getMinTime(fecha);
      // Si no hay hora o la hora seleccionada es menor a la mínima permitida, actualizar
      if (!hora || hora < minTime) {
        setValue("hora", minTime);
      }
    }
  }, [fecha, hora, getMinTime, setValue]);

  // Detectar cambios en fecha/hora/duración para verificar conflictos
  useEffect(() => {
    if (fecha && hora && duracion) {
      onConflictCheck(fecha, hora, duracion);
    }
  }, [fecha, hora, duracion, onConflictCheck]);

  const selectedPatient = useMemo(
    () => localPatients.find((p) => p.id === pacienteId),
    [pacienteId, localPatients]
  );

  const isOfflinePatient = selectedPatient?.type === "offline";

  return (
    <div className="space-y-3">
      {/* Verificador de conflictos */}
      <ConflictChecker
        checkingConflict={checkingConflict && !isInitialLoad}
        conflictingAppointments={conflictingAppointments}
        error={error}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* COLUMNA PRINCIPAL (Izquierda) */}
        <div className="col-span-1 lg:col-span-7 space-y-3">
          {/* Tarjeta Unificada Principal */}
          <div className="bg-card rounded-lg shadow-sm border border-border/80 overflow-hidden">
            {/* Encabezado Visual - Simplificado */}
            <div className="px-4 py-2.5 border-b border-border/60 flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                <User className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-foreground">Datos de la Cita</h3>
                <p className="text-[11px] text-muted-foreground leading-none">Paciente y horario</p>
              </div>
            </div>

            <div className="p-4 space-y-5">
              {/* 1. SECCIÓN PACIENTE */}
              <div data-tour="paciente-select" className="space-y-3">
                <FormField
                  control={control}
                  name="paciente_id"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <PatientAutocomplete
                          patients={localPatients}
                          value={field.value}
                          onSelect={(id) => field.onChange(id)}
                          onPatientCreated={(newPatient) => {
                            setLocalPatients((prev) => [...prev, newPatient]);
                            field.onChange(newPatient.id);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      <LastAppointmentCard patientId={field.value} />
                    </FormItem>
                  )}
                />
              </div>

              <div className="h-px bg-border/50 w-full" />

              {/* 2. GRID INTERNO: PROGRAMACIÓN Y DETALLES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lado Izquierdo: Fecha y Hora */}
                <div data-tour="programming-section" className="space-y-3">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Clock className="h-3.5 w-3.5" />
                    <Label className="font-medium text-sm text-foreground">Programación</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Fecha */}
                    <div className="space-y-1.5">
                      <Label htmlFor="fecha" className="text-xs text-muted-foreground">
                        Fecha
                      </Label>
                      <Input
                        id="fecha"
                        type="date"
                        min={getMinDate()}
                        className="h-9 text-sm"
                        {...register("fecha")}
                      />
                      {errors.fecha && <p className="text-xs text-red-600">{errors.fecha.message}</p>}
                    </div>

                    {/* Hora */}
                    <div className="space-y-1.5">
                      <Label htmlFor="hora" className="text-xs text-muted-foreground">
                        Hora
                      </Label>
                      <Input
                        id="hora"
                        type="time"
                        min={getMinTime(fecha)}
                        className="h-9 text-sm"
                        {...register("hora")}
                      />
                      {errors.hora && <p className="text-xs text-red-600">{errors.hora.message}</p>}
                      {!errors.hora && !isTimeValid(fecha, hora) && (
                        <p className="text-xs text-red-600">Hora pasada</p>
                      )}
                    </div>
                  </div>

                  {/* Duración */}
                  <div className="space-y-1.5">
                    <Label htmlFor="duracion" className="text-xs text-muted-foreground">
                      Duración Estimada
                    </Label>
                    <FormField
                      control={control}
                      name="duracion_minutos"
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15">15 minutos</SelectItem>
                            <SelectItem value="30">30 minutos</SelectItem>
                            <SelectItem value="45">45 minutos</SelectItem>
                            <SelectItem value="60">1 hora</SelectItem>
                            <SelectItem value="90">1 hora 30 min</SelectItem>
                            <SelectItem value="120">2 horas</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="pt-1">
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Disponibilidad</Label>
                    <div className="bg-muted/10 rounded-md p-2 border border-border/40">
                      <DayTimeline
                        date={fecha}
                        selectedTime={hora}
                        duration={duracion || 30}
                        conflictingAppointments={conflictingAppointments}
                        onTimeSelect={(time) => setValue("hora", time)}
                      />
                    </div>
                  </div>
                </div>

                {/* Lado Derecho: Detalles de la Consulta */}
                <div data-tour="cita-details" className="space-y-3">
                  <div className="flex items-center gap-1.5 text-primary">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <Label className="font-medium text-sm text-foreground">Detalles</Label>
                  </div>

                  {/* Tipo de Cita */}
                  <div className="space-y-1.5">
                    <Label htmlFor="tipo_cita" className="text-xs text-muted-foreground">
                      Modalidad
                    </Label>
                    <FormField
                      control={control}
                      name="tipo_cita"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tiposCita.map((tipo) => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                <div className="flex items-center gap-2">
                                  <span className={tipo.color}>{tipo.icon}</span>
                                  {tipo.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Advertencia Telemedicina */}
                  {tipoCita === "telemedicina" && isOfflinePatient && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-2 rounded-md">
                      <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>Pacientes no registrados (offline) no pueden agendar telemedicina.</span>
                    </div>
                  )}

                  {/* Motivo de Consulta */}
                  <div className="space-y-1.5">
                    <Label htmlFor="motivo" className="text-xs text-muted-foreground">
                      Motivo de Consulta
                    </Label>
                    <FormField
                      control={control}
                      name="motivo"
                      render={({ field }) => (
                        <AutocompleteTextarea
                          id="motivo"
                          placeholder="Ej: Dolor abdominal, fiebre, revisión..."
                          value={field.value || ""}
                          onChange={field.onChange}
                          suggestions={motivoSuggestions}
                          rows={4}
                          className="text-sm resize-none"
                        />
                      )}
                    />
                    {errors.motivo && <p className="text-xs text-red-600">{errors.motivo.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MODO AVANZADO (Collapsible) */}
          <div className="bg-card rounded-lg shadow-sm border border-border/80 overflow-hidden">
            <button
              type="button"
              onClick={onToggleAdvancedMode}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${advancedMode ? "bg-primary" : "bg-muted-foreground/40"}`} />
                <span className="text-sm font-medium text-foreground">Información Clínica Adicional</span>
              </div>
              {advancedMode ? (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">Activo</span>
              ) : (
                <span className="text-[10px] text-muted-foreground">Opcional</span>
              )}
            </button>

            {advancedMode && (
              <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border/60 mt-0 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="diagnostico" className="text-xs text-muted-foreground">
                      Diagnóstico Preliminar
                    </Label>
                    <Textarea
                      id="diagnostico"
                      placeholder="Hipótesis..."
                      rows={2}
                      className="resize-none text-sm"
                      {...register("diagnostico_preliminar")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="antecedentes" className="text-xs text-muted-foreground">
                      Antecedentes
                    </Label>
                    <Textarea
                      id="antecedentes"
                      placeholder="Alergias, crónicos..."
                      rows={2}
                      className="resize-none text-sm"
                      {...register("antecedentes_relevantes")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="medicamentos" className="text-xs text-muted-foreground">
                      Medicamentos
                    </Label>
                    <Textarea
                      id="medicamentos"
                      placeholder="Actuales..."
                      rows={2}
                      className="resize-none text-sm"
                      {...register("medicamentos_actuales")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="alergias" className="text-xs text-muted-foreground">
                      Alergias
                    </Label>
                    <Input
                      id="alergias"
                      placeholder="Reacciones..."
                      className="h-full text-sm"
                      {...register("alergias")}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="notas_clinicas" className="text-xs text-muted-foreground">
                    Notas Clínicas Privadas
                  </Label>
                  <Textarea
                    id="notas_clinicas"
                    placeholder="Observaciones solo visibles para personal médico..."
                    rows={3}
                    className="resize-none text-sm"
                    {...register("notas_clinicas")}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA LATERAL (Derecha) - Unificada */}
        <div className="col-span-1 lg:col-span-5">
          <div data-tour="price-section" className="bg-card rounded-lg shadow-sm border border-border/80 overflow-hidden">
            {/* Sección Facturación */}
            <div className="px-4 py-2.5 border-b border-border/60 flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">$</div>
              <h3 className="text-sm font-medium">Facturación</h3>
            </div>
            <div className="p-3 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Servicios</Label>
                <ServiceSelector onPriceChange={(total) => setValue("precio", total.toString())} />
              </div>

              <div className="bg-muted/5 p-2.5 rounded-md space-y-2.5 border border-border/40">
                <div className="space-y-1">
                  <Label htmlFor="precio" className="text-[11px] text-muted-foreground">
                    Total a Cobrar
                  </Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      id="precio"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-6 h-9 font-medium text-base"
                      {...register("precio")}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="metodo_pago" className="text-[11px] text-muted-foreground">
                    Método de Pago
                  </Label>
                  <FormField
                    control={control}
                    name="metodo_pago"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-8 text-sm bg-background">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                          <SelectItem value="tarjeta">💳 Tarjeta</SelectItem>
                          <SelectItem value="transferencia">🏦 Transferencia</SelectItem>
                          <SelectItem value="pago_movil">📱 Pago Móvil</SelectItem>
                          <SelectItem value="seguro">🏥 Seguro</SelectItem>
                          <SelectItem value="pendiente">⏳ Pendiente</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Divisor interno */}
            <div className="border-t border-border/60" />

            {/* Sección Configuración - Integrada */}
            <div className="p-3 space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <span className="text-muted-foreground">⚙</span>
                Configuración
              </h4>
              <div
                className="flex items-start gap-2.5 p-2.5 rounded-md border border-border/40 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer"
                onClick={() => setValue("enviar_recordatorio", !enviarRecordatorio)}
              >
                <input
                  type="checkbox"
                  id="enviar_recordatorio"
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                  {...register("enviar_recordatorio")}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="space-y-0.5">
                  <Label htmlFor="enviar_recordatorio" className="text-sm font-medium cursor-pointer pointer-events-none">
                    Notificar al Paciente
                  </Label>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Enviar recordatorio WhatsApp/Email 24h antes.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="notas_internas" className="text-[11px] text-muted-foreground">
                  Notas Administrativas (Internas)
                </Label>
                <Textarea
                  id="notas_internas"
                  placeholder="Solo visible para administración..."
                  rows={2}
                  className="resize-none text-sm bg-muted/5"
                  {...register("notas_internas")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
