# Sistema de Configuración - Red-Salud

## Descripción General

Sistema completo de configuración de usuario que permite a los pacientes gestionar su perfil personal, información médica, preferencias de la aplicación, notificaciones y privacidad.

## Características Principales

### 1. Perfil Personal
- Información básica del usuario
- Foto de perfil
- Datos de contacto
- Dirección completa
- Cédula de identidad

### 2. Información Médica
- Grupo sanguíneo
- Peso y altura
- Alergias
- Enfermedades crónicas
- Medicamentos actuales
- Cirugías previas
- Contacto de emergencia

### 3. Preferencias de Aplicación
- Modo oscuro
- Idioma (Español/Inglés)
- Zona horaria
- Notificaciones de escritorio
- Sonidos de notificación
- Método de contacto preferido
- Suscripciones (boletín, promociones, encuestas)

### 4. Notificaciones
- Alertas de inicio de sesión
- Cambios en la cuenta
- Recordatorios de citas
- Resultados de laboratorio
- Mensajes de doctores

### 5. Privacidad
- Perfil público/privado
- Compartir historial médico
- Mostrar foto de perfil
- Compartir ubicación
- Datos anónimos para investigación
- Cookies de análisis

## Estructura de Base de Datos

### Tablas Utilizadas

#### `profiles`
Información básica del usuario.

```sql
- id: UUID (PK)
- email: TEXT (único)
- nombre_completo: TEXT
- telefono: TEXT
- fecha_nacimiento: DATE
- direccion: TEXT
- ciudad: VARCHAR
- estado: VARCHAR
- codigo_postal: VARCHAR
- cedula: VARCHAR
- avatar_url: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### `patient_details`
Información médica específica del paciente.

```sql
- id: UUID (PK)
- profile_id: UUID (FK, único)
- grupo_sanguineo: VARCHAR
- alergias: TEXT[]
- peso_kg: NUMERIC
- altura_cm: INTEGER
- enfermedades_cronicas: TEXT[]
- medicamentos_actuales: TEXT
- cirugias_previas: TEXT
- contacto_emergencia_nombre: VARCHAR
- contacto_emergencia_telefono: VARCHAR
- contacto_emergencia_relacion: VARCHAR
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### `user_preferences`
Preferencias de la aplicación.

```sql
- id: UUID (PK)
- user_id: UUID (FK, único)
- language: VARCHAR (default: 'es')
- timezone: VARCHAR (default: 'America/Caracas')
- dark_mode: BOOLEAN (default: false)
- desktop_notifications: BOOLEAN (default: true)
- sound_notifications: BOOLEAN (default: true)
- preferred_contact_method: VARCHAR (default: 'email')
- newsletter_subscribed: BOOLEAN (default: false)
- promotions_subscribed: BOOLEAN (default: true)
- surveys_subscribed: BOOLEAN (default: true)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### `notification_settings`
Configuración de notificaciones.

```sql
- id: UUID (PK)
- user_id: UUID (FK, único)
- login_alerts: BOOLEAN (default: true)
- account_changes: BOOLEAN (default: true)
- appointment_reminders: BOOLEAN (default: true)
- lab_results: BOOLEAN (default: true)
- doctor_messages: BOOLEAN (default: true)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### `privacy_settings`
Configuración de privacidad.

