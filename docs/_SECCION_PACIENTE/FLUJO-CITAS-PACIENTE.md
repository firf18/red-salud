# Flujo Completo de Citas Médicas - Perspectiva del Paciente

## 🎯 Visión General

El sistema de citas está diseñado pensando en la experiencia del paciente, con un flujo intuitivo de 4 pasos que lo guía desde la selección de especialidad hasta la confirmación de la cita.

## 📋 Flujo de Agendamiento (4 Pasos)

### **Paso 1: Seleccionar Especialidad**
**Objetivo:** El paciente elige qué tipo de consulta necesita

**Interfaz:**
- Grid de tarjetas con todas las especialidades disponibles
- Cada tarjeta muestra:
  - Nombre de la especialidad
  - Descripción breve
  - Icono representativo

**Especialidades Disponibles:**
1. Medicina General
2. Cardiología
3. Dermatología
4. Pediatría
5. Ginecología
6. Psiquiatría
7. Traumatología
8. Oftalmología
9. Neurología
10. Odontología
11. Medicina Deportiva
12. Telemedicina

**Lógica:**
```typescript
// El paciente selecciona una especialidad
setSelectedSpecialty(specialty.id);
// Esto filtra los doctores disponibles para el paso 2
```

---

### **Paso 2: Seleccionar Doctor**
**Objetivo:** El paciente elige el profesional de su preferencia

**Interfaz:**
- Lista de doctores filtrados por la especialidad seleccionada
- Cada tarjeta de doctor muestra:
  - Foto de perfil (o inicial)
  - Nombre completo
  - Especialidad
  - Años de experiencia
  - Precio de consulta
  - Biografía breve

**Datos Mostrados:**
```typescript
{
  nombre_completo: "Dr. Carlos García",
  especialidad: "Medicina General",
  anos_experiencia: 15,
  tarifa_consulta: $45.00,
  biografia: "Médico general con 15 años de experiencia..."
}
```

**Lógica:**
- Solo se muestran doctores verificados (`verified: true`)
- Los doctores se obtienen de `doctor_details` + `profiles`
- Se filtran por `especialidad_id` del paso 1

---

### **Paso 3: Fecha y Hora**
**Objetivo:** El paciente elige cuándo quiere su consulta

**Interfaz:**
- **Lado Izquierdo:** Calendario interactivo
  - Fechas pasadas deshabilitadas
  - Fechas futuras habilitadas
  - Indicador visual del día seleccionado

- **Lado Derecho:** Slots de tiempo disponibles
  - Grid de botones con horarios
  - Solo se muestran horarios disponibles
  - Horarios ocupados no aparecen

**Lógica de Horarios:**
```typescript
// 1. Obtener horario del doctor desde doctor_details.horario_atencion
{
  "lunes": "09:00-17:00",
  "martes": "09:00-17:00",
  "miercoles": "09:00-17:00"
}

// 2. Generar slots de 30 minutos
09:00, 09:30, 10:00, 10:30, ... 17:00

// 3. Filtrar slots ya ocupados
// Consultar appointments existentes para esa fecha y doctor
// Remover horarios con citas confirmadas o pendientes
```

**Validaciones:**
- No se pueden agendar citas en el pasado
- No se pueden agendar en horarios fuera del horario del doctor
- No se pueden agendar en slots ya ocupados

---

### **Paso 4: Detalles y Confirmación**
**Objetivo:** El paciente completa información y confirma

**Interfaz:**
- **Tipo de Consulta:** 3 opciones visuales
  - 📹 Videollamada (telemedicina)
  - 📍 Presencial (en consultorio)
  - 📞 Teléfono (llamada)

- **Motivo de Consulta:** Campo de texto opcional
  - Permite al paciente describir brevemente su situación
  - Ayuda al doctor a prepararse

- **Resumen de la Cita:** Card con toda la información
  ```
  Doctor: Dr. Carlos García
  Fecha: Lunes, 15 de enero de 2025
  Hora: 10:00 AM
  Tipo: Videollamada
  Total: $45.00
  ```

**Acción Final:**
```typescript
// Al confirmar, se crea la cita en la base de datos
await createAppointment(userId, {
  doctor_id: selectedDoctor,
  appointment_date: "2025-01-15",
  appointment_time: "10:00:00",
  consultation_type: "video",
  reason: "Dolor de cabeza persistente"
});
```

---

## 🔄 Estados de una Cita

### 1. **Pendiente** (`pending`)
- **Cuándo:** Recién creada por el paciente
- **Color:** Amarillo/Secundario
- **Acciones Disponibles:**
  - Ver detalles
  - Cancelar cita
- **Siguiente Estado:** Confirmada (por el doctor) o Cancelada

### 2. **Confirmada** (`confirmed`)
- **Cuándo:** El doctor acepta la cita
- **Color:** Azul/Primario
- **Acciones Disponibles:**
  - Ver detalles
  - Unirse a videollamada (si es el día)
  - Cancelar cita (con penalización si es muy cerca)
