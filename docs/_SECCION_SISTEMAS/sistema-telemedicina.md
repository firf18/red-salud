# Sistema de Telemedicina - Red-Salud

## Descripción General

Sistema completo de videoconsultas médicas que permite a pacientes y doctores realizar consultas en tiempo real a través de videollamadas, con funcionalidades de chat, grabación, recetas digitales y sala de espera virtual.

## Características Principales

### 1. Sesiones de Videoconsulta
- Videollamadas en tiempo real entre paciente y doctor
- Control de cámara, micrófono y compartir pantalla
- Grabación opcional de sesiones
- Indicadores de calidad de conexión
- Notas de sesión

### 2. Sala de Espera Virtual
- Sistema de cola para pacientes
- Priorización de consultas (baja, normal, alta, urgente)
- Tiempo de espera calculado automáticamente
- Notificaciones cuando el doctor está listo

### 3. Chat en Vivo
- Mensajes de texto durante la consulta
- Compartir archivos
- Historial de mensajes
- Indicadores de lectura

### 4. Recetas Digitales
- Generación de recetas durante la consulta
- Múltiples medicamentos por receta
- Instrucciones detalladas
- Firma digital del doctor
- Fecha de validez

### 5. Grabaciones
- Grabación automática o manual
- Acceso controlado (paciente/doctor)
- Fecha de expiración
- Almacenamiento seguro

## Estructura de Base de Datos

### Tablas Principales

#### `telemedicine_sessions`
Almacena las sesiones de videoconsulta.

```sql
- id: UUID (PK)
- appointment_id: UUID (FK a appointments)
- patient_id: UUID (FK a auth.users)
- doctor_id: UUID (FK a auth.users)
- session_token: TEXT (único)
- room_name: TEXT (único)
- status: TEXT (scheduled, waiting, active, completed, cancelled, failed)
- scheduled_start_time: TIMESTAMPTZ
- actual_start_time: TIMESTAMPTZ
- end_time: TIMESTAMPTZ
- duration_minutes: INTEGER
- video_enabled: BOOLEAN
- audio_enabled: BOOLEAN
- screen_sharing_enabled: BOOLEAN
- recording_enabled: BOOLEAN
- connection_quality: TEXT (excellent, good, fair, poor)
- session_notes: TEXT
- technical_issues: TEXT
- metadata: JSONB
```

#### `telemedicine_participants`
Participantes en cada sesión.

```sql
- id: UUID (PK)
- session_id: UUID (FK)
- user_id: UUID (FK)
- role: TEXT (patient, doctor, observer)
- connection_status: TEXT (disconnected, connecting, connected, reconnecting)
- joined_at: TIMESTAMPTZ
- left_at: TIMESTAMPTZ
- total_duration_minutes: INTEGER
- video_enabled: BOOLEAN
- audio_enabled: BOOLEAN
- screen_sharing: BOOLEAN
- device_info: JSONB
```

#### `telemedicine_chat_messages`
Mensajes de chat durante la consulta.

```sql
- id: UUID (PK)
- session_id: UUID (FK)
- sender_id: UUID (FK)
- message: TEXT
- message_type: TEXT (text, file, system)
- file_url: TEXT
- file_name: TEXT
- file_size: INTEGER
- file_type: TEXT
- is_read: BOOLEAN
- metadata: JSONB
```

#### `telemedicine_prescriptions`
Recetas generadas durante la consulta.

```sql
- id: UUID (PK)
- session_id: UUID (FK)
- patient_id: UUID (FK)
- doctor_id: UUID (FK)
- prescription_number: TEXT (único)
- diagnosis: TEXT
- medications: JSONB (array de medicamentos)
- instructions: TEXT
- notes: TEXT
- valid_from: DATE
- valid_until: DATE
- status: TEXT (active, used, expired, cancelled)
- digital_signature: TEXT
- signed_at: TIMESTAMPTZ
```

#### `telemedicine_recordings`
Grabaciones de sesiones.

```sql
- id: UUID (PK)
- session_id: UUID (FK)
- recording_url: TEXT
- file_size_mb: DECIMAL
- duration_minutes: INTEGER
- status: TEXT (processing, available, expired, deleted)
- is_available_to_patient: BOOLEAN
- is_available_to_doctor: BOOLEAN
- expires_at: TIMESTAMPTZ
- metadata: JSONB
```

