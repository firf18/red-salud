# 🚀 PLAN DE ACCIÓN INMEDIATO: Dashboard Pacientes - Primera Card

**Fecha Inicio**: 5 de Noviembre 2025  
**Objetivo**: Primera stat card profesional lista para producción  
**Tiempo Estimado**: 4-6 horas

---

## 📍 Punto de Partida

Vamos a comenzar por la **Stat Card de Citas** (Próximas Citas) por ser:
- ✅ Más simple que otras
- ✅ Fundamental para el dashboard
- ✅ Prototipo para las demás
- ✅ Alto impacto visual
- ✅ Rápido de iterar

---

## 🎯 Fase 1: Preparación (30 minutos)

### Paso 1.1: Crear rama de Git
```bash
git checkout -b feat/dashboard-v2-stat-cards
```

### Paso 1.2: Crear estructura de carpetas
```bash
# Crear directorios si no existen
mkdir -p lib/types/dashboard
mkdir -p lib/supabase/services/dashboard
mkdir -p components/dashboard/paciente/stats
mkdir -p hooks/dashboard
mkdir -p __tests__/dashboard
```

### Paso 1.3: Verificar archivos existentes
```bash
# Listar lo que ya existe
ls -la lib/types/
ls -la lib/supabase/services/
ls -la components/dashboard/
```

---

## 🏗️ Fase 2: Crear Tipos & Validación (1 hora)

### Paso 2.1: Crear `lib/types/dashboard-stats.ts`

**Contenido**: [Ver archivo ESPECIFICACIONES-TECNICAS-DASHBOARD.md - Sección "Tipos de Datos"]

**Tareas**:
- [ ] Copiar el código de tipos
- [ ] Instalar/verificar zod (`npm list zod`)
- [ ] Ejecutar `npm run lint` para verificar sintaxis
- [ ] Crear test básico para tipos

### Paso 2.2: Crear `lib/types/dashboard-index.ts`

```typescript
// Exportar todo desde un único punto de entrada
export * from './dashboard-stats';
export * from './dashboard-appointments';
export * from './dashboard-metrics';
export * from './dashboard-medications';
export * from './dashboard-messages';
export * from './dashboard-telemedicine';
export * from './dashboard-activity';
```

---

## 🔌 Fase 3: Crear Servicios (1.5 horas)

### Paso 3.1: Crear `lib/supabase/services/dashboard-stats-service.ts`

**Tareas**:
- [ ] Copiar código del servicio
- [ ] Probar queries en Supabase SQL Editor
- [ ] Validar que RLS permite el acceso
- [ ] Probar la función `getDashboardStats` en una página temporal

**Verificación de Queries**:
```sql
-- Verificar que el usuario puede acceder a sus datos
SELECT * FROM appointments 
WHERE paciente_id = auth.uid() 
LIMIT 1;
```

### Paso 3.2: Crear `lib/supabase/services/index.ts`

```typescript
// Exportar servicios
export * from './dashboard-stats-service';
export * from './dashboard-appointments-service';
export * from './dashboard-metrics-service';
// ... etc
```

---

## ⚙️ Fase 4: Crear Hooks (1.5 horas)

### Paso 4.1: Crear `hooks/dashboard/use-dashboard-stats.ts`

**Tareas**:
- [ ] Copiar código del hook
- [ ] Probar que carga datos correctamente
- [ ] Probar que maneja errores
- [ ] Probar refetch manual
- [ ] Crear unit test

---

## 🎨 Fase 5: Crear Componentes (1.5 horas)

### Paso 5.1: Crear `components/dashboard/paciente/stats/stat-card.tsx`

**Tareas**:
- [ ] Copiar código del componente
- [ ] Probar que renderiza correctamente
- [ ] Probar estados: normal, loading, error
- [ ] Probar que los colores funcionan
- [ ] Crear unit test

### Paso 5.2: Crear `components/dashboard/paciente/stats/stats-grid.tsx`

```typescript
'use client';

import React from 'react';
import StatCard from './stat-card';
import { useDashboardStats } from '@/hooks/dashboard/use-dashboard-stats';
import { useAuth } from '@/hooks/use-auth'; // o similar

export function StatsGrid() {
  const { user } = useAuth();
  const { stats, loading, error, refetch } = useDashboardStats({
    userId: user?.id,
    refetchInterval: 30000, // 30 segundos
  });

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Error al cargar estadísticas: {error}
          <button 
            onClick={refetch}
            className="ml-2 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Mapear stats a cards
  const cards = [
    {
      id: 'appointments',
      value: stats.upcomingAppointments,
      color: 'blue' as const,
      isLoading: loading,
    },
    // ... más cards
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <StatCard key={card.id} {...card} />
      ))}
    </div>
  );
}
```

---

## 🔄 Fase 6: Integrar en Dashboard (1 hora)

### Paso 6.1: Actualizar `app/dashboard/paciente/page.tsx`

**Cambios**:
```diff
- // Eliminar las 500+ líneas de lógica
- // Reemplazar por:

+ import { StatsGrid } from '@/components/dashboard/paciente/stats/stats-grid';
+
+ export default function DashboardPacientePage() {
+   return (
+     <div className="p-4 lg:p-8 space-y-6">
+       {/* Header */}
+       <DashboardHeader />
+       
+       {/* Stats Grid - NUEVA */}
+       <StatsGrid />
+       
+       {/* Resto del contenido */}
+       <MainContent />
+     </div>
+   );
+ }
```

---

## ✅ Fase 7: Testing (1 hora)

### Paso 7.1: Crear `__tests__/dashboard/stat-card.test.tsx`