- **Siguiente Estado:** Completada o Cancelada

### 3. **Completada** (`completed`)
- **Cuándo:** La consulta se realizó
- **Color:** Verde/Outline
- **Acciones Disponibles:**
  - Ver detalles
  - Ver notas médicas
  - Descargar receta (si hay)
  - Calificar doctor
- **Estado Final:** No cambia

### 4. **Cancelada** (`cancelled`)
- **Cuándo:** Paciente o doctor cancela
- **Color:** Rojo/Destructive
- **Información Adicional:**
  - Quién canceló
  - Motivo de cancelación
  - Fecha de cancelación
- **Estado Final:** No cambia

### 5. **No Asistió** (`no_show`)
- **Cuándo:** Paciente no se presenta
- **Color:** Rojo/Destructive
- **Impacto:** Puede afectar futuras reservas
- **Estado Final:** No cambia

---

## 📱 Gestión de Citas (Vista Principal)

### Pestañas Organizadas

#### **Próximas Citas**
- Muestra citas con estado `pending` o `confirmed`
- Filtro: `fecha_hora > ahora`
- Ordenadas por fecha (más cercana primero)
- **Acciones:**
  - Ver detalles completos
  - Cancelar cita
  - Agregar al calendario
  - Compartir información

#### **Citas Pasadas**
- Muestra citas con estado `completed`
- Filtro: `fecha_hora < ahora` y `status = completed`
- Ordenadas por fecha (más reciente primero)
- **Acciones:**
  - Ver detalles
  - Ver notas médicas
  - Descargar documentos
  - Reagendar con mismo doctor

#### **Citas Canceladas**
- Muestra citas con estado `cancelled`
- Incluye información de cancelación
- **Acciones:**
  - Ver motivo de cancelación
  - Reagendar nueva cita

---

## 🎭 Escenarios Completos del Paciente

### **Escenario 1: Primera Cita - Paciente Nuevo**

**Historia:**
María es nueva en la plataforma y necesita una consulta general.

**Flujo:**
1. ✅ Inicia sesión por primera vez
2. ✅ Navega a "Mis Citas"
3. ✅ Ve mensaje: "No tienes citas próximas"
4. ✅ Click en "Agendar Cita"
5. ✅ Selecciona "Medicina General"
6. ✅ Ve lista de 3 doctores disponibles
7. ✅ Elige "Dr. Carlos García" ($45)
8. ✅ Selecciona fecha: Mañana
9. ✅ Elige hora: 10:00 AM
10. ✅ Selecciona "Videollamada"
11. ✅ Escribe motivo: "Chequeo general"
12. ✅ Confirma cita
13. ✅ Recibe confirmación
14. ✅ Cita aparece en "Próximas"

**Resultado:**
- Cita creada con estado `pending`
- Email de confirmación enviado
- Recordatorio programado

---

### **Escenario 2: Cancelación de Cita**

**Historia:**
Juan tiene una cita pero necesita cancelarla.

**Flujo:**
1. ✅ Navega a "Mis Citas"
2. ✅ Ve su cita próxima
3. ✅ Click en "Cancelar"
4. ✅ Modal de confirmación aparece
5. ✅ Selecciona motivo: "Conflicto de horario"
6. ✅ Confirma cancelación
7. ✅ Cita cambia a estado `cancelled`
8. ✅ Aparece en pestaña "Canceladas"
9. ✅ Doctor recibe notificación

**Validaciones:**
- Si cancela con menos de 24h: Advertencia
- Si cancela múltiples veces: Restricción temporal
- Slot queda disponible para otros pacientes

---

### **Escenario 3: Día de la Consulta**

**Historia:**
Ana tiene su cita de videollamada hoy.

**Flujo:**
1. ✅ Recibe recordatorio por email (2 horas antes)
2. ✅ Recibe notificación push (30 min antes)
3. ✅ Navega a "Mis Citas"
4. ✅ Ve botón "Unirse a Consulta" (activo 15 min antes)
5. ✅ Click en "Unirse"
6. ✅ Verifica cámara y micrófono
7. ✅ Entra a sala de espera
8. ✅ Doctor se une
9. ✅ Consulta se realiza
10. ✅ Consulta termina
11. ✅ Estado cambia a `completed`
12. ✅ Puede ver notas médicas
13. ✅ Puede calificar al doctor

---

### **Escenario 4: Consulta Especializada**

**Historia:**
Pedro necesita un cardiólogo por recomendación.

**Flujo:**
1. ✅ Selecciona "Cardiología"
2. ✅ Ve "Dra. Ana Martínez" ($80)
3. ✅ Lee biografía: "20 años de experiencia"
4. ✅ Ve horarios limitados (L-M-V)
5. ✅ Selecciona Viernes próximo
6. ✅ Solo 3 slots disponibles
7. ✅ Elige 14:00
8. ✅ Selecciona "Presencial"
9. ✅ Escribe motivo detallado
10. ✅ Ve precio más alto ($80)
11. ✅ Confirma cita
12. ✅ Recibe dirección del consultorio

