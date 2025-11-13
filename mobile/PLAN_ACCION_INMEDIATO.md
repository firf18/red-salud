# 🎯 Plan de Acción Inmediato
## Próximos Pasos Concretos

---

## 📅 ESTA SEMANA (13-17 Noviembre)

### DÍA 1-2: Estructura y Componentes Base

#### 1. Crear estructura de carpetas
```bash
cd mobile/src
mkdir -p components/{ui,dashboard,forms,layout}
mkdir -p hooks
mkdir -p services/api
mkdir -p utils
mkdir -p constants
mkdir -p types
```

#### 2. Instalar dependencias críticas
```bash
cd mobile
npm install @expo/vector-icons date-fns zod react-hook-form
npm install --save-dev @tanstack/eslint-plugin-query
```

#### 3. Crear componentes UI prioritarios
- [ ] `Badge.tsx` - Para estados (Confirmada, Pendiente, etc.)
- [ ] `Avatar.tsx` - Para fotos de médicos
- [ ] `Input.tsx` - Campos de texto
- [ ] `Modal.tsx` - Diálogos
- [ ] `Alert.tsx` - Notificaciones
- [ ] `Skeleton.tsx` - Loading states

### DÍA 3-4: Servicios y Hooks

#### 4. Expandir servicios de API
```typescript
// services/api/appointments.ts
export const appointmentsService = {
  getAll: async (userId: string) => {...},
  getById: async (id: string) => {...},
  create: async (data: CreateAppointment) => {...},
  cancel: async (id: string) => {...},
  getUpcoming: async (userId: string) => {...},
  getStats: async (userId: string) => {...}
}
```

#### 5. Crear hooks personalizados
- [ ] `useAppointments.ts`
- [ ] `useMedications.ts`
- [ ] `useProfile.ts`

### DÍA 5: Dashboard Principal

#### 6. Completar Dashboard
- [ ] Stats cards (4 cards con números)
- [ ] Alerta de telemedicina activa
- [ ] Lista de próximas citas
- [ ] Sección de actividad reciente
- [ ] Métricas de salud
- [ ] Medicamentos activos
- [ ] Accesos rápidos

---

## 🎨 EJEMPLOS DE CÓDIGO

### Componente Badge
```tsx
// src/components/ui/Badge.tsx
import { View, Text } from 'react-native';

type BadgeProps = {
  variant?: 'default' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
};

export function Badge({ variant = 'default', children }: BadgeProps) {
  const colors = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <View className={`px-2 py-1 rounded-full ${colors[variant]}`}>
      <Text className="text-xs font-medium">{children}</Text>
    </View>
  );
}
```

### Hook useAppointments
```tsx
// src/hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsService } from '@mobile/services/api/appointments';

export function useAppointments(userId: string) {
  const queryClient = useQueryClient();

  const appointments = useQuery({
    queryKey: ['appointments', userId],
    queryFn: () => appointmentsService.getAll(userId),
    enabled: !!userId,
  });

  const upcoming = useQuery({
    queryKey: ['appointments', 'upcoming', userId],
    queryFn: () => appointmentsService.getUpcoming(userId),
    enabled: !!userId,
  });

  const stats = useQuery({
    queryKey: ['appointments', 'stats', userId],
    queryFn: () => appointmentsService.getStats(userId),
    enabled: !!userId,
  });

  const cancelMutation = useMutation({
    mutationFn: appointmentsService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  return {
    appointments: appointments.data,
    upcoming: upcoming.data,
    stats: stats.data,
    isLoading: appointments.isLoading,
    cancel: cancelMutation.mutate,
  };
}
```

