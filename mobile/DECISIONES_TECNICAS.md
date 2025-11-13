# 🤔 Decisiones Técnicas - Recomendaciones y Justificaciones

**Fecha:** 12 de noviembre de 2025  
**Versión:** 1.0

---

## 📊 Resumen de Decisiones

| Decisión | Recomendación | Urgencia | Estado |
|----------|--------------|----------|--------|
| Sistema de Notificaciones | Expo Notifications | ⭐⭐⭐ | Pendiente |
| Videollamadas | Agora SDK | ⭐⭐ | Pendiente |
| Gestión de Estado | React Query + Zustand | ⭐⭐⭐ | ✅ Implementado |
| Modo Offline | React Query + AsyncStorage | ⭐⭐ | Pendiente |
| Formularios | React Hook Form + Zod | ⭐⭐⭐ | Pendiente |
| Imágenes/Docs | Expo Pickers | ⭐⭐ | Pendiente |
| Gráficas | react-native-chart-kit | ⭐ | Pendiente |
| Analytics | Expo Analytics básico | ⭐ | Pendiente |
| Biometría | Expo Local Auth | ⭐ | Pendiente |

---

## 1️⃣ Sistema de Notificaciones

### Opciones Evaluadas

#### A) **Expo Notifications** ⭐ RECOMENDADO
**Pros:**
- ✅ Nativo de Expo, bien integrado
- ✅ Gratis hasta cierto volumen
- ✅ Fácil configuración
- ✅ Documentación excelente
- ✅ Soporta iOS y Android
- ✅ Notificaciones locales y push

**Contras:**
- ❌ Menos features que Firebase
- ❌ Requiere EAS Build para push

**Costo:** Gratis + EAS Build ($29/mes)

#### B) Firebase Cloud Messaging
**Pros:**
- ✅ Muy robusto
- ✅ Analytics incluido
- ✅ Targeting avanzado

**Contras:**
- ❌ Setup más complejo
- ❌ Dependencia de Google
- ❌ Mayor bundle size

**Costo:** Gratis (hasta límite)

#### C) OneSignal
**Pros:**
- ✅ Muy fácil de usar
- ✅ Dashboard potente

**Contras:**
- ❌ Tercero (vendor lock-in)
- ❌ Costo escalado

**Costo:** Gratis hasta 10k usuarios

### **Decisión Final**
✅ **Expo Notifications**

**Justificación:**
- Ya estamos usando Expo
- Suficiente para MVP
- Costo predecible
- Migración futura posible

**Implementación:**
```bash
expo install expo-notifications expo-device expo-constants
```

---

## 2️⃣ Videollamadas (Telemedicina)

### Opciones Evaluadas

#### A) **Agora SDK** ⭐ RECOMENDADO
**Pros:**
- ✅ Excelente calidad
- ✅ Baja latencia
- ✅ SDK bien documentado
- ✅ React Native support oficial
- ✅ Grabación de sesiones

**Contras:**
- ❌ Costo por minuto
- ❌ Setup inicial complejo

**Costo:** 
- Gratis: 10,000 min/mes
- Después: ~$0.99/1000 minutos

#### B) Twilio Video
**Pros:**
- ✅ Muy confiable
- ✅ Documentación excelente

**Contras:**
- ❌ Más caro que Agora
- ❌ Complejidad de setup

**Costo:** ~$0.004/min/participante

#### C) Stream Video
**Pros:**
- ✅ UI components incluidos
- ✅ Fácil integración

**Contras:**
- ❌ Relativamente nuevo
- ❌ Costo similar a Twilio

**Costo:** ~$0.005/min

#### D) Jitsi (Autohospedado)
**Pros:**
- ✅ Gratis
- ✅ Open source

**Contras:**
- ❌ Requiere servidor propio
- ❌ Mantenimiento
- ❌ Calidad variable

**Costo:** Servidor (~$20-50/mes)

### **Decisión Final**
✅ **Agora SDK**

**Justificación:**
- Mejor relación calidad/precio
- 10k minutos gratis suficiente para MVP
- Excelente calidad de video
- Escalable

**Alternativa:** Jitsi para PoC, migrar a Agora

---

## 3️⃣ Gestión de Estado

### Estado Actual
✅ **React Query + Zustand**

**React Query:**
- Gestión de estado servidor (API calls)
- Caché automático
- Refetch, retry, etc.

**Zustand:**
- Estado global UI (modales, tema, etc.)
- Simple, lightweight
- Menos boilerplate que Redux

### **Decisión Final**
✅ **Mantener React Query + Zustand**

**Justificación:**
- Ya implementado
- Funciona bien
- Comunidad activa
- Suficiente para nuestras necesidades

**Uso recomendado:**
```typescript
// React Query: Estado servidor
const { data } = useQuery(['citas', userId], fetchCitas);

// Zustand: Estado UI
const { theme, setTheme } = useUIStore();
```

---

## 4️⃣ Modo Offline

### Opciones Evaluadas

#### A) **React Query + AsyncStorage** ⭐ RECOMENDADO
**Pros:**
- ✅ Integrado con setup actual
- ✅ Simple
- ✅ Suficiente para mayoría de casos

**Contras:**
- ❌ Limitado a caché básico
- ❌ No persistencia completa

**Configuración:**
```typescript
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});
```

#### B) WatermelonDB
**Pros:**
- ✅ Base de datos completa
- ✅ Sync automático
- ✅ Muy performante

**Contras:**
- ❌ Complejidad alta
- ❌ Curva de aprendizaje
- ❌ Overkill para MVP

#### C) NetInfo + Caché Manual
**Pros:**
- ✅ Control total

