# 🎯 Plan de Acción: Dashboard Médico

## 📋 Resumen Ejecutivo

Este documento define el plan de acción para completar las pantallas pendientes del dashboard médico, priorizando funcionalidades críticas y estableciendo un roadmap claro.

---

## 🏆 Estado Actual

### ✅ Completado (60%)
- Dashboard principal con estadísticas
- Sistema de autenticación y roles
- Verificación SACS
- Configuración (tabs compartidos)
- Citas (vista básica)
- Mensajería (básica)
- Telemedicina (estructura)
- Recetas (básica)
- Estadísticas (básica)
- Pacientes (lista)

### ⏳ Pendiente (40%)
- Gestión completa de pacientes
- Agenda médica interactiva
- Notas médicas
- Perfil profesional editable
- Integraciones de video
- Reportes avanzados

---

## 🎯 Sprint 1: Funcionalidades Críticas (2 semanas)

### Objetivo
Completar las funcionalidades esenciales para que un médico pueda atender pacientes.

### 1.1 Vista Detallada de Paciente 🔴
**Prioridad**: Crítica
**Tiempo estimado**: 3 días

**Tareas**:
- [ ] Crear ruta `/dashboard/medico/pacientes/[id]`
- [ ] Diseñar layout de vista detallada
- [ ] Mostrar información personal del paciente
- [ ] Mostrar historial de citas
- [ ] Mostrar recetas previas
- [ ] Agregar tabs (Perfil, Historial, Notas, Documentos)

**Archivos a crear**:
```
app/dashboard/medico/pacientes/[id]/
├── page.tsx
├── layout.tsx
└── components/
    ├── patient-header.tsx
    ├── patient-tabs.tsx
    └── patient-info-card.tsx
```

**Queries Supabase**:
```typescript
// Obtener paciente con detalles
const { data: patient } = await supabase
  .from('profiles')
  .select(`
    *,
    patient_details (*),
    appointments (
      *,
      doctor_details (*)
    ),
    prescriptions (*)
  `)
  .eq('id', patientId)
  .single();
```

---

### 1.2 Notas Médicas 🔴
**Prioridad**: Crítica
**Tiempo estimado**: 2 días

**Tareas**:
- [ ] Crear tabla `medical_notes` en Supabase
- [ ] Implementar editor de notas (React Quill)
- [ ] Agregar plantillas de notas
- [ ] Implementar búsqueda de notas
- [ ] Agregar historial de ediciones

**Migración SQL**:
```sql
CREATE TABLE medical_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES profiles(id) NOT NULL,
  patient_id UUID REFERENCES profiles(id) NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  titulo VARCHAR(255),
  contenido TEXT NOT NULL,
  diagnostico TEXT,
  tratamiento TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medical_notes_doctor ON medical_notes(doctor_id);
CREATE INDEX idx_medical_notes_patient ON medical_notes(patient_id);
```

**Componente**:
```typescript
// components/dashboard/medico/notes-editor.tsx
import ReactQuill from 'react-quill';

export function NotesEditor({ patientId, appointmentId }) {
  const [content, setContent] = useState('');
  
  const handleSave = async () => {
    await supabase.from('medical_notes').insert({
      doctor_id: user.id,
      patient_id: patientId,
      appointment_id: appointmentId,
      contenido: content
    });
  };
  
  return (
    <div>
      <ReactQuill value={content} onChange={setContent} />
      <Button onClick={handleSave}>Guardar Nota</Button>
    </div>
  );
}
```

---

### 1.3 Agenda Médica con Calendario 🔴
**Prioridad**: Crítica
**Tiempo estimado**: 4 días

**Tareas**:
- [ ] Instalar `react-big-calendar`
- [ ] Crear vista de calendario (día/semana/mes)
- [ ] Implementar creación de citas
- [ ] Implementar edición de citas
- [ ] Implementar cancelación de citas
- [ ] Agregar configuración de disponibilidad
- [ ] Implementar bloqueo de horarios

**Instalación**:
```bash
npm install react-big-calendar date-fns
```

**Componente**:
```typescript
// app/dashboard/medico/agenda/page.tsx
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function AgendaPage() {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    loadAppointments();
  }, []);
  
  const loadAppointments = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*, patient:profiles(*)')
      .eq('doctor_id', user.id);
    
    setEvents(data.map(apt => ({
      id: apt.id,
      title: `${apt.patient.nombre_completo} - ${apt.motivo_consulta}`,
      start: new Date(apt.fecha_hora),
      end: new Date(apt.fecha_hora + apt.duracion_minutos * 60000),
    })));
  };
  
  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 700 }}
      messages={{
        next: "Siguiente",
        previous: "Anterior",
        today: "Hoy",
        month: "Mes",
        week: "Semana",
        day: "Día"
      }}
    />
  );
}
```

