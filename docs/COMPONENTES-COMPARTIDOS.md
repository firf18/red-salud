# Componentes Compartidos Dashboard

Este documento describe los componentes que se comparten entre el dashboard de paciente y médico para evitar duplicación de código.

## 📁 Estructura de Componentes Compartidos

### `/components/dashboard/profile/tabs/`

Estos tabs se reutilizan en ambos dashboards (paciente y médico):

#### ✅ Tabs Implementados y Compartidos

1. **PreferencesTab** (`preferences-tab.tsx`)
   - Configuración de idioma (ES, EN, PT, FR, IT)
   - Zona horaria
   - Tema (claro/oscuro)
   - Notificaciones de escritorio y sonido
   - Método de contacto preferido
   - Suscripciones (newsletter, promociones, encuestas)
   - **Usado en**: Paciente y Médico

2. **SecurityTabNew** (`security-tab-new.tsx`)
   - Cambio de contraseña
   - Autenticación de dos factores (2FA)
   - Verificación de email
   - Verificación de teléfono
   - Preguntas de seguridad
   - Sesiones activas
   - Historial de seguridad
   - Notificaciones de seguridad
   - **Usado en**: Paciente y Médico

3. **PrivacyTab** (`privacy-tab.tsx`)
   - Control de privacidad de datos
   - Permisos de compartir información
   - Configuración de visibilidad
   - **Usado en**: Paciente y Médico

4. **ActivityTab** (`activity-tab.tsx`)
   - Historial de actividad del usuario
   - Registro de acciones
   - **Usado en**: Paciente y Médico

5. **BillingTab** (`billing-tab.tsx`)
   - Información de facturación
   - Métodos de pago
   - Historial de transacciones
   - **Usado en**: Paciente y Médico

## 🎯 Implementación en Dashboards

### Dashboard Paciente
**Ubicación**: `/app/dashboard/paciente/configuracion/page-new.tsx`

Tabs disponibles:
- Mi Perfil (específico del paciente)
- Info. Médica (específico del paciente)
- Documentos (específico del paciente)
- **Seguridad** ✅ (compartido)
- **Preferencias** ✅ (compartido)
- **Privacidad** ✅ (compartido)
- **Actividad** ✅ (compartido)
- **Facturación** ✅ (compartido)

### Dashboard Médico
**Ubicación**: `/app/dashboard/medico/configuracion/page.tsx`

Tabs disponibles:
- Mi Perfil (en desarrollo - específico del médico)
- **Preferencias** ✅ (compartido)
- **Seguridad** ✅ (compartido)
- **Privacidad** ✅ (compartido)
- **Actividad** ✅ (compartido)
- **Facturación** ✅ (compartido)

## 🔧 Contextos Compartidos

### PreferencesContext
**Ubicación**: `/lib/contexts/preferences-context.tsx`

Maneja las preferencias del usuario:
- Idioma
- Zona horaria
- Tema
- Notificaciones
- Método de contacto
- Suscripciones

**Tabla en BD**: `user_preferences`

## 🎨 Componentes UI Compartidos

Todos los componentes de shadcn/ui en `/components/ui/`:
- Button
- Card
- Input
- Label
- Switch
- Tabs
- Select
- Textarea
- Table
- Badge
- Avatar
- Dialog
- Alert
- Toast
- Command
- Popover
- TimezoneSelect

## 📊 Hooks Compartidos

### `use-auth.ts`
Autenticación y datos del usuario actual

### `use-i18n.ts`
Internacionalización y traducciones

### `use-theme-color.ts`
Gestión del tema de color

## 🚀 Ventajas de la Arquitectura Compartida

1. **DRY (Don't Repeat Yourself)**: Un solo lugar para mantener la lógica
2. **Consistencia**: Misma experiencia en ambos dashboards
3. **Mantenibilidad**: Cambios en un lugar se reflejan en todos
4. **Escalabilidad**: Fácil agregar nuevos roles (admin, etc.)
5. **Testing**: Probar una vez, funciona en todos lados

## 📝 Componentes Específicos por Rol

### Solo Paciente
- `ProfileTab` - Información personal del paciente
- `MedicalTab` - Historial médico
- `DocumentsTab` - Documentos médicos
- Módulos de citas, laboratorio, medicamentos, etc.

### Solo Médico
- Perfil profesional (en desarrollo)
- Gestión de pacientes
- Agenda médica
- Recetas
- Estadísticas
- Telemedicina

## 🔄 Flujo de Datos

```
Usuario → Dashboard (Paciente/Médico)
    ↓
Tabs Compartidos (Preferencias, Seguridad, etc.)
    ↓
Contextos (PreferencesContext, AuthContext)
    ↓
Supabase (user_preferences, profiles, etc.)
```

## 📦 Próximos Pasos

1. ✅ Implementar tabs compartidos en dashboard médico
2. ⏳ Crear tab de perfil profesional específico para médicos
3. ⏳ Agregar configuración de agenda médica
4. ⏳ Implementar gestión de tarifas y servicios
5. ⏳ Crear dashboard admin con tabs compartidos

## 🎯 Mejores Prácticas

1. **Siempre usar tabs compartidos** cuando la funcionalidad es común
2. **Crear tabs específicos** solo cuando la lógica es única del rol
3. **Mantener la UI consistente** entre dashboards
4. **Documentar cambios** en componentes compartidos
5. **Probar en ambos dashboards** al modificar componentes compartidos