#### `telemedicine_waiting_room`
Sala de espera virtual.

```sql
- id: UUID (PK)
- session_id: UUID (FK)
- patient_id: UUID (FK)
- status: TEXT (waiting, called, admitted, left)
- entered_at: TIMESTAMPTZ
- called_at: TIMESTAMPTZ
- admitted_at: TIMESTAMPTZ
- left_at: TIMESTAMPTZ
- wait_time_minutes: INTEGER
- reason_for_visit: TEXT
- priority: TEXT (low, normal, high, urgent)
```

## Flujo de Uso

### Para Pacientes

1. **Agendar Consulta**
   - Ir a "Citas" → "Nueva Cita"
   - Seleccionar tipo "Videoconsulta"
   - Elegir doctor y horario
   - Confirmar cita

2. **Antes de la Consulta**
   - Recibir notificación de cita próxima
   - Revisar información del doctor
   - Preparar preguntas o síntomas

3. **Durante la Consulta**
   - Entrar a sala de espera 5-10 minutos antes
   - Esperar a que el doctor admita
   - Iniciar videollamada
   - Usar chat si es necesario
   - Tomar notas personales

4. **Después de la Consulta**
   - Revisar receta digital (si aplica)
   - Descargar grabación (si está habilitada)
   - Ver resumen de la consulta
   - Agendar seguimiento si es necesario

### Para Doctores

1. **Preparar Consulta**
   - Revisar historial del paciente
   - Verificar motivo de consulta
   - Preparar documentos necesarios

2. **Sala de Espera**
   - Ver pacientes en espera
   - Priorizar según urgencia
   - Admitir paciente a la sesión

3. **Durante la Consulta**
   - Realizar diagnóstico
   - Tomar notas médicas
   - Generar receta si es necesario
   - Compartir pantalla para explicaciones

4. **Finalizar Consulta**
   - Guardar notas de sesión
   - Enviar receta al paciente
   - Programar seguimiento
   - Completar sesión

## API / Servicios

### Servicios Principales

#### `telemedicine-service.ts`

**Sesiones:**
- `createTelemedicineSession()` - Crear nueva sesión
- `getPatientSessions()` - Obtener sesiones del paciente
- `getDoctorSessions()` - Obtener sesiones del doctor
- `getSession()` - Obtener sesión específica
- `updateSession()` - Actualizar sesión
- `startSession()` - Iniciar sesión
- `endSession()` - Finalizar sesión

**Participantes:**
- `joinSession()` - Unirse a sesión
- `leaveSession()` - Salir de sesión
- `getSessionParticipants()` - Obtener participantes

**Chat:**
- `sendMessage()` - Enviar mensaje
- `getSessionMessages()` - Obtener mensajes
- `markMessagesAsRead()` - Marcar como leídos

**Recetas:**
- `createPrescription()` - Crear receta
- `getPatientPrescriptions()` - Obtener recetas del paciente
- `getSessionPrescriptions()` - Obtener recetas de sesión

**Sala de Espera:**
- `enterWaitingRoom()` - Entrar a sala de espera
- `getWaitingRoomPatients()` - Obtener pacientes en espera
- `admitPatient()` - Admitir paciente

**Estadísticas:**
- `getPatientSessionStats()` - Estadísticas del paciente

### Hooks Personalizados

#### `use-telemedicine.ts`

- `usePatientSessions()` - Sesiones del paciente
- `useDoctorSessions()` - Sesiones del doctor
- `useSession()` - Sesión específica
- `useCreateSession()` - Crear sesión
- `useActiveSession()` - Gestionar sesión activa
- `useSessionParticipants()` - Participantes
- `useSessionChat()` - Chat de sesión
- `usePatientPrescriptions()` - Recetas del paciente
- `useCreatePrescription()` - Crear receta
- `useWaitingRoom()` - Sala de espera (paciente)
- `useDoctorWaitingRoom()` - Sala de espera (doctor)
- `useSessionStats()` - Estadísticas

