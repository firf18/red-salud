# Sistema de Citas Médicas - MVP

## Descripción General

Sistema completo de gestión de citas médicas que permite a los pacientes agendar consultas con doctores, gestionar sus citas y realizar seguimiento de su historial médico.

## Estructura de Base de Datos

### Tablas Creadas

#### 1. `medical_specialties`
Catálogo de especialidades médicas disponibles.
- `id`: UUID (PK)
- `name`: Nombre de la especialidad (único)
- `description`: Descripción de la especialidad
- `created_at`: Fecha de creación

**Especialidades precargadas:**
- Medicina General
- Cardiología
- Dermatología
- Pediatría
- Ginecología
- Psiquiatría
- Traumatología
- Oftalmología
- Otorrinolaringología
- Neurología

#### 2. `doctor_profiles`
Información extendida de los doctores.
- `id`: UUID (PK, FK a profiles)
- `specialty_id`: UUID (FK a medical_specialties)
- `license_number`: Número de licencia médica
- `years_experience`: Años de experiencia
- `bio`: Biografía del doctor
- `consultation_price`: Precio de consulta
- `consultation_duration`: Duración de consulta (minutos)
- `is_available`: Disponibilidad del doctor
- `created_at`, `updated_at`: Timestamps

#### 3. `doctor_schedules`
Horarios disponibles de los doctores.
- `id`: UUID (PK)
- `doctor_id`: UUID (FK a doctor_profiles)
- `day_of_week`: Integer (0=Domingo, 6=Sábado)
- `start_time`: Hora de inicio
- `end_time`: Hora de fin
- `is_active`: Si el horario está activo
- `created_at`: Timestamp

#### 4. `appointments`
Citas médicas agendadas.
- `id`: UUID (PK)
- `patient_id`: UUID (FK a profiles)
- `doctor_id`: UUID (FK a doctor_profiles)
- `appointment_date`: Fecha de la cita
- `appointment_time`: Hora de la cita
- `duration`: Duración en minutos
- `status`: Estado (pending, confirmed, cancelled, completed, no_show)
- `consultation_type`: Tipo (video, presencial, telefono)
- `reason`: Motivo de la consulta
- `notes`: Notas adicionales
- `meeting_url`: URL de videollamada
- `price`: Precio de la consulta
- `created_at`, `updated_at`: Timestamps
- `cancelled_at`: Fecha de cancelación
- `cancelled_by`: Usuario que canceló
- `cancellation_reason`: Motivo de cancelación

#### 5. `appointment_notes`
Notas médicas de las citas (para doctores).
- `id`: UUID (PK)
- `appointment_id`: UUID (FK a appointments)
- `doctor_id`: UUID (FK a doctor_profiles)
- `diagnosis`: Diagnóstico
- `treatment`: Tratamiento
- `prescriptions`: Recetas
- `follow_up_notes`: Notas de seguimiento
- `created_at`, `updated_at`: Timestamps

### Políticas RLS (Row Level Security)

Todas las tablas tienen RLS habilitado con políticas específicas:
- Pacientes pueden ver y gestionar sus propias citas
- Doctores pueden ver y gestionar sus citas asignadas
- Todos los usuarios autenticados pueden ver especialidades y doctores disponibles
- Solo doctores pueden crear y editar notas médicas

## Arquitectura del Código

### Tipos TypeScript
**Archivo:** `lib/supabase/types/appointments.ts`

Tipos principales:
- `MedicalSpecialty`
- `DoctorProfile`
- `DoctorSchedule`
- `Appointment`
- `AppointmentNote`
- `TimeSlot`
- `CreateAppointmentData`

### Servicios
**Archivo:** `lib/supabase/services/appointments-service.ts`

Funciones disponibles:
- `getMedicalSpecialties()`: Obtener todas las especialidades
- `getAvailableDoctors(specialtyId?)`: Obtener doctores disponibles
- `getDoctorProfile(doctorId)`: Obtener perfil de un doctor
- `getDoctorSchedules(doctorId)`: Obtener horarios de un doctor
- `getAvailableTimeSlots(doctorId, date)`: Obtener slots disponibles
- `createAppointment(patientId, data)`: Crear una cita
- `getPatientAppointments(patientId)`: Obtener citas de un paciente
- `getDoctorAppointments(doctorId)`: Obtener citas de un doctor
- `cancelAppointment(appointmentId, userId, reason?)`: Cancelar una cita
- `confirmAppointment(appointmentId)`: Confirmar una cita
- `completeAppointment(appointmentId)`: Completar una cita

### Hooks Personalizados
**Archivo:** `hooks/use-appointments.ts`

Hooks disponibles:
- `usePatientAppointments(patientId)`: Citas del paciente
- `useDoctorAppointments(doctorId)`: Citas del doctor
- `useMedicalSpecialties()`: Especialidades médicas
- `useAvailableDoctors(specialtyId?)`: Doctores disponibles
- `useDoctorProfile(doctorId)`: Perfil de doctor
- `useAvailableTimeSlots(doctorId, date)`: Slots de tiempo
- `useCreateAppointment()`: Crear cita
- `useCancelAppointment()`: Cancelar cita

## Páginas y Componentes

### Para Pacientes

#### 1. Lista de Citas (`/dashboard/paciente/citas`)
**Archivo:** `app/dashboard/paciente/citas/page.tsx`