**Diferencias:**
- Precio más alto por especialidad
- Menos horarios disponibles
- Requiere más información previa

---

### **Escenario 5: Reagendar Cita**

**Historia:**
Laura necesita cambiar la fecha de su cita.

**Flujo Actual (Manual):**
1. ✅ Cancela cita existente
2. ✅ Agenda nueva cita
3. ✅ Selecciona mismo doctor
4. ✅ Elige nueva fecha/hora

**Flujo Futuro (Automático):**
1. Click en "Reagendar"
2. Mantiene doctor y tipo
3. Solo elige nueva fecha/hora
4. Confirma cambio

---

### **Escenario 6: Consulta de Seguimiento**

**Historia:**
Carlos tuvo una consulta y necesita seguimiento.

**Flujo:**
1. ✅ Ve cita completada en "Pasadas"
2. ✅ Click en "Ver Detalles"
3. ✅ Lee notas del doctor
4. ✅ Ve recomendación: "Seguimiento en 2 semanas"
5. ✅ Click en "Agendar Seguimiento"
6. ✅ Pre-selecciona mismo doctor
7. ✅ Sugiere fecha (2 semanas después)
8. ✅ Confirma cita de seguimiento

**Ventajas:**
- Continuidad de atención
- Historial médico disponible
- Proceso más rápido

---

## 🚨 Casos Especiales y Validaciones

### **Horarios No Disponibles**
```
Paciente selecciona fecha
→ No hay horarios disponibles
→ Mensaje: "El doctor no tiene disponibilidad este día"
→ Sugerencia: "Prueba otro día o doctor"
```

### **Doctor No Disponible**
```
Paciente intenta agendar
→ Doctor desactivó su perfil
→ Mensaje: "Este doctor no está disponible temporalmente"
→ Sugerencia: Otros doctores de la misma especialidad
```

### **Cita Muy Próxima**
```
Paciente intenta agendar para hoy
→ Validación: Mínimo 2 horas de anticipación
→ Mensaje: "Las citas deben agendarse con al menos 2 horas de anticipación"
```

### **Múltiples Citas Simultáneas**
```
Paciente intenta agendar
→ Ya tiene cita a esa hora
→ Mensaje: "Ya tienes una cita agendada a esta hora"
→ Muestra cita existente
```

---

## 📊 Métricas y Seguimiento

### Para el Paciente:
- Total de citas realizadas
- Doctores consultados
- Especialidades visitadas
- Próxima cita programada
- Historial médico consolidado

### Para el Sistema:
- Tasa de cancelación
- Tiempo promedio de agendamiento
- Especialidades más solicitadas
- Horarios más populares
- Satisfacción del paciente

---

## 🔮 Funcionalidades Futuras

### Corto Plazo:
- [ ] Recordatorios automáticos (SMS/Email/Push)
- [ ] Integración de videollamadas
- [ ] Calificación de doctores
- [ ] Favoritos (doctores preferidos)
- [ ] Historial médico en la cita

### Mediano Plazo:
- [ ] Reagendar con un click
- [ ] Sugerencias de doctores por IA
- [ ] Chat pre-consulta
- [ ] Subir documentos antes de la cita
- [ ] Recetas digitales post-consulta

### Largo Plazo:
- [ ] Suscripciones mensuales
- [ ] Paquetes de consultas
- [ ] Programa de referidos
- [ ] Integración con seguros
- [ ] Telemedicina con IA (triaje)

---

## 🎨 Principios de Diseño

1. **Simplicidad:** Máximo 4 pasos para agendar
2. **Claridad:** Información visible y comprensible
3. **Confianza:** Mostrar credenciales de doctores
4. **Flexibilidad:** Múltiples tipos de consulta
5. **Transparencia:** Precios claros desde el inicio
6. **Accesibilidad:** Interfaz intuitiva para todas las edades

---

## 🔧 Integración Técnica

### Tablas Utilizadas:
- `specialties` - Especialidades médicas
- `profiles` - Información de usuarios
- `doctor_details` - Datos extendidos de doctores
- `appointments` - Citas médicas

### Flujo de Datos:
```
Usuario → Especialidad → Doctores → Horarios → Cita
   ↓          ↓             ↓          ↓        ↓
profiles  specialties  doctor_details  JSON  appointments
```

### Seguridad (RLS):
- Pacientes solo ven sus propias citas
- Doctores solo ven sus citas asignadas
- Información médica protegida
- Logs de todas las acciones

---

Este documento describe el flujo completo desde la perspectiva del paciente, cubriendo todos los escenarios posibles y las validaciones necesarias para una experiencia óptima.