---

### 1.4 Mejoras al Dashboard Principal 🟡
**Prioridad**: Media
**Tiempo estimado**: 2 días

**Tareas**:
- [ ] Integrar datos reales de Supabase
- [ ] Agregar gráficos con Recharts
- [ ] Implementar notificaciones en tiempo real
- [ ] Agregar accesos rápidos
- [ ] Mostrar próximas citas del día

**Componente de Estadísticas**:
```typescript
// components/dashboard/medico/stats-cards.tsx
export function StatsCards() {
  const [stats, setStats] = useState({
    pacientesHoy: 0,
    citasPendientes: 0,
    ingresosmes: 0,
    satisfaccion: 0
  });
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    // Pacientes hoy
    const { count: pacientesHoy } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', user.id)
      .gte('fecha_hora', startOfDay(new Date()))
      .lte('fecha_hora', endOfDay(new Date()));
    
    // Citas pendientes
    const { count: citasPendientes } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', user.id)
      .eq('estado', 'pendiente');
    
    setStats({ pacientesHoy, citasPendientes, ...stats });
  };
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        title="Pacientes Hoy"
        value={stats.pacientesHoy}
        icon={<Users />}
      />
      {/* ... más cards */}
    </div>
  );
}
```

---

## 🎯 Sprint 2: Funcionalidades Importantes (2 semanas)

### 2.1 Recetas Médicas Completas 🟡
**Prioridad**: Media
**Tiempo estimado**: 3 días

**Tareas**:
- [ ] Búsqueda de medicamentos (API externa o BD local)
- [ ] Plantillas de recetas
- [ ] Generación de PDF con jsPDF
- [ ] Firma digital
- [ ] Envío por email
- [ ] Historial de recetas por paciente

**API de Medicamentos**:
Opciones:
1. OpenFDA API (gratis, USA)
2. VADEMECUM API (Venezuela)
3. Base de datos local

**Generación de PDF**:
```typescript
import jsPDF from 'jspdf';

export function generatePrescriptionPDF(prescription) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('RECETA MÉDICA', 105, 20, { align: 'center' });
  
  // Doctor info
  doc.setFontSize(12);
  doc.text(`Dr. ${doctor.nombre_completo}`, 20, 40);
  doc.text(`MPPS: ${doctor.licencia_medica}`, 20, 50);
  
  // Patient info
  doc.text(`Paciente: ${patient.nombre_completo}`, 20, 70);
  doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy')}`, 20, 80);
  
  // Medications
  let y = 100;
  prescription.medicamentos.forEach((med, i) => {
    doc.text(`${i + 1}. ${med.nombre}`, 20, y);
    doc.text(`   Dosis: ${med.dosis}`, 20, y + 10);
    doc.text(`   Frecuencia: ${med.frecuencia}`, 20, y + 20);
    y += 40;
  });
  
  // Signature
  doc.text('_____________________', 140, 250);
  doc.text('Firma del Médico', 145, 260);
  
  doc.save(`receta-${patient.nombre_completo}.pdf`);
}
```

---

### 2.2 Mensajería en Tiempo Real 🟡
**Prioridad**: Media
**Tiempo estimado**: 3 días

**Tareas**:
- [ ] Implementar Supabase Realtime
- [ ] Notificaciones push
- [ ] Adjuntar archivos
- [ ] Estado de lectura
- [ ] Respuestas rápidas

**Implementación Realtime**:
```typescript
// hooks/use-realtime-chat.ts
export function useRealtimeChat(conversationId: string) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Cargar mensajes iniciales
    loadMessages();
    
    // Suscribirse a nuevos mensajes
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);
  
  const sendMessage = async (content: string) => {
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content
    });
  };
  
  return { messages, sendMessage };
}
```

---

### 2.3 Perfil Profesional Editable 🟡
**Prioridad**: Media
**Tiempo estimado**: 2 días

**Tareas**:
- [ ] Formulario de edición de perfil
- [ ] Subir foto de perfil
- [ ] Editar especialidades
- [ ] Agregar certificaciones
- [ ] Configurar horarios
- [ ] Definir tarifas

**Componente**:
```typescript
// app/dashboard/medico/perfil/editar/page.tsx
export default function EditarPerfilPage() {
  const [profile, setProfile] = useState(null);
  
  const handleSave = async (data) => {
    await supabase
      .from('doctor_details')
      .update({
        biografia: data.biografia,
        especialidades: data.especialidades,
        tarifa_consulta: data.tarifa,
        anos_experiencia: data.experiencia
      })
      .eq('profile_id', user.id);
  };
  
  return (
    <form onSubmit={handleSubmit(handleSave)}>
      {/* Formulario */}
    </form>
  );
}
```

---

## 🎯 Sprint 3: Funcionalidades Deseables (2 semanas)

### 3.1 Telemedicina con Video 🟢
**Prioridad**: Baja (pero importante)
**Tiempo estimado**: 5 días

**Proveedor recomendado**: Daily.co

**Instalación**:
```bash
npm install @daily-co/daily-js @daily-co/daily-react
```

**Implementación**:
```typescript
// app/dashboard/medico/telemedicina/[sessionId]/page.tsx
import { DailyProvider, useDaily } from '@daily-co/daily-react';

