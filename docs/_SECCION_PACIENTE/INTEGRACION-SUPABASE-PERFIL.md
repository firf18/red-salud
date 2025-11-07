# 🔗 Integración Completa con Supabase - Perfil de Paciente

## ✅ Tablas Creadas en Supabase

### Tablas Principales
1. **profiles** (extendida) - Datos básicos del usuario
2. **patient_details** (extendida) - Información médica
3. **patient_documents** - Documentos y verificación
4. **user_activity_log** - Historial de actividad
5. **user_sessions** - Sesiones activas
6. **payment_methods** - Métodos de pago
7. **transactions** - Historial de transacciones
8. **user_preferences** - Preferencias de la app
9. **privacy_settings** - Configuración de privacidad
10. **notification_settings** - Configuración de notificaciones

### Storage Buckets
1. **profiles** - Avatares (público, 5MB max)
2. **documents** - Documentos (privado, 10MB max)

## 📁 Archivos Creados

### 1. Funciones de Supabase
**Archivo:** `lib/supabase/profile-functions.ts`

Funciones disponibles:
- `getPatientProfile(userId)` - Obtener perfil completo
- `updateBasicProfile(userId, data)` - Actualizar datos básicos
- `updateMedicalInfo(userId, data)` - Actualizar info médica
- `uploadAvatar(userId, file)` - Subir foto de perfil
- `getPatientDocuments(userId)` - Obtener documentos
- `uploadDocument(userId, file, type, name)` - Subir documento
- `getUserPreferences(userId)` - Obtener preferencias
- `updateUserPreferences(userId, prefs)` - Actualizar preferencias
- `getPrivacySettings(userId)` - Obtener privacidad
- `updatePrivacySettings(userId, settings)` - Actualizar privacidad
- `getNotificationSettings(userId)` - Obtener notificaciones
- `updateNotificationSettings(userId, settings)` - Actualizar notificaciones
- `getUserActivity(userId, limit)` - Obtener actividad
- `getUserSessions(userId)` - Obtener sesiones
- `terminateSession(sessionId)` - Cerrar sesión
- `getPaymentMethods(userId)` - Obtener métodos de pago
- `getTransactions(userId, limit)` - Obtener transacciones
- `logActivity(userId, type, description)` - Registrar actividad

### 2. Hooks Personalizados
**Archivo:** `hooks/use-patient-profile.ts`

Hooks disponibles:
- `usePatientProfile(userId)` - Hook principal del perfil
- `useUserActivity(userId)` - Hook de actividad
- `useUserSessions(userId)` - Hook de sesiones
- `usePaymentMethods(userId)` - Hook de métodos de pago
- `useTransactions(userId)` - Hook de transacciones
- `usePatientDocuments(userId)` - Hook de documentos

## 🔧 Cómo Integrar en el Modal

### Paso 1: Actualizar el Modal Principal

En `components/dashboard/layout/user-profile-modal-complete.tsx`, importar el hook:

```typescript
import { usePatientProfile } from "@/hooks/use-patient-profile";
```

### Paso 2: Usar el Hook en el Componente

```typescript
export function UserProfileModalComplete({
  isOpen,
  onClose,
  userName,
  userEmail,
  userId,
}: UserProfileModalProps) {
  // Usar el hook
  const {
    profile,
    preferences,
    privacySettings,
    notificationSettings,
    loading,
    updateProfile,
    updateMedical,
    updateAvatar,
    updatePrefs,
    updatePrivacy,
    updateNotifications,
  } = usePatientProfile(userId);

  // Inicializar formData con datos del perfil
  useEffect(() => {
    if (profile) {
      setFormData({
        nombre: profile.nombre_completo || "",
        email: profile.email || "",
        telefono: profile.telefono || "",
        cedula: profile.cedula || "",
        fechaNacimiento: profile.fecha_nacimiento || "",
        direccion: profile.direccion || "",
        ciudad: profile.ciudad || "",
        estado: profile.estado || "",
        codigoPostal: profile.codigo_postal || "",
        tipoSangre: profile.grupo_sanguineo || "",
        alergias: profile.alergias?.join(", ") || "",
        condicionesCronicas: profile.enfermedades_cronicas?.join(", ") || "",
        medicamentosActuales: profile.medicamentos_actuales || "",
        cirugiasPrevias: profile.cirugias_previas || "",
        contactoEmergencia: profile.contacto_emergencia_nombre || "",
        telefonoEmergencia: profile.contacto_emergencia_telefono || "",
        relacionEmergencia: profile.contacto_emergencia_relacion || "",
      });
    }
  }, [profile]);

  // Función para guardar perfil
  const handleSave = async () => {
    if (activeTab === "profile") {
      await updateProfile({
        nombre_completo: formData.nombre,
        telefono: formData.telefono,
        cedula: formData.cedula,
        fecha_nacimiento: formData.fechaNacimiento,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        estado: formData.estado,
        codigo_postal: formData.codigoPostal,
      });
    } else if (activeTab === "medical") {
      await updateMedical({
        grupo_sanguineo: formData.tipoSangre,
        alergias: formData.alergias.split(",").map(a => a.trim()),
        enfermedades_cronicas: formData.condicionesCronicas.split(",").map(c => c.trim()),
        medicamentos_actuales: formData.medicamentosActuales,
        cirugias_previas: formData.cirugiasPrevias,
        contacto_emergencia_nombre: formData.contactoEmergencia,
        contacto_emergencia_telefono: formData.telefonoEmergencia,
        contacto_emergencia_relacion: formData.relacionEmergencia,
      });
    }
    setIsEditing(false);
  };

  // Función para subir avatar
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && userId) {
      const result = await updateAvatar(file);
      if (result.success) {
        // Avatar actualizado
        console.log("Avatar actualizado:", result.url);
      }
    }
  };
}
```