### Servicio de Appointments
```tsx
// src/services/api/appointments.ts
import { supabase } from '@mobile/services/supabaseClient';

export interface Appointment {
  id: string;
  tipo: string;
  fecha_hora: string;
  motivo: string;
  status: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  medico_id: string;
  paciente_id: string;
  ubicacion?: string;
  doctor?: {
    nombre_completo: string;
    avatar_url?: string;
  };
}

export const appointmentsService = {
  async getAll(userId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:profiles!appointments_medico_id_fkey(
          nombre_completo,
          avatar_url
        )
      `)
      .eq('paciente_id', userId)
      .order('fecha_hora', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getUpcoming(userId: string): Promise<Appointment[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:profiles!appointments_medico_id_fkey(
          nombre_completo,
          avatar_url
        )
      `)
      .eq('paciente_id', userId)
      .in('status', ['pendiente', 'confirmada'])
      .gte('fecha_hora', now)
      .order('fecha_hora', { ascending: true })
      .limit(3);

    if (error) throw error;
    return data || [];
  },

  async getStats(userId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('paciente_id', userId);

    if (error) throw error;

    const upcoming = data?.filter(
      (apt) => apt.status === 'pendiente' || apt.status === 'confirmada'
    ).length || 0;
    
    const total = data?.length || 0;

    return { upcoming, total };
  },

  async cancel(id: string): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelada' })
      .eq('id', id);

    if (error) throw error;
  },
};
```

### Dashboard Principal Mejorado
```tsx
// app/(tabs)/paciente/index.tsx
import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '@mobile/providers/AuthProvider';
import { useAppointments } from '@mobile/hooks/useAppointments';
import { useMedications } from '@mobile/hooks/useMedications';
import { useProfile } from '@mobile/hooks/useProfile';
import { Card } from '@mobile/components/ui/Card';
import { Badge } from '@mobile/components/ui/Badge';
import { Button } from '@mobile/components/ui/Button';
import { Calendar, Pill, Beaker, MessageSquare } from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function HomePaciente() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: perfil } = useProfile(user?.id);
  const { stats: appointmentStats, upcoming } = useAppointments(user?.id!);
  const { stats: medicationStats } = useMedications(user?.id!);

  const nombre = perfil?.nombre?.split(' ')?.[0] || 'Paciente';

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Invalidar queries
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-white p-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">
          Hola, {nombre} 👋
        </Text>
        <Text className="text-gray-600 mt-1">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        </Text>
      </View>

      <View className="p-4 gap-4">
        {/* Stats Grid */}
        <View className="gap-3">
          <View className="flex-row gap-3">
            <Card className="flex-1 p-4" onPress={() => router.push('/citas')}>
              <View className="items-center">
                <Calendar size={32} color="#3b82f6" />
                <Text className="text-3xl font-bold mt-2">
                  {appointmentStats?.upcoming || 0}
                </Text>
                <Text className="text-sm text-gray-600">Citas Próximas</Text>
              </View>
            </Card>

            <Card className="flex-1 p-4" onPress={() => router.push('/medicamentos')}>
              <View className="items-center">
                <Pill size={32} color="#f97316" />
                <Text className="text-3xl font-bold mt-2">
                  {medicationStats?.active || 0}
                </Text>
                <Text className="text-sm text-gray-600">Medicamentos</Text>
              </View>
            </Card>
          </View>

          <View className="flex-row gap-3">
            <Card className="flex-1 p-4" onPress={() => router.push('/laboratorio')}>
              <View className="items-center">
                <Beaker size={32} color="#8b5cf6" />
                <Text className="text-3xl font-bold mt-2">2</Text>
                <Text className="text-sm text-gray-600">Lab Pendiente</Text>
              </View>
            </Card>

            <Card className="flex-1 p-4" onPress={() => router.push('/mensajeria')}>
              <View className="items-center">
                <MessageSquare size={32} color="#22c55e" />
                <Text className="text-3xl font-bold mt-2">4</Text>
                <Text className="text-sm text-gray-600">Mensajes</Text>
              </View>
            </Card>
          </View>
        </View>

        {/* Próximas Citas */}
        <Card className="p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold">Próximas Citas</Text>
            <Button
              variant="ghost"
              onPress={() => router.push('/citas')}
            >
              Ver todas →
            </Button>
          </View>

          {upcoming && upcoming.length > 0 ? (
            <View className="gap-3">
              {upcoming.map((apt) => (
                <View
                  key={apt.id}
                  className="bg-blue-50 p-3 rounded-lg border border-blue-200"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-semibold text-gray-900 flex-1">
                      {apt.motivo || 'Consulta Médica'}
                    </Text>
                    <Badge variant={apt.status === 'confirmada' ? 'success' : 'warning'}>
                      {apt.status === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                    </Badge>
                  </View>
                  <Text className="text-sm text-gray-600 mb-1">
                    Dr. {apt.doctor?.nombre_completo || 'Por asignar'}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    ⏰ {format(new Date(apt.fecha_hora), "EEEE, d 'de' MMMM 'a las' HH:mm", {
                      locale: es,
                    })}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="py-8 items-center">
              <Text className="text-gray-500 mb-3">No tienes citas próximas</Text>
              <Button onPress={() => router.push('/citas/nueva')}>
                Agendar Cita
              </Button>
            </View>
          )}
        </Card>

        {/* Accesos Rápidos */}
        <Card className="p-4">
          <Text className="text-lg font-semibold mb-3">Accesos Rápidos</Text>
          <View className="gap-2">
            <Button onPress={() => router.push('/telemedicina')}>
              🎥 Telemedicina
            </Button>
            <Button onPress={() => router.push('/laboratorio')}>
              🧪 Laboratorio
            </Button>
            <Button onPress={() => router.push('/historial')}>
              📋 Historial Médico
            </Button>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
```

---

## 📊 CHECKLIST DE PROGRESO

### Semana 1
- [ ] Estructura de carpetas creada
- [ ] 6 componentes UI base
- [ ] 3 hooks personalizados
- [ ] 3 servicios de API expandidos
- [ ] Dashboard principal completo
- [ ] Documentación actualizada

### Indicadores de Éxito
- ✅ Dashboard muestra datos reales
- ✅ Navegación fluida entre pantallas
- ✅ Loading states claros
- ✅ Pull-to-refresh funcional
- ✅ No errores en consola

---

## 🚨 DECISIONES TÉCNICAS PENDIENTES

### 1. Sistema de Notificaciones
**Opciones:**
- A) Expo Notifications (nativo, gratis)
- B) Firebase Cloud Messaging (más robusto)
- C) OneSignal (tercero, fácil)

