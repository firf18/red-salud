# 🔧 Configuración y Estructura - Recomendaciones

## ✅ Estado Actual de la Configuración

### Configuración Correcta
1. ✅ **Babel** - Module resolver configurado correctamente
2. ✅ **TypeScript** - Paths configurados (@mobile, @core)
3. ✅ **NativeWind** - Tailwind funcionando
4. ✅ **Expo Router** - Navegación file-based
5. ✅ **Supabase** - Cliente configurado

---

## 🚀 Mejoras Recomendadas

### 1. Estructura de Carpetas Mejorada

Crear esta estructura dentro de `mobile/src/`:

```
mobile/src/
├── components/
│   ├── ui/                    # Componentes base reutilizables
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Alert.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Progress.tsx
│   │   └── index.ts
│   ├── dashboard/             # Componentes específicos del dashboard
│   │   ├── StatsCard.tsx
│   │   ├── AppointmentCard.tsx
│   │   ├── ActivityItem.tsx
│   │   ├── MetricCard.tsx
│   │   └── index.ts
│   ├── forms/                 # Componentes de formularios
│   │   ├── AppointmentForm.tsx
│   │   ├── MedicationForm.tsx
│   │   └── index.ts
│   └── layout/                # Layouts compartidos
│       ├── ScreenContainer.tsx
│       ├── LoadingScreen.tsx
│       └── index.ts
├── hooks/                     # Hooks personalizados
│   ├── useAppointments.ts
│   ├── useMedications.ts
│   ├── useLabOrders.ts
│   ├── useHealthMetrics.ts
│   ├── useTelemedicine.ts
│   └── index.ts
├── services/
│   ├── api/                   # Servicios de API organizados
│   │   ├── appointments.ts
│   │   ├── medications.ts
│   │   ├── laboratory.ts
│   │   ├── metrics.ts
│   │   ├── telemedicine.ts
│   │   ├── messages.ts
│   │   └── profile.ts
│   ├── storage/               # Servicios de almacenamiento local
│   │   ├── cache.ts
│   │   └── offline.ts
│   └── supabaseClient.ts
├── utils/                     # Utilidades
│   ├── formatters.ts          # Formateo de fechas, números, etc.
│   ├── validators.ts          # Validaciones
│   └── helpers.ts             # Funciones helper
├── constants/                 # Constantes
│   ├── colors.ts
│   ├── routes.ts
│   └── config.ts
└── types/                     # Tipos TypeScript compartidos
    ├── api.ts
    ├── models.ts
    └── index.ts
```

### 2. Dependencias Adicionales Recomendadas

```json
{
  "dependencies": {
    "@expo/vector-icons": "^14.0.0",
    "expo-notifications": "~0.27.0",
    "expo-image-picker": "~14.7.0",
    "expo-document-picker": "~11.10.0",
    "date-fns": "^2.30.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@tanstack/eslint-plugin-query": "^5.20.0"
  }
}
```

### 3. Variables de Entorno

Crear `.env` en `mobile/`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://hwckkfiirldgundbcjsp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_API_URL=https://api.redsalud.com
```

### 4. Configuración de React Query Mejorada

Actualizar `src/providers/QueryProvider.tsx`:
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

## 📋 Checklist de Configuración

- [x] TypeScript configurado
- [x] Babel module resolver
- [x] NativeWind funcionando
- [x] Expo Router configurado
- [x] Supabase client
- [x] React Query provider
- [x] Auth provider
- [ ] Estructura de carpetas completa
- [ ] Hooks personalizados
- [ ] Componentes UI base
- [ ] Variables de entorno
- [ ] Notificaciones configuradas
- [ ] Sistema de caché
- [ ] Manejo de errores global

---

## 🎯 Próximos Pasos

1. Crear estructura de carpetas
2. Instalar dependencias adicionales
3. Crear componentes UI base
4. Crear hooks personalizados
5. Expandir servicios de API