## Componentes UI

### Páginas

1. **`/dashboard/paciente/telemedicina`**
   - Lista de sesiones (próximas e historial)
   - Estadísticas de uso
   - Botón para nueva consulta

2. **`/dashboard/paciente/telemedicina/sesion/[id]`**
   - Interfaz de videollamada
   - Controles de audio/video
   - Chat en vivo
   - Notas de sesión
   - Lista de participantes

## Seguridad (RLS)

### Políticas Implementadas

**telemedicine_sessions:**
- Usuarios solo ven sus propias sesiones (como paciente o doctor)
- Doctores pueden crear sesiones
- Participantes pueden actualizar sesiones

**telemedicine_participants:**
- Usuarios ven participantes de sus sesiones
- Sistema puede insertar participantes
- Participantes actualizan su propio estado

**telemedicine_chat_messages:**
- Usuarios ven mensajes de sus sesiones
- Participantes pueden enviar mensajes

**telemedicine_recordings:**
- Usuarios ven grabaciones según permisos
- Control de acceso por rol

**telemedicine_prescriptions:**
- Pacientes y doctores ven sus recetas
- Solo doctores pueden crear/actualizar

**telemedicine_waiting_room:**
- Pacientes ven su entrada
- Doctores ven pacientes en su sala de espera

## Triggers Automáticos

1. **`update_telemedicine_updated_at`**
   - Actualiza `updated_at` en todas las tablas

2. **`calculate_session_duration`**
   - Calcula duración al completar sesión

3. **`calculate_wait_time`**
   - Calcula tiempo de espera al admitir paciente

## Integración con Otros Sistemas

### Sistema de Citas
- Sesiones vinculadas a citas existentes
- Sincronización de horarios
- Actualización de estado de cita

### Sistema de Mensajería
- Notificaciones de sesión próxima
- Recordatorios automáticos
- Alertas de sala de espera

### Sistema de Medicamentos
- Recetas digitales integradas
- Recordatorios de medicación
- Historial de prescripciones

### Historial Clínico
- Notas de sesión guardadas
- Diagnósticos registrados
- Seguimiento de tratamientos

## Próximas Mejoras

### Corto Plazo
- [ ] Integración con WebRTC real
- [ ] Notificaciones push
- [ ] Recordatorios por email/SMS
- [ ] Compartir pantalla funcional

### Mediano Plazo
- [ ] Grabación de sesiones real
- [ ] Transcripción automática
- [ ] Traducción en tiempo real
- [ ] Análisis de sentimientos

### Largo Plazo
- [ ] IA para asistencia diagnóstica
- [ ] Realidad aumentada para explicaciones
- [ ] Integración con dispositivos médicos
- [ ] Telemedicina grupal

## Instalación y Configuración

### 1. Aplicar Migración

```bash
# La migración ya está aplicada en Supabase
# Verificar con:
# SELECT * FROM telemedicine_sessions LIMIT 1;
```

### 2. Insertar Datos de Prueba

```bash
# Ejecutar script de seed
psql -h [host] -U [user] -d [database] -f scripts/seed-telemedicine-data.sql
```

### 3. Configurar Variables de Entorno

```env
# Ya configuradas en .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 4. Instalar Dependencias

```bash
npm install
```

### 5. Ejecutar Aplicación

```bash
npm run dev
```

## Testing

### Casos de Prueba

1. **Crear Sesión**
   - Paciente agenda consulta
   - Sistema crea sesión automáticamente
   - Verificar token y room_name únicos

2. **Unirse a Sesión**
   - Paciente entra a sala de espera
   - Doctor admite paciente
   - Ambos se conectan a videollamada

3. **Chat**
   - Enviar mensajes durante sesión
   - Verificar orden cronológico
   - Marcar como leídos

4. **Receta Digital**
   - Doctor crea receta
   - Paciente recibe notificación
   - Verificar número único

5. **Finalizar Sesión**
   - Guardar notas
   - Calcular duración
   - Actualizar estado

## Soporte

Para problemas o preguntas:
- Revisar logs en Supabase
- Verificar políticas RLS
- Consultar documentación de API

## Licencia

Propiedad de Red-Salud © 2025