**Recomendación:** Expo Notifications para empezar

### 2. Videollamadas (Telemedicina)
**Opciones:**
- A) Agora SDK (~$0.99/1000 min)
- B) Twilio Video (~$0.004/min/participante)
- C) Stream Video (~$0.005/min)
- D) Jitsi (gratis, autohospedado)

**Recomendación:** Agora o Twilio

### 3. Gestión de Estado Global
**Opciones:**
- A) React Query + Zustand (actual)
- B) Redux Toolkit
- C) Jotai

**Recomendación:** Mantener React Query + Zustand

### 4. Modo Offline
**Opciones:**
- A) React Query + AsyncStorage (básico)
- B) WatermelonDB (complejo)
- C) NetInfo + caché manual

**Recomendación:** Opción A para MVP

---

## 💬 PREGUNTAS PARA EL EQUIPO

1. ¿Cuál es la prioridad: iOS o Android?
2. ¿Vamos a necesitar biometría (Face ID/Touch ID)?
3. ¿El modo offline es crítico o puede esperar?
4. ¿Qué proveedor de video preferimos?
5. ¿Necesitamos analytics desde el inicio?

---

## 📚 RECURSOS ÚTILES

### Documentación
- Expo Router: https://docs.expo.dev/router/introduction/
- NativeWind: https://www.nativewind.dev/
- React Query: https://tanstack.com/query/latest

### Ejemplos de Código
- Expo Examples: https://github.com/expo/examples
- React Native Directory: https://reactnative.directory/

### Herramientas
- Expo Go (testing)
- EAS Build (compilación)
- React Native Debugger

---

**Próxima revisión:** Viernes 17/11/2025  
**Responsable:** Equipo Mobile