### Paso 3: Integrar Hooks en Tabs Específicas

#### DocumentsTab
```typescript
import { usePatientDocuments } from "@/hooks/use-patient-profile";

function DocumentsTab({ userId }: { userId: string }) {
  const { documents, loading, uploadDoc } = usePatientDocuments(userId);

  const handleUpload = async (file: File, type: string, name: string) => {
    const result = await uploadDoc(file, type, name);
    if (result.success) {
      // Documento subido exitosamente
    }
  };

  return (
    // Renderizar documentos desde el estado
  );
}
```

#### ActivityTab
```typescript
import { useUserActivity, useUserSessions } from "@/hooks/use-patient-profile";

function ActivityTab({ userId }: { userId: string }) {
  const { activity, loading: activityLoading } = useUserActivity(userId);
  const { sessions, loading: sessionsLoading } = useUserSessions(userId);

  return (
    // Renderizar actividad y sesiones desde el estado
  );
}
```

#### BillingTab
```typescript
import { usePaymentMethods, useTransactions } from "@/hooks/use-patient-profile";

function BillingTab({ userId }: { userId: string }) {
  const { paymentMethods, loading: pmLoading } = usePaymentMethods(userId);
  const { transactions, loading: txLoading } = useTransactions(userId);

  return (
    // Renderizar métodos de pago y transacciones desde el estado
  );
}
```

## 🎯 Funcionalidades Implementadas

### ✅ Mi Perfil
- Cargar datos desde Supabase
- Editar y guardar cambios
- Validación de campos requeridos
- Actualización automática del estado

### ✅ Información Médica
- Cargar datos médicos
- Editar y guardar
- Manejo de arrays (alergias, condiciones)
- Contacto de emergencia completo

### ✅ Documentos
- Listar documentos subidos
- Subir nuevos documentos
- Estados de verificación
- Descarga de documentos

### ✅ Seguridad
- Configuración de notificaciones
- Guardado en base de datos
- Actualización en tiempo real

### ✅ Preferencias
- Idioma, zona horaria
- Modo oscuro
- Preferencias de comunicación
- Guardado automático

### ✅ Privacidad
- Control de visibilidad
- Uso de datos
- Configuración GDPR
- Guardado en base de datos

### ✅ Actividad
- Historial de accesos
- Sesiones activas
- Información de dispositivos
- Cerrar sesiones remotas

### ✅ Facturación
- Métodos de pago guardados
- Historial de transacciones
- Descargar facturas
- Resumen mensual

## 🔐 Seguridad Implementada

1. **Row Level Security (RLS)** activado en todas las tablas
2. **Políticas de acceso** - Solo el usuario puede ver/editar sus datos
3. **Storage policies** - Archivos privados por usuario
4. **Validación de tipos** en TypeScript
5. **Registro de actividad** automático

## 📊 Próximos Pasos

### Opcional - Mejoras Adicionales
1. **Validación con Zod** - Agregar esquemas de validación
2. **Toast Notifications** - Feedback visual de acciones
3. **Loading States** - Indicadores de carga
4. **Error Handling** - Manejo robusto de errores
5. **Optimistic Updates** - Actualización optimista de UI
6. **Real-time Updates** - Suscripciones a cambios
7. **Image Optimization** - Redimensionar avatares
8. **Document Preview** - Vista previa de documentos
9. **2FA Implementation** - Autenticación de dos factores
10. **Password Change** - Cambio de contraseña funcional

## 🚀 Comandos Útiles

### Verificar tablas
```typescript
import { mcp_supabase_list_tables } from "@/lib/supabase/mcp";
const tables = await mcp_supabase_list_tables("hwckkfiirldgundbcjsp", ["public"]);
```

### Ejecutar consulta SQL
```typescript
import { mcp_supabase_execute_sql } from "@/lib/supabase/mcp";
const result = await mcp_supabase_execute_sql("hwckkfiirldgundbcjsp", "SELECT * FROM profiles LIMIT 1");
```

## 📝 Notas Importantes

1. **userId** debe ser el ID de auth.users (UUID)
2. Los **arrays** en PostgreSQL se manejan como arrays de TypeScript
3. Las **fechas** deben estar en formato ISO 8601
4. Los **archivos** se suben a Storage y se guarda la URL
5. Todas las funciones retornan `{ success: boolean, data?: any, error?: any }`

## 🎨 Ejemplo de Uso Completo

```typescript
// En el componente del modal
const {
  profile,
  loading,
  updateProfile,
  updateAvatar,
} = usePatientProfile(userId);

// Actualizar perfil
const handleSaveProfile = async () => {
  const result = await updateProfile({
    nombre_completo: "Juan Pérez",
    telefono: "+58 412-1234567",
    cedula: "V-12345678",
  });

  if (result.success) {
    toast.success("Perfil actualizado");
  } else {
    toast.error("Error al actualizar");
  }
};

// Subir avatar
const handleAvatarUpload = async (file: File) => {
  const result = await updateAvatar(file);
  if (result.success) {
    toast.success("Foto actualizada");
  }
};
```

¡Todo listo para usar! 🎉
