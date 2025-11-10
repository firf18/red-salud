# Dashboard Médico - Pantallas Pendientes

## 📊 Estado Actual de Implementación

### ✅ Pantallas Completadas

1. **Dashboard Principal** (`/dashboard/medico/page.tsx`)
   - Vista general con estadísticas
   - Citas del día
   - Pacientes recientes
   - Métricas clave

2. **Perfil Setup** (`/dashboard/medico/perfil/setup/page.tsx`)
   - Verificación SACS
   - Selección de especialidades
   - Configuración inicial

3. **Citas** (`/dashboard/medico/citas/page.tsx`)
   - Lista de citas
   - Filtros por estado
   - Vista de calendario

4. **Mensajería** (`/dashboard/medico/mensajeria/page.tsx`)
   - Chat con pacientes
   - Lista de conversaciones
   - Búsqueda de mensajes

5. **Telemedicina** (`/dashboard/medico/telemedicina/page.tsx`)
   - Sala de videoconsulta
   - Controles de audio/video
   - Chat en vivo

6. **Recetas** (`/dashboard/medico/recetas/page.tsx`)
   - Crear recetas médicas
   - Historial de recetas
   - Plantillas

7. **Estadísticas** (`/dashboard/medico/estadisticas/page.tsx`)
   - Gráficos de rendimiento
   - Métricas de pacientes
   - Ingresos

8. **Configuración** (`/dashboard/medico/configuracion/page.tsx`) ✅ ACTUALIZADO
   - Tabs compartidos con paciente
   - Preferencias
   - Seguridad
   - Privacidad
   - Actividad
   - Facturación

9. **Pacientes** (`/dashboard/medico/pacientes/page.tsx`)
   - Lista de pacientes
   - Búsqueda y filtros
   - Vista de detalles

---

## 🔨 Pantallas por Mejorar/Completar

### 1. Dashboard Principal
**Prioridad**: 🔴 Alta
**Estado**: Funcional pero básico

**Mejoras necesarias**:
- [ ] Integrar datos reales de Supabase
- [ ] Agregar gráficos interactivos
- [ ] Implementar notificaciones en tiempo real
- [ ] Agregar accesos rápidos personalizables
- [ ] Mostrar alertas importantes

**Componentes a crear**:
```
components/dashboard/medico/
  ├── stats-cards.tsx          # Tarjetas de estadísticas
  ├── appointments-today.tsx   # Citas de hoy
  ├── recent-patients.tsx      # Pacientes recientes
  ├── quick-actions.tsx        # Acciones rápidas
  └── notifications-panel.tsx  # Panel de notificaciones
```

---

### 2. Perfil Profesional
**Prioridad**: 🟡 Media
**Estado**: Setup inicial completo, falta edición

**Funcionalidades pendientes**:
- [ ] Editar información profesional
- [ ] Agregar/editar especialidades
- [ ] Subir foto de perfil
- [ ] Gestionar certificaciones
- [ ] Actualizar biografía
- [ ] Configurar horarios de atención
- [ ] Definir tarifas por servicio

**Ruta**: `/dashboard/medico/perfil/editar`

**Componentes a crear**:
```
app/dashboard/medico/perfil/
  ├── editar/
  │   └── page.tsx             # Edición de perfil
  └── components/
      ├── profile-form.tsx     # Formulario de perfil
      ├── specialties-manager.tsx
      ├── certifications-list.tsx
      └── schedule-config.tsx
```

---

### 3. Gestión de Pacientes
**Prioridad**: 🔴 Alta
**Estado**: Lista básica, falta detalle

**Funcionalidades pendientes**:
- [ ] Vista detallada de paciente
- [ ] Historial médico completo
- [ ] Notas médicas
- [ ] Documentos del paciente
- [ ] Línea de tiempo de consultas
- [ ] Agregar diagnósticos
- [ ] Prescribir medicamentos
- [ ] Solicitar estudios

