# 🔧 ESPECIFICACIONES TÉCNICAS: Dashboard de Pacientes

**Nivel**: Profesional | **Fase**: Implementación Detallada

---

## 📋 TABLA DE CONTENIDOS

1. [Tipos de Datos & Validación](#tipos-de-datos--validación)
2. [Servicios & Queries](#servicios--queries)
3. [Hooks & State Management](#hooks--state-management)
4. [Componentes & Props](#componentes--props)
5. [Errores & Excepciones](#errores--excepciones)
6. [Performance](#performance)
7. [Testing](#testing)

---

## Tipos de Datos & Validación

### 1. Dashboard Stats

**Archivo**: `lib/types/dashboard-stats.ts`

```typescript
import { z } from 'zod';

// ============ VALIDACIÓN CON ZOD ============
export const DashboardStatsSchema = z.object({
  upcomingAppointments: z.number().int().min(0),
  totalConsultations: z.number().int().min(0),
  activeMedications: z.number().int().min(0),
  pendingLabResults: z.number().int().min(0),
  unreadMessages: z.number().int().min(0),
  activeTelemed: z.number().int().min(0),
});

export const StatCardSchema = z.object({
  id: z.enum(['appointments', 'medications', 'lab', 'messages', 'telemed']),
  title: z.string(),
  description: z.string().optional(),
  value: z.number().int().min(0),
  icon: z.string(), // lucide-react icon name
  color: z.enum(['blue', 'orange', 'purple', 'green']),
  trend: z.object({
    direction: z.enum(['up', 'down', 'stable']),
    percentage: z.number().min(0).max(100),
    period: z.string(), // "vs mes anterior"
  }).optional(),
  sparklineData: z.array(z.number()).optional(), // últimos 7 días
  action: z.object({
    label: z.string(),
    href: z.string(),
  }).optional(),
});

// ============ TIPOS ============
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
export type StatCard = z.infer<typeof StatCardSchema>;

// ============ TYPE GUARDS ============
export function isDashboardStats(data: unknown): data is DashboardStats {
  try {
    return DashboardStatsSchema.parse(data) !== null;
  } catch {
    return false;
  }
}

// ============ FACTORY FUNCTIONS ============
export function createStatCard(
  id: StatCard['id'],
  value: number,
  color: StatCard['color'],
  options?: {
    trend?: StatCard['trend'];
    sparklineData?: number[];
  }
): StatCard {
  const config: Record<StatCard['id'], Omit<StatCard, 'value' | 'color'>> = {
    appointments: {
      id: 'appointments',
      title: 'Próximas Citas',
      description: 'Consultas programadas',
      icon: 'Calendar',
      action: {
        label: 'Ver todas',
        href: '/dashboard/paciente/citas',
      },
    },
    medications: {
      id: 'medications',
      title: 'Medicamentos Activos',
      description: 'Recordatorios configurados',
      icon: 'Pill',
      action: {
        label: 'Gestionar',
        href: '/dashboard/paciente/medicamentos',
      },
    },
    lab: {
      id: 'lab',
      title: 'Resultados Pendientes',
      description: 'Órdenes en proceso',
      icon: 'Beaker',
      action: {
        label: 'Ver resultados',
        href: '/dashboard/paciente/laboratorio',
      },
    },
    messages: {
      id: 'messages',
      title: 'Mensajes Sin Leer',
      description: 'Conversaciones activas',
      icon: 'MessageSquare',
      action: {
        label: 'Ver mensajes',
        href: '/dashboard/paciente/mensajeria',
      },
    },
    telemed: {
      id: 'telemed',
      title: 'Sesiones Activas',
      description: 'Videoconsultas en directo',
      icon: 'Video',
      action: {
        label: 'Unirse ahora',
        href: '/dashboard/paciente/telemedicina',
      },
    },
  };

  return {
    ...config[id],
    value,
    color,
    trend: options?.trend,
    sparklineData: options?.sparklineData,
  };
}
```

### 2. Dashboard Appointments

**Archivo**: `lib/types/dashboard-appointments.ts`

```typescript
import { z } from 'zod';

export const AppointmentCardSchema = z.object({
  id: z.string().uuid(),
  date: z.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().int().min(15).max(120), // minutos
  doctor: z.object({
    id: z.string().uuid(),
    name: z.string(),
    specialty: z.string(),
    avatar_url: z.string().url().optional(),
  }),
  reason: z.string(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  consultation_type: z.enum(['presencial', 'video', 'telefono']),
  location: z.string().optional(),
  notes: z.string().optional(),
  canReschedule: z.boolean(),
  canCancel: z.boolean(),
});

export type AppointmentCard = z.infer<typeof AppointmentCardSchema>;

// Función para formatear cita desde datos Supabase
export function mapAppointmentToCard(
  raw: any,
  userTimezone: string = 'America/Bogota'
): AppointmentCard {
  const fecha = new Date(raw.fecha_hora);
  
  return {
    id: raw.id,
    date: fecha,
    time: fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    duration: raw.duracion_minutos,
    doctor: {
      id: raw.doctor?.id,
      name: raw.doctor?.nombre_completo,
      specialty: raw.doctor?.especialidad,
      avatar_url: raw.doctor?.avatar_url,
    },
    reason: raw.motivo,
    status: mapStatus(raw.status),
    consultation_type: raw.tipo_consulta || 'video',
    location: raw.lugar,
    notes: raw.notas,
    canReschedule: ['pending', 'confirmed'].includes(mapStatus(raw.status)),
    canCancel: ['pending', 'confirmed'].includes(mapStatus(raw.status)),
  };
}

function mapStatus(dbStatus: string): AppointmentCard['status'] {
  const map: Record<string, AppointmentCard['status']> = {
    'pendiente': 'pending',
    'confirmada': 'confirmed',
    'completada': 'completed',
    'cancelada': 'cancelled',
  };
  return map[dbStatus] || 'pending';
}
```

### 3. Dashboard Metrics

**Archivo**: `lib/types/dashboard-metrics.ts`

```typescript
import { z } from 'zod';

export const MetricCardSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  timestamp: z.date(),
  status: z.enum(['normal', 'warning', 'danger']).optional(),
  reference: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    ideal: z.number().optional(),
  }).optional(),
  trend: z.object({
    direction: z.enum(['up', 'down', 'stable']),
    change: z.number(), // porcentaje
  }).optional(),
  secondaryValue: z.number().optional(),
  secondaryUnit: z.string().optional(),
  history: z.array(z.object({
    value: z.number(),
    timestamp: z.date(),
  })).optional(),
});

export type MetricCard = z.infer<typeof MetricCardSchema>;

// Evaluar si métrica es normal/warning/danger
export function evaluateMetricStatus(
  value: number,
  reference?: MetricCard['reference']
): MetricCard['status'] {
  if (!reference) return undefined;

  if (reference.min && value < reference.min) return 'danger';
  if (reference.max && value > reference.max) return 'danger';
  if (reference.ideal) {
    const variance = Math.abs(value - reference.ideal) / reference.ideal;
    if (variance > 0.2) return 'warning';
  }

  return 'normal';
}

// Calcular tendencia
export function calculateTrend(
  currentValue: number,
  previousValue: number
): MetricCard['trend'] {
  const change = ((currentValue - previousValue) / previousValue) * 100;

  return {
    direction:
      Math.abs(change) < 5 ? 'stable' : change > 0 ? 'up' : 'down',
    change: Math.abs(change),
  };
}
```

### 4. Dashboard Medications

**Archivo**: `lib/types/dashboard-medications.ts`

```typescript
import { z } from 'zod';

export const MedicationCardSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  dose: z.string(),
  unit: z.string(),
  schedules: z.array(z.string()), // ["08:00", "14:00", "20:00"]
  status: z.enum(['taken', 'pending', 'missed']).optional(),
  adherence: z.number().min(0).max(100).optional(), // porcentaje última semana
  sideEffects: z.array(z.string()).optional(),
  warnings: z.string().optional(),
  nextDose: z.object({
    time: z.string(),
    in: z.string(), // "en 2 horas"
  }).optional(),
  todayLog: z.array(z.object({
    time: z.string(),
    taken: z.boolean(),
    notes: z.string().optional(),
  })).optional(),
});

export type MedicationCard = z.infer<typeof MedicationCardSchema>;

// Determinar estado actual de medicamento
export function getMedicationStatus(
  now: Date,
  schedules: string[],
  todayLog?: MedicationCard['todayLog']
): MedicationCard['status'] {
  if (!todayLog || todayLog.length === 0) return 'pending';

  const allTaken = todayLog.every(log => log.taken);
  if (allTaken) return 'taken';

  const anySinceNow = todayLog.some(log => {
    const [h, m] = log.time.split(':').map(Number);
    const logTime = new Date(now);
    logTime.setHours(h, m, 0, 0);
    return logTime <= now;
  });

  return anySinceNow ? 'missed' : 'pending';
}

// Calcular próxima dosis
export function getNextDose(
  now: Date,
  schedules: string[]
): MedicationCard['nextDose'] | undefined {
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  const nextSchedule = schedules.find(schedule => {
    const [h, m] = schedule.split(':').map(Number);
    return h > currentHours || (h === currentHours && m > currentMinutes);
  });

  if (!nextSchedule) return undefined;

  const [h, m] = nextSchedule.split(':').map(Number);
  const nextTime = new Date(now);
  nextTime.setHours(h, m, 0, 0);

  const diff = nextTime.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  let inText = '';
  if (hours > 0) inText += `${hours}h `;
  if (minutes > 0) inText += `${minutes}min`;

  return {
    time: nextSchedule,
    in: inText.trim(),
  };
}
```

---

## Servicios & Queries

### 1. Dashboard Stats Service

**Archivo**: `lib/supabase/services/dashboard-stats-service.ts`

```typescript
import { supabase } from '../client';
import { DashboardStats, DashboardStatsSchema } from '@/lib/types/dashboard-stats';

// ============ FUNCIÓN PRINCIPAL ============
export async function getDashboardStats(
  userId: string,
  options?: {
    cacheKey?: string;
    cacheDuration?: number; // segundos
  }
): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
  try {
    // Validar userId
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId');
    }

    // Ejecutar todas las queries en paralelo
    const results = await Promise.allSettled([
      getAppointmentsStats(userId),
      getMedicationsStats(userId),
      getLabStats(userId),
      getMessagesStats(userId),
      getTelemedStats(userId),
    ]);

    // Procesar resultados
    const data: DashboardStats = {
      upcomingAppointments: 0,
      totalConsultations: 0,
      activeMedications: 0,
      pendingLabResults: 0,
      unreadMessages: 0,
      activeTelemed: 0,
    };

    // Stats 0
    if (results[0].status === 'fulfilled') {
      const stats = results[0].value;
      data.upcomingAppointments = stats.upcoming;
      data.totalConsultations = stats.total;
    }

    // Stats 1
    if (results[1].status === 'fulfilled') {
      data.activeMedications = results[1].value;
    }

    // Stats 2
    if (results[2].status === 'fulfilled') {
      data.pendingLabResults = results[2].value;
    }

    // Stats 3
    if (results[3].status === 'fulfilled') {
      data.unreadMessages = results[3].value;
    }

    // Stats 4
    if (results[4].status === 'fulfilled') {
      data.activeTelemed = results[4].value;
    }

    // Validar con Zod
    const validated = DashboardStatsSchema.parse(data);

    return { success: true, data: validated };
  } catch (error) {
    console.error('[getDashboardStats] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============ QUERIES INDIVIDUALES ============

async function getAppointmentsStats(userId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select('id, status', { count: 'exact' })
    .eq('paciente_id', userId);

  if (error) throw error;

  const upcoming = (data || []).filter(
    a => a.status === 'pendiente' || a.status === 'confirmada'
  ).length;

  return {
    upcoming,
    total: data?.length || 0,
  };
}

async function getMedicationsStats(userId: string) {
  const { count, error } = await supabase
    .from('medication_reminders')
    .select('id', { count: 'exact' })
    .eq('paciente_id', userId)
    .eq('activo', true);

  if (error) throw error;
  return count || 0;
}

async function getLabStats(userId: string) {
  const { count, error } = await supabase
    .from('lab_orders')
    .select('id', { count: 'exact' })
    .eq('paciente_id', userId)
    .in('status', ['en_proceso', 'muestra_tomada']);

  if (error) throw error;
  return count || 0;
}

async function getMessagesStats(userId: string) {
  const { count, error } = await supabase
    .from('messages_new')
    .select('id', { count: 'exact' })
    .neq('sender_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

async function getTelemedStats(userId: string) {
  const { count, error } = await supabase
    .from('telemedicine_sessions')
    .select('id', { count: 'exact' })
    .eq('patient_id', userId)
    .in('status', ['waiting', 'active']);

  if (error) throw error;
  return count || 0;
}

// ============ QUERIES CON TENDENCIAS ============

export async function getAppointmentsWithTrend(userId: string) {
  // Citas este mes vs mes anterior
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [thisMonth, prevMonth] = await Promise.all([
    supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .eq('paciente_id', userId)
      .gte('fecha_hora', monthStart.toISOString()),
    supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .eq('paciente_id', userId)
      .gte('fecha_hora', prevMonthStart.toISOString())
      .lte('fecha_hora', prevMonthEnd.toISOString()),
  ]);

  const currentCount = thisMonth.count || 0;
  const previousCount = prevMonth.count || 0;
  const percentage =
    previousCount === 0 ? 100 : ((currentCount - previousCount) / previousCount) * 100;

  return {
    current: currentCount,
    previous: previousCount,
    percentage: Math.round(percentage),
  };
}
```

### 2. Dashboard Appointments Service

**Archivo**: `lib/supabase/services/dashboard-appointments-service.ts`

```typescript
import { supabase } from '../client';
import { AppointmentCard, mapAppointmentToCard } from '@/lib/types/dashboard-appointments';

export async function getDashboardAppointments(
  userId: string,
  options?: {
    limit?: number;
    includeHistory?: boolean;
  }
): Promise<{
  success: boolean;
  data?: { upcoming: AppointmentCard[]; today?: AppointmentCard[] };
  error?: string;
}> {
  try {
    const limit = options?.limit || 3;

    // Obtener citas futuras
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:profiles!appointments_medico_id_fkey(
          id,
          nombre_completo,
          especialidad,
          avatar_url
        )
      `)
      .eq('paciente_id', userId)
      .in('status', ['pendiente', 'confirmada'])
      .gte('fecha_hora', new Date().toISOString())
      .order('fecha_hora', { ascending: true })
      .limit(limit);

    if (error) throw error;

    const upcoming = (data || []).map(apt => mapAppointmentToCard(apt));

    // Obtener cita de hoy si existe
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: todayData, error: todayError } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:profiles!appointments_medico_id_fkey(
          id,
          nombre_completo,
          especialidad,
          avatar_url
        )
      `)
      .eq('paciente_id', userId)
      .gte('fecha_hora', today.toISOString())
      .lt('fecha_hora', tomorrow.toISOString())
      .order('fecha_hora', { ascending: true });

    if (todayError) console.warn('Error fetching today appointments:', todayError);

    const todayAppointments = (todayData || []).map(apt => mapAppointmentToCard(apt));

    return {
      success: true,
      data: {
        upcoming,
        today: todayAppointments,
      },
    };
  } catch (error) {
    console.error('[getDashboardAppointments] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Obtener detalles completos de una cita
export async function getAppointmentDetails(appointmentId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:profiles!appointments_medico_id_fkey(*),
      notes:appointment_notes(*)
    `)
    .eq('id', appointmentId)
    .single();

  if (error) throw error;
  return data;
}
```

---

## Hooks & State Management

### 1. Use Dashboard Stats Hook

**Archivo**: `hooks/use-dashboard-stats.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import {
  getDashboardStats,
  getAppointmentsWithTrend,
} from '@/lib/supabase/services/dashboard-stats-service';
import { DashboardStats } from '@/lib/types/dashboard-stats';

interface UseDashboardStatsOptions {
  refetchInterval?: number; // ms
  includeSparklines?: boolean;
  userId?: string;
}

export function useDashboardStats(options: UseDashboardStatsOptions = {}) {
  const { refetchInterval = 0, includeSparklines = false, userId } = options;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Función para cargar datos
  const loadStats = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await getDashboardStats(userId);

      if (result.success && result.data) {
        setStats(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to load stats');
      }
    } catch (err) {
      console.error('[useDashboardStats] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Cargar al montar
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || refetchInterval < 1000) return;

    const interval = setInterval(loadStats, refetchInterval);
    return () => clearInterval(interval);
  }, [refetchInterval, loadStats]);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    refetch: loadStats,
  };
}
```

---

## Componentes & Props

### 1. Stat Card Component

**Archivo**: `components/dashboard/paciente/stat-card.tsx`

```typescript
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import { StatCard } from '@/lib/types/dashboard-stats';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatCardProps extends StatCard {
  isLoading?: boolean;
  onClick?: () => void;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-800',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-800',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    badge: 'bg-green-100 text-green-800',
  },
};

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      id,
      title,
      description,
      value,
      icon,
      color,
      trend,
      sparklineData,
      action,
      isLoading,
      onClick,
    },
    ref
  ) => {
    const colors = colorMap[color];
    const Icon =
      LucideIcons[icon as keyof typeof LucideIcons] ||
      LucideIcons.Activity;

    const trendColor = useMemo(() => {
      if (!trend) return 'text-gray-500';
      if (trend.direction === 'up') return 'text-green-600';
      if (trend.direction === 'down') return 'text-red-600';
      return 'text-gray-500';
    }, [trend]);

    const CardWrapper = action ? Link : 'div';

    return (
      <CardWrapper
        ref={ref}
        href={action?.href}
        onClick={onClick}
        className={cn(
          'block transition-all duration-200',
          action && 'hover:shadow-lg hover:scale-105'
        )}
      >
        <Card
          className={cn(
            'overflow-hidden cursor-pointer',
            isLoading && 'opacity-50 pointer-events-none'
          )}
        >
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div
                className={cn(
                  'h-12 w-12 rounded-lg flex items-center justify-center',
                  colors.bg
                )}
              >
                <Icon className={cn('h-6 w-6', colors.icon)} />
              </div>
              {trend && (
                <Badge
                  variant="outline"
                  className={cn('text-xs', trendColor)}
                >
                  {trend.direction === 'up' && '↑'}
                  {trend.direction === 'down' && '↓'}
                  {trend.direction === 'stable' && '→'}
                  {trend.percentage}%
                </Badge>
              )}
            </div>

            {/* Title & Value */}
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-600 mb-1">
                {title}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {isLoading ? (
                  <span className="animate-pulse">--</span>
                ) : (
                  value
                )}
              </p>
            </div>

            {/* Description */}
            {description && (
              <p className="text-xs text-gray-500 mb-3">{description}</p>
            )}

            {/* Sparkline (opcional) */}
            {sparklineData && sparklineData.length > 0 && (
              <div className="mb-3 h-10 bg-gray-50 rounded p-2">
                {/* Aquí iría el mini gráfico */}
                <p className="text-xs text-gray-400 text-center">
                  Gráfico {sparklineData.length} puntos
                </p>
              </div>
            )}

            {/* Action */}
            {action && (
              <p className="text-xs font-medium text-blue-600 hover:text-blue-700">
                {action.label} →
              </p>
            )}
          </CardContent>
        </Card>
      </CardWrapper>
    );
  }
);