**Contras:**
- ❌ Mucho código custom
- ❌ Propenso a bugs

### **Decisión Final**
✅ **React Query + AsyncStorage (Fase 1)**

**Justificación:**
- MVP no requiere offline completo
- Fácil implementación
- Migración futura posible a WatermelonDB

**Roadmap:**
- Fase 1: Caché básico con React Query
- Fase 2: Evaluar WatermelonDB si se necesita

---

## 5️⃣ Formularios

### Opciones Evaluadas

#### A) **React Hook Form + Zod** ⭐ RECOMENDADO
**Pros:**
- ✅ Performante (uncontrolled)
- ✅ Validación con Zod (type-safe)
- ✅ Menos renders
- ✅ Excelente DX

**Contras:**
- ❌ Curva de aprendizaje inicial

**Ejemplo:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  motivo: z.string().min(10),
  fecha: z.date(),
});

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

#### B) Formik
**Pros:**
- ✅ Popular
- ✅ Buena integración con Yup

**Contras:**
- ❌ Más renders
- ❌ Menos performante

### **Decisión Final**
✅ **React Hook Form + Zod**

**Justificación:**
- Mejor performance
- Type safety con Zod
- Menos código
- Estándar moderno

---

## 6️⃣ Manejo de Imágenes y Documentos

### Decisión
✅ **Expo Image Picker + Expo Document Picker**

**Implementación:**
```bash
expo install expo-image-picker expo-document-picker
```

**Justificación:**
- Oficial de Expo
- Maneja permisos automáticamente
- Compresión de imágenes incluida
- Cross-platform

**Uso:**
```typescript
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

// Imagen
const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
};

// Documento
const pickDocument = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
  });
};
```

---

## 7️⃣ Gráficas (Métricas de Salud)

### Opciones Evaluadas

#### A) **react-native-chart-kit** ⭐ RECOMENDADO
**Pros:**
- ✅ Simple
- ✅ Gráficas básicas cubiertas
- ✅ Personalizable

**Contras:**
- ❌ No muy avanzado

#### B) Victory Native
**Pros:**
- ✅ Muy customizable
- ✅ Animaciones

**Contras:**
- ❌ Bundle size grande
- ❌ Más complejo

#### C) Recharts Native
**Pros:**
- ✅ Popular en web

**Contras:**
- ❌ No optimizado para mobile

### **Decisión Final**
✅ **react-native-chart-kit**

**Justificación:**
- Suficiente para métricas básicas
- Lightweight
- Fácil de usar

---

## 8️⃣ Analytics

### Opciones

#### A) **Expo Analytics (básico)** ⭐ Fase 1
**Pros:**
- ✅ Simple
- ✅ Integrado

**Contras:**
- ❌ Limitado

#### B) Firebase Analytics (Fase 2)
**Pros:**
- ✅ Completo
- ✅ Gratis

**Contras:**
- ❌ Setup complejo

### **Decisión Final**
✅ **Expo Analytics para MVP, migrar a Firebase después**

---

## 9️⃣ Biometría (Face ID / Touch ID)

### Decisión
✅ **expo-local-authentication**

**Implementación:**
```bash
expo install expo-local-authentication
```

**Uso:**
```typescript
import * as LocalAuthentication from 'expo-local-authentication';

const authenticate = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  
  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autenticarse con biometría',
    });
    return result.success;
  }
  return false;
};
```

**Prioridad:** ⭐ (Nice to have, no crítico)

---

## 🔐 Seguridad

### Almacenamiento Seguro
✅ **expo-secure-store** (ya implementado)

### Validación de Inputs
✅ **Zod** (recomendado)

### Sanitización
✅ Validar en backend siempre

---

## 📦 Dependencias Completas Recomendadas

```json
{
  "dependencies": {
    "expo": "^51.0.0",
    "react-native": "0.74.0",
    "expo-router": "^3.5.0",
    "@tanstack/react-query": "^5.48.0",
    "@supabase/supabase-js": "^2.45.0",
    "nativewind": "^4.0.36",
    
    "@expo/vector-icons": "^14.0.0",
    "expo-notifications": "~0.27.0",
    "expo-image-picker": "~14.7.0",
    "expo-document-picker": "~11.10.0",
    "expo-local-authentication": "~13.8.0",
    
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    
    "date-fns": "^2.30.0",
    "zustand": "^4.4.0",
    "react-native-chart-kit": "^6.12.0",
    
    "@tanstack/query-async-storage-persister": "^5.0.0",
    "react-native-netinfo": "^11.1.0"
  },
  "devDependencies": {
    "@tanstack/eslint-plugin-query": "^5.20.0"
  }
}
```

---

## 🚀 Plan de Adopción

### Semana 1
- ✅ React Hook Form + Zod
- ✅ Expo Image/Document Pickers
- ✅ Zustand (si aún no está)

### Semana 2
- ✅ Expo Notifications

### Semana 3-4
- ✅ Agora SDK (Telemedicina)

### Semana 5-6
- ✅ Chart Kit (Métricas)
- ✅ Local Authentication

---

## 📝 Notas Finales

**Principio Guía:**
> "Usar soluciones nativas de Expo cuando sea posible, librerías third-party solo cuando agreguen valor significativo"

**Evitar:**
- Over-engineering
- Dependencias innecesarias
- Vendor lock-in cuando sea evitable

**Priorizar:**
- Simplicidad
- Mantenibilidad
- Developer Experience
- Performance

---

**Última actualización:** 12/11/2025  
**Próxima revisión:** Al iniciar cada fase  
**Responsable:** Tech Lead Mobile