**Rutas**:
- `/dashboard/medico/pacientes` (existe)
- `/dashboard/medico/pacientes/[id]` (crear)

**Componentes a crear**:
```
app/dashboard/medico/pacientes/
  ├── [id]/
  │   ├── page.tsx             # Vista detallada
  │   ├── historial/
  │   │   └── page.tsx         # Historial médico
  │   ├── notas/
  │   │   └── page.tsx         # Notas médicas
  │   └── documentos/
  │       └── page.tsx         # Documentos
  └── components/
      ├── patient-header.tsx
      ├── medical-history.tsx
      ├── notes-editor.tsx
      ├── prescriptions-list.tsx
      └── timeline.tsx
```

---

### 4. Agenda Médica
**Prioridad**: 🔴 Alta
**Estado**: Vista básica, falta gestión completa

**Funcionalidades pendientes**:
- [ ] Calendario interactivo (día/semana/mes)
- [ ] Crear/editar/cancelar citas
- [ ] Bloquear horarios
- [ ] Configurar disponibilidad
- [ ] Recordatorios automáticos
- [ ] Integración con Google Calendar
- [ ] Vista de sala de espera virtual

**Ruta**: `/dashboard/medico/agenda`

**Componentes a crear**:
```
app/dashboard/medico/agenda/
  ├── page.tsx                 # Vista principal
  ├── components/
  │   ├── calendar-view.tsx    # Calendario
  │   ├── appointment-modal.tsx
  │   ├── availability-config.tsx
  │   └── waiting-room.tsx
  └── hooks/
      └── use-calendar.ts
```

---

### 5. Recetas Médicas
**Prioridad**: 🟡 Media
**Estado**: Básico, falta integración completa

**Funcionalidades pendientes**:
- [ ] Búsqueda de medicamentos
- [ ] Plantillas de recetas
- [ ] Firma digital
- [ ] Envío por email/WhatsApp
- [ ] Historial de recetas por paciente
- [ ] Interacciones medicamentosas
- [ ] Dosificación automática

**Componentes a mejorar**:
```
app/dashboard/medico/recetas/
  ├── components/
  │   ├── prescription-form.tsx
  │   ├── medication-search.tsx
  │   ├── templates-list.tsx
  │   ├── digital-signature.tsx
  │   └── drug-interactions.tsx
  └── hooks/
      └── use-medications.ts
```

---

### 6. Telemedicina
**Prioridad**: 🟡 Media
**Estado**: Estructura básica, falta integración de video

**Funcionalidades pendientes**:
- [ ] Integración con Twilio/Agora/Daily.co
- [ ] Compartir pantalla
- [ ] Grabación de sesiones (con consentimiento)
- [ ] Pizarra virtual
- [ ] Compartir archivos
- [ ] Transcripción automática
- [ ] Notas durante la consulta

**Proveedor recomendado**: Daily.co (más fácil) o Twilio Video

**Componentes a crear**:
```
app/dashboard/medico/telemedicina/
  ├── [sessionId]/
  │   └── page.tsx             # Sala de video
  └── components/
      ├── video-room.tsx
      ├── controls-panel.tsx
      ├── chat-sidebar.tsx
      ├── whiteboard.tsx
      └── session-notes.tsx
```

---

### 7. Estadísticas y Reportes
**Prioridad**: 🟢 Baja
**Estado**: Básico, falta análisis profundo

**Funcionalidades pendientes**:
- [ ] Dashboard de métricas
- [ ] Gráficos de pacientes atendidos
- [ ] Ingresos por período
- [ ] Especialidades más solicitadas
- [ ] Horarios más ocupados
- [ ] Tasa de cancelación
- [ ] Satisfacción de pacientes
- [ ] Exportar reportes (PDF/Excel)

**Librerías recomendadas**:
- Recharts (gráficos)
- jsPDF (exportar PDF)
- xlsx (exportar Excel)

---

### 8. Mensajería
**Prioridad**: 🟡 Media
**Estado**: Básico, falta tiempo real