**Casos de prueba**:
- [ ] Renderiza con valor correcto
- [ ] Muestra estado de carga
- [ ] Maneja click
- [ ] Muestra tendencia correctamente
- [ ] Trunca texto largo

### Paso 7.2: Crear `__tests__/dashboard/use-dashboard-stats.test.tsx`

**Casos de prueba**:
- [ ] Carga datos inicialmente
- [ ] Maneja errores
- [ ] Refetch funciona
- [ ] Limpia interval en desmontaje

---

## 🚀 Fase 8: Validación (1 hora)

### Paso 8.1: Checklist de Producción

- [ ] Sin console.log en código (solo comentarios)
- [ ] TypeScript sin errores (`npm run lint`)
- [ ] Tests pasando (`npm test`)
- [ ] Responsivo en mobile, tablet, desktop
- [ ] Sin memoria leaks
- [ ] Performance < 1.5s
- [ ] Errores manejo elegante
- [ ] Documentación completada

### Paso 8.2: Pruebas Manuales

**En Development**:
```bash
npm run dev
# Navegar a /dashboard/paciente
# Verificar que carga correctamente
# Verificar estados de carga
# Verificar errores (simular offline)
# Verificar responsive
```

**En Producción (Simulado)**:
```bash
npm run build
npm run start
# Verificar que todo funciona
```

---

## 📝 Paso a Paso: Primeras líneas de código

### 1. Crear el archivo de tipos

**Archivo**: `lib/types/dashboard-stats.ts`

```typescript
import { z } from 'zod';

export const DashboardStatsSchema = z.object({
  upcomingAppointments: z.number().int().min(0),
  totalConsultations: z.number().int().min(0),
  activeMedications: z.number().int().min(0),
  pendingLabResults: z.number().int().min(0),
  unreadMessages: z.number().int().min(0),
  activeTelemed: z.number().int().min(0),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
```

**Verificación**:
```bash
npm run lint lib/types/dashboard-stats.ts
# No debe mostrar errores
```

### 2. Crear el servicio

**Archivo**: `lib/supabase/services/dashboard-stats-service.ts`

```typescript
import { supabase } from '../client';
import { DashboardStats, DashboardStatsSchema } from '@/lib/types/dashboard-stats';

export async function getDashboardStats(userId: string) {
  try {
    // Query de appointments
    const { data: appointments, error: aptError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('paciente_id', userId);

    if (aptError) throw aptError;

    const upcomingAppointments = (appointments || []).filter(
      a => a.status === 'pendiente' || a.status === 'confirmada'
    ).length;

    // ... más queries

    const result = {
      upcomingAppointments,
      totalConsultations: appointments?.length || 0,
      activeMedications: 0,
      pendingLabResults: 0,
      unreadMessages: 0,
      activeTelemed: 0,
    };

    const validated = DashboardStatsSchema.parse(result);
    return { success: true, data: validated };
  } catch (error) {
    console.error('Error loading stats:', error);
    return { success: false, error: String(error) };
  }
}
```

### 3. Crear el hook

**Archivo**: `hooks/dashboard/use-dashboard-stats.ts`

```typescript
import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/lib/supabase/services/dashboard-stats-service';
import type { DashboardStats } from '@/lib/types/dashboard-stats';

export function useDashboardStats(userId?: string) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadStats = async () => {
      const result = await getDashboardStats(userId);
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    };

    loadStats();
  }, [userId]);

  return { stats, loading, error };
}
```

---

## 📋 Checklist de Ejecución

### Antes de empezar
- [ ] Rama creada: `feat/dashboard-v2-stat-cards`
- [ ] Documentación leída: `ANALISIS-DASHBOARD-PACIENTE-PROFUNDO.md`
- [ ] Documentación leída: `ESPECIFICACIONES-TECNICAS-DASHBOARD.md`

### Durante desarrollo
- [ ] Tipos creados y validados
- [ ] Servicios creados y probados
- [ ] Hooks creados y probados
- [ ] Componentes creados y probados
- [ ] Tests escritos
- [ ] Sin errores de lint

### Antes de PR
- [ ] Código revisado por ti mismo
- [ ] Tests pasando
- [ ] No hay console.log (salvo debug comentados)
- [ ] Responsivo probado
- [ ] Performance verificado
- [ ] Commit messages claros

---

## 🎯 Siguientes Cards (Después de completar Stats)

1. **Citas**: Usar la misma estructura
2. **Medicamentos**: Agregar indicador de adherencia
3. **Métricas**: Agregar mini-gráfico
4. **Laboratorio**: Agregar estado de órdenes
5. **Mensajes**: Agregar preview
6. **Telemedicina**: Agregar alerta

---

## 💡 Tips Importantes

1. **Mantener Componentes Puros**: No hagas queries en el componente, usa hooks
2. **Separación de Preocupaciones**: Tipos ≠ Servicios ≠ Hooks ≠ Componentes
3. **Testing Temprano**: Escribe tests mientras desarrollas
4. **Commit Frecuente**: Cada paso completado = 1 commit
5. **Documentar**: Deja comentarios claros en código complejo

---

## 🆘 Si algo falla

**Query no devuelve datos**:
```sql
-- En SQL Editor de Supabase
SELECT * FROM appointments 
WHERE paciente_id = auth.uid() 
LIMIT 1;
```

**TypeScript error**:
```bash
npx tsc --noEmit
```

**Tests fallando**:
```bash
npm test -- --watch
```

**Performance lenta**:
```bash
# Verificar que hay índices
SELECT * FROM pg_indexes 
WHERE tablename = 'appointments';
```

---

**¿Listo para comenzar? Confirma y te muestro el código específico para cada paso.** 🚀