export default function VideoRoomPage({ params }) {
  const [callFrame, setCallFrame] = useState(null);
  
  useEffect(() => {
    const frame = DailyIframe.createFrame({
      showLeaveButton: true,
      iframeStyle: {
        width: '100%',
        height: '600px',
        border: 'none'
      }
    });
    
    frame.join({ url: `https://your-domain.daily.co/${params.sessionId}` });
    setCallFrame(frame);
    
    return () => frame.destroy();
  }, []);
  
  return (
    <div>
      <div id="daily-frame" />
      <ChatSidebar sessionId={params.sessionId} />
    </div>
  );
}
```

---

### 3.2 Estadísticas Avanzadas 🟢
**Prioridad**: Baja
**Tiempo estimado**: 3 días

**Tareas**:
- [ ] Dashboard de métricas
- [ ] Gráficos interactivos con Recharts
- [ ] Exportar reportes (PDF/Excel)
- [ ] Análisis de tendencias

**Instalación**:
```bash
npm install recharts xlsx
```

**Componente**:
```typescript
// components/dashboard/medico/charts/appointments-chart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function AppointmentsChart() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    loadChartData();
  }, []);
  
  const loadChartData = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('fecha_hora, estado')
      .eq('doctor_id', user.id)
      .gte('fecha_hora', subMonths(new Date(), 6));
    
    // Agrupar por mes
    const grouped = groupByMonth(data);
    setData(grouped);
  };
  
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="mes" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="citas" stroke="#8884d8" />
    </LineChart>
  );
}
```

---

## 📊 Métricas de Éxito

### Sprint 1
- [ ] Médico puede ver detalles completos de pacientes
- [ ] Médico puede crear notas médicas
- [ ] Médico puede gestionar su agenda
- [ ] Dashboard muestra datos reales

### Sprint 2
- [ ] Médico puede crear recetas completas
- [ ] Mensajería funciona en tiempo real
- [ ] Médico puede editar su perfil

### Sprint 3
- [ ] Videoconsultas funcionan correctamente
- [ ] Reportes se pueden exportar
- [ ] Estadísticas son útiles y precisas

---

## 🛠️ Herramientas y Librerías

### Instalaciones Necesarias
```bash
# Sprint 1
npm install react-big-calendar date-fns react-quill

# Sprint 2
npm install jspdf crypto-js

# Sprint 3
npm install @daily-co/daily-js @daily-co/daily-react recharts xlsx
```

---

## 📝 Checklist General

### Antes de Empezar
- [ ] Revisar documentación de Supabase
- [ ] Configurar variables de entorno
- [ ] Preparar datos de prueba
- [ ] Configurar Supabase Realtime

### Durante el Desarrollo
- [ ] Escribir tests para funcionalidades críticas
- [ ] Documentar componentes nuevos
- [ ] Mantener consistencia de UI
- [ ] Implementar loading states
- [ ] Manejar errores correctamente

### Antes de Deploy
- [ ] Testing manual completo
- [ ] Testing automatizado
- [ ] Revisar performance
- [ ] Verificar seguridad
- [ ] Actualizar documentación

---

## 🎯 Próximos Pasos Inmediatos

1. **Hoy**:
   - ✅ Verificar que componentes compartidos funcionen
   - ✅ Probar navegación entre tabs
   - ⏳ Planificar Sprint 1

2. **Mañana**:
   - ⏳ Comenzar con vista detallada de paciente
   - ⏳ Crear migraciones de BD necesarias

3. **Esta Semana**:
   - ⏳ Completar funcionalidades críticas de Sprint 1
   - ⏳ Testing de funcionalidades nuevas

---

**Última actualización**: 2024-11-10
**Versión**: 1.0
**Estado**: 📋 Planificado