**Funcionalidades pendientes**:
- [ ] Mensajes en tiempo real (Supabase Realtime)
- [ ] Notificaciones push
- [ ] Adjuntar archivos
- [ ] Mensajes de voz
- [ ] Búsqueda en conversaciones
- [ ] Archivar conversaciones
- [ ] Respuestas rápidas/plantillas
- [ ] Estado de lectura

**Componentes a mejorar**:
```
app/dashboard/medico/mensajeria/
  ├── components/
  │   ├── chat-list.tsx
  │   ├── chat-window.tsx
  │   ├── message-input.tsx
  │   ├── file-upload.tsx
  │   └── quick-replies.tsx
  └── hooks/
      └── use-realtime-chat.ts
```

---

## 🗄️ Migraciones de Base de Datos Pendientes

### Tablas a crear/modificar:

1. **appointments** (citas)
```sql
- id
- doctor_id
- patient_id
- fecha_hora
- duracion_minutos
- tipo (presencial/telemedicina)
- estado (pendiente/confirmada/completada/cancelada)
- motivo_consulta
- notas_doctor
- created_at
- updated_at
```

2. **medical_notes** (notas médicas)
```sql
- id
- doctor_id
- patient_id
- appointment_id
- contenido
- diagnostico
- tratamiento
- created_at
- updated_at
```

3. **prescriptions** (recetas)
```sql
- id
- doctor_id
- patient_id
- appointment_id
- medicamentos (jsonb)
- indicaciones
- vigencia_dias
- firma_digital
- created_at
```

4. **doctor_schedule** (horarios)
```sql
- id
- doctor_id
- dia_semana (0-6)
- hora_inicio
- hora_fin
- duracion_consulta_minutos
- activo
```

5. **doctor_blocked_times** (horarios bloqueados)
```sql
- id
- doctor_id
- fecha_inicio
- fecha_fin
- motivo
```

---

## 🎯 Prioridades de Desarrollo

### Sprint 1 (Crítico) 🔴
1. Gestión completa de pacientes (vista detallada)
2. Agenda médica con calendario
3. Notas médicas
4. Mejoras al dashboard principal

### Sprint 2 (Importante) 🟡
1. Recetas médicas completas
2. Mensajería en tiempo real
3. Perfil profesional editable
4. Configuración de horarios

### Sprint 3 (Deseable) 🟢
1. Telemedicina con video
2. Estadísticas avanzadas
3. Reportes exportables
4. Integraciones externas

---

## 📚 Recursos y Librerías Recomendadas

### UI/UX
- `react-big-calendar` - Calendario de citas
- `recharts` - Gráficos y estadísticas
- `react-quill` - Editor de notas médicas
- `react-pdf` - Generar recetas en PDF

### Funcionalidad
- `@supabase/realtime-js` - Mensajería en tiempo real
- `daily-js` - Videollamadas
- `zod` - Validación de formularios
- `react-hook-form` - Gestión de formularios

### Utilidades
- `date-fns` - Manejo de fechas
- `jspdf` - Exportar PDF
- `xlsx` - Exportar Excel
- `crypto-js` - Firma digital

---

## 🔐 Consideraciones de Seguridad

1. **HIPAA Compliance** (si aplica en tu región)
   - Encriptación de datos médicos
   - Auditoría de accesos
   - Consentimientos firmados

2. **Autenticación**
   - 2FA obligatorio para médicos
   - Sesiones con timeout
   - Logs de actividad

3. **Privacidad**
   - Anonimización de datos en reportes
   - Control de acceso granular
   - Backup automático

---

## 📝 Notas Finales

- Todos los componentes deben ser **responsive**
- Implementar **dark mode** en todos los nuevos componentes
- Mantener **consistencia** con el diseño actual
- Agregar **loading states** y **error handling**
- Documentar **cada componente nuevo**
- Escribir **tests** para funcionalidades críticas

---

**Última actualización**: 2024-11-10
**Versión**: 1.0