```sql
- id: UUID (PK)
- user_id: UUID (FK, único)
- profile_public: BOOLEAN (default: true)
- share_medical_history: BOOLEAN (default: true)
- show_profile_photo: BOOLEAN (default: true)
- share_location: BOOLEAN (default: false)
- anonymous_data_research: BOOLEAN (default: false)
- analytics_cookies: BOOLEAN (default: true)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Flujo de Uso

### Para Pacientes

1. **Acceder a Configuración**
   - Ir a Dashboard → Configuración
   - Ver todas las secciones disponibles

2. **Actualizar Perfil Personal**
   - Editar nombre, teléfono, dirección
   - Cambiar foto de perfil
   - Actualizar cédula y datos de contacto
   - Guardar cambios

3. **Gestionar Información Médica**
   - Actualizar grupo sanguíneo
   - Registrar alergias y enfermedades
   - Listar medicamentos actuales
   - Agregar contacto de emergencia
   - Guardar información

4. **Configurar Preferencias**
   - Activar/desactivar modo oscuro
   - Cambiar idioma y zona horaria
   - Configurar notificaciones
   - Gestionar suscripciones
   - Guardar preferencias

5. **Ajustar Notificaciones**
   - Activar alertas importantes
   - Configurar recordatorios
   - Gestionar notificaciones de mensajes
   - Guardar configuración

6. **Controlar Privacidad**
   - Definir visibilidad del perfil
   - Controlar acceso al historial médico
   - Gestionar permisos de ubicación
   - Configurar cookies
   - Guardar configuración

## Componentes UI

### Página Principal

**`/dashboard/paciente/configuracion`**
- Tabs para cada sección
- Formularios interactivos
- Switches para opciones booleanas
- Selects para opciones múltiples
- Botones de guardar por sección
- Mensajes de éxito/error

### Secciones

1. **Perfil**
   - Avatar con opción de cambio
   - Campos de texto para información personal
   - Textarea para dirección
   - Validación de campos requeridos

2. **Médico**
   - Select para grupo sanguíneo
   - Inputs numéricos para peso/altura
   - Textareas para listas (alergias, enfermedades)
   - Sección especial para contacto de emergencia

3. **Preferencias**
   - Switches para opciones on/off
   - Selects para idioma y zona horaria
   - Sección de suscripciones

4. **Notificaciones**
   - Lista de switches con descripciones
   - Agrupación lógica de notificaciones

5. **Privacidad**
   - Switches para cada opción de privacidad
   - Descripciones claras de cada configuración

## Seguridad (RLS)

### Políticas Implementadas

**profiles:**
- Usuarios solo pueden ver y editar su propio perfil
- Email no es editable (solo lectura)

**patient_details:**
- Usuarios solo acceden a sus propios detalles médicos
- Doctores pueden ver detalles con permiso

**user_preferences:**
- Usuarios solo gestionan sus propias preferencias

**notification_settings:**
- Usuarios solo configuran sus propias notificaciones

**privacy_settings:**
- Usuarios solo controlan su propia privacidad

## Validaciones

### Campos Requeridos
- Nombre completo (perfil)
- Email (no editable)

### Validaciones de Formato
- Email: formato válido
- Teléfono: números y caracteres especiales
- Fecha de nacimiento: formato de fecha
- Peso: número positivo
- Altura: número entero positivo
- Código postal: formato numérico

### Validaciones de Negocio
- Fecha de nacimiento no puede ser futura
- Peso debe estar en rango razonable (20-300 kg)
- Altura debe estar en rango razonable (50-250 cm)
- Contacto de emergencia debe tener nombre y teléfono

## Registro de Actividad

Todas las actualizaciones importantes se registran en `user_activity_log`:

```typescript
{
  user_id: string,
  activity_type: "profile_updated" | "preferences_updated" | "settings_updated",
  description: string,
  status: "success" | "error",
  created_at: timestamp
}
```

## Integración con Otros Sistemas

### Sistema de Notificaciones
- Configuración de notificaciones afecta alertas en toda la app
- Preferencias de contacto determinan canal de comunicación

### Sistema de Citas
- Información de contacto usada para recordatorios
- Zona horaria afecta visualización de horarios

### Sistema de Telemedicina
- Foto de perfil visible en videollamadas
- Información médica accesible durante consultas

### Historial Clínico
- Información médica integrada en historial
- Alergias y enfermedades visibles para doctores

## Mejores Prácticas

### Para Pacientes

1. **Mantén tu información actualizada**
   - Revisa tu perfil regularmente
   - Actualiza medicamentos actuales
   - Verifica datos de contacto

2. **Configura notificaciones importantes**
   - Activa recordatorios de citas
   - Habilita alertas de resultados
   - Configura mensajes de doctores

3. **Protege tu privacidad**
   - Revisa configuración de privacidad
   - Controla quién ve tu información
   - Gestiona permisos de ubicación

4. **Información de emergencia**
   - Mantén contacto de emergencia actualizado
   - Verifica que el teléfono sea correcto
   - Indica relación claramente

### Para Desarrolladores

1. **Validación de datos**
   - Validar en cliente y servidor
   - Mensajes de error claros
   - Prevenir datos inválidos

2. **Seguridad**
   - Usar RLS en todas las tablas
   - Validar permisos en cada operación
   - Sanitizar inputs del usuario

3. **Experiencia de usuario**
   - Guardar por sección (no todo junto)
   - Mostrar mensajes de éxito/error
   - Indicar campos requeridos

4. **Performance**
   - Cargar datos solo cuando sea necesario
   - Usar upsert para crear/actualizar
   - Optimizar queries

## Próximas Mejoras

### Corto Plazo
- [ ] Subida de foto de perfil funcional
- [ ] Validación de cédula venezolana
- [ ] Exportar configuración
- [ ] Importar configuración

### Mediano Plazo
- [ ] Autenticación de dos factores
- [ ] Gestión de sesiones activas
- [ ] Historial de cambios
- [ ] Verificación de email/teléfono

### Largo Plazo
- [ ] Integración con wearables
- [ ] Sincronización multi-dispositivo
- [ ] Backup automático
- [ ] Recuperación de cuenta

## Testing

### Casos de Prueba

1. **Actualizar Perfil**
   - Cambiar nombre y guardar
   - Verificar actualización en BD
   - Confirmar mensaje de éxito

2. **Información Médica**
   - Agregar alergias
   - Actualizar peso/altura
   - Guardar contacto de emergencia

3. **Preferencias**
   - Activar modo oscuro
   - Cambiar idioma
   - Verificar aplicación inmediata

4. **Notificaciones**
   - Desactivar notificación
   - Verificar que no se envíe
   - Reactivar y confirmar envío

5. **Privacidad**
   - Hacer perfil privado
   - Verificar restricción de acceso
   - Restaurar configuración

## Soporte

Para problemas o preguntas:
- Revisar logs de actividad
- Verificar políticas RLS
- Consultar documentación de Supabase

## Licencia

Propiedad de Red-Salud © 2025