Características:
- Vista en pestañas: Próximas, Pasadas, Canceladas
- Tarjetas de citas con información completa
- Badges de estado (Pendiente, Confirmada, Cancelada, Completada)
- Iconos para tipo de consulta (Video, Presencial, Teléfono)
- Botón para agendar nueva cita
- Opciones para ver detalles y cancelar

#### 2. Agendar Nueva Cita (`/dashboard/paciente/citas/nueva`)
**Archivo:** `app/dashboard/paciente/citas/nueva/page.tsx`

Flujo de 4 pasos:
1. **Seleccionar Especialidad**: Grid de especialidades médicas
2. **Seleccionar Doctor**: Lista de doctores con información y precios
3. **Fecha y Hora**: Calendario + slots de tiempo disponibles
4. **Detalles**: Tipo de consulta, motivo y resumen

Características:
- Barra de progreso visual
- Validación en cada paso
- Calendario interactivo con fechas deshabilitadas
- Slots de tiempo dinámicos según disponibilidad
- Resumen antes de confirmar
- Navegación entre pasos

## Flujo de Usuario (Paciente)

1. **Acceder a Citas**: Navegar a `/dashboard/paciente/citas`
2. **Ver Citas Existentes**: Ver citas próximas, pasadas o canceladas
3. **Agendar Nueva Cita**:
   - Click en "Nueva Cita"
   - Seleccionar especialidad médica
   - Elegir doctor de la lista
   - Seleccionar fecha en calendario
   - Elegir hora disponible
   - Seleccionar tipo de consulta
   - Agregar motivo (opcional)
   - Confirmar cita
4. **Gestionar Citas**: Ver detalles o cancelar citas existentes

## Estados de Citas

- **pending**: Cita creada, esperando confirmación del doctor
- **confirmed**: Cita confirmada por el doctor
- **cancelled**: Cita cancelada por paciente o doctor
- **completed**: Cita completada exitosamente
- **no_show**: Paciente no asistió a la cita

## Tipos de Consulta

- **video**: Videollamada (telemedicina)
- **presencial**: Consulta en consultorio
- **telefono**: Llamada telefónica

## Migración de Base de Datos

**Archivo:** `supabase/migrations/004_create_appointments_system.sql`

Para aplicar la migración:
```bash
# Usando Supabase CLI
supabase db push

# O aplicar manualmente en el dashboard de Supabase
```

## Próximas Funcionalidades

### Fase 2 (Corto Plazo)
- [ ] Dashboard del doctor para gestionar citas
- [ ] Sistema de notificaciones (email/push)
- [ ] Recordatorios automáticos de citas
- [ ] Integración de videollamadas (Zoom/Jitsi)
- [ ] Sistema de pagos
- [ ] Calificaciones y reseñas de doctores

### Fase 3 (Mediano Plazo)
- [ ] Recetas médicas digitales
- [ ] Historial médico completo
- [ ] Chat en tiempo real paciente-doctor
- [ ] Subir documentos médicos a citas
- [ ] Reportes y estadísticas
- [ ] Exportar historial médico (PDF)

### Fase 4 (Largo Plazo)
- [ ] Integración con laboratorios
- [ ] Integración con farmacias
- [ ] Telemedicina con IA (triaje)
- [ ] App móvil nativa
- [ ] Integración con wearables

## Dependencias Instaladas

```json
{
  "react-day-picker": "^8.x",
  "date-fns": "^3.x"
}
```

## Componentes UI Creados

- `components/ui/calendar.tsx`: Calendario interactivo
- `components/ui/badge.tsx`: Badges para estados

## Testing

### Datos de Prueba Recomendados

1. **Crear un doctor de prueba**:
```sql
-- Insertar perfil de doctor
INSERT INTO profiles (id, email, nombre_completo, role)
VALUES ('uuid-doctor-1', 'doctor@test.com', 'Dr. Juan Pérez', 'doctor');

-- Insertar perfil extendido
INSERT INTO doctor_profiles (id, specialty_id, consultation_price, consultation_duration, is_available)
VALUES ('uuid-doctor-1', (SELECT id FROM medical_specialties WHERE name = 'Medicina General'), 50.00, 30, true);

-- Insertar horarios
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time)
VALUES 
  ('uuid-doctor-1', 1, '09:00:00', '17:00:00'), -- Lunes
  ('uuid-doctor-1', 2, '09:00:00', '17:00:00'), -- Martes
  ('uuid-doctor-1', 3, '09:00:00', '17:00:00'); -- Miércoles
```

2. **Crear una cita de prueba**:
```sql
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, consultation_type)
VALUES ('uuid-paciente', 'uuid-doctor-1', '2024-12-01', '10:00:00', 'pending', 'video');
```

## Notas Técnicas

- Todas las funciones retornan `{ success: boolean, data?, error? }`
- Los horarios se generan en slots de 30 minutos
- Las fechas pasadas están deshabilitadas en el calendario
- Los slots ocupados no se muestran como disponibles
- Se registra actividad del usuario en `user_activity_log`
- RLS asegura que cada usuario solo vea sus propios datos

## Soporte

Para problemas o preguntas sobre el sistema de citas, revisar:
1. Logs de Supabase
2. Consola del navegador
3. Políticas RLS en Supabase Dashboard
4. Migraciones aplicadas correctamente