StatCard.displayName = 'StatCard';
```

---

## Errores & Excepciones

### Error Handling Strategy

**Archivo**: `lib/errors/dashboard-errors.ts`

```typescript
// ============ CUSTOM ERRORS ============

export class DashboardError extends Error {
  constructor(
    public code: string,
    public message: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'DashboardError';
  }
}

export class DataValidationError extends DashboardError {
  constructor(message: string, context?: Record<string, any>) {
    super('VALIDATION_ERROR', message, context);
    this.name = 'DataValidationError';
  }
}

export class QueryError extends DashboardError {
  constructor(message: string, context?: Record<string, any>) {
    super('QUERY_ERROR', message, context);
    this.name = 'QueryError';
  }
}

export class PermissionError extends DashboardError {
  constructor(message: string = 'No tienes permiso para acceder a esto') {
    super('PERMISSION_ERROR', message);
    this.name = 'PermissionError';
  }
}

// ============ ERROR HANDLER ============

export function handleDashboardError(
  error: unknown,
  context: string
): { code: string; message: string; isDevelopment: boolean } {
  const isDevelopment = process.env.NODE_ENV === 'development';

  let errorInfo = {
    code: 'UNKNOWN_ERROR',
    message: 'Algo salió mal. Por favor, intenta de nuevo.',
  };

  if (error instanceof DashboardError) {
    errorInfo = {
      code: error.code,
      message: error.message,
    };
  } else if (error instanceof Error) {
    errorInfo = {
      code: 'ERROR',
      message: isDevelopment ? error.message : 'Error al procesar la solicitud',
    };
  }

  if (isDevelopment) {
    console.error(`[${context}] ${errorInfo.code}:`, error);
  }

  return {
    ...errorInfo,
    isDevelopment,
  };
}
```

---

## Performance

### Optimization Strategies

**Archivo**: `lib/performance/dashboard-optimizations.ts`

```typescript
// ============ CACHING ============

class DashboardCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number = 300000; // 5 minutos

  set(key: string, data: any, ttl?: number) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string, ttl?: number): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const maxAge = ttl || this.ttl;
    if (Date.now() - entry.timestamp > maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const dashboardCache = new DashboardCache();

// ============ DEBOUNCE ============

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
) {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

// ============ REQUEST DEDUPLICATION ============

class RequestDeduplicator {
  private pending: Map<string, Promise<any>> = new Map();

  async deduplicatedRequest<T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T> {
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    const promise = fn().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}

export const requestDeduplicator = new RequestDeduplicator();
```

---

## Testing

### Test Suite Structure

**Archivo**: `__tests__/dashboard/stat-card.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatCard from '@/components/dashboard/paciente/stat-card';
import { createStatCard } from '@/lib/types/dashboard-stats';

describe('StatCard', () => {
  it('renders with correct value', () => {
    const card = createStatCard('appointments', 5, 'blue');
    render(<StatCard {...card} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const card = createStatCard('appointments', 5, 'blue');
    render(<StatCard {...card} isLoading={true} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('handles click action', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const card = createStatCard('appointments', 5, 'blue');
    render(<StatCard {...card} onClick={onClick} />);
    
    await user.click(screen.getByText('5'));
    expect(onClick).toHaveBeenCalled();
  });

  it('displays trend correctly', () => {
    const card = createStatCard('appointments', 5, 'blue', {
      trend: {
        direction: 'up',
        percentage: 15,
        period: 'vs mes anterior',
      },
    });
    render(<StatCard {...card} />);
    expect(screen.getByText('↑15%')).toBeInTheDocument();
  });
});
```

---

**Este documento debe ser referencia para la implementación de cada componente.**
