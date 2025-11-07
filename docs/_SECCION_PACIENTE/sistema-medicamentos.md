# Sistema de Gestión de Medicamentos

## 📋 Descripción General

Sistema completo para gestionar medicamentos, prescripciones, recordatorios y adherencia al tratamiento. Permite a los pacientes llevar un control detallado de sus medicamentos y nunca olvidar una toma.

## 🎯 Características Principales

### 1. **Catálogo de Medicamentos**
- Base de datos con 10+ medicamentos comunes precargados
- Búsqueda por nombre comercial, genérico o principio activo
- Información completa: indicaciones, contraindicaciones, efectos secundarios
- Dosis usual y forma farmacéutica

### 2. **Prescripciones/Recetas Médicas**
- Recetas digitales emitidas por doctores
- Múltiples medicamentos por receta
- Estados: activa, surtida, vencida, cancelada
- Vinculación con citas y registros médicos
- Instrucciones detalladas por medicamento

### 3. **Recordatorios Inteligentes**
- Configuración de horarios múltiples por día
- Días específicos de la semana o todos los días
- Notificaciones push y email
- Duración del tratamiento (fecha inicio/fin)
- Notas personalizadas

### 4. **Registro de Adherencia**
- Tracking automático de tomas
- Estados: tomado, omitido, retrasado, pendiente
- Estadísticas de adherencia (%)
- Rachas de días consecutivos
- Historial completo

### 5. **Dashboard Completo**
- Resumen de medicamentos activos
- Próxima toma con cuenta regresiva
- Tomas del día con botones de acción
- Estadísticas visuales
- Gráficos de adherencia

## 📊 Estructura de Base de Datos

### Tablas Creadas

#### 1. `medications_catalog`
Catálogo de medicamentos disponibles.

```sql
- id: UUID
- nombre_comercial: VARCHAR(255)
- nombre_generico: VARCHAR(255)
- principio_activo: VARCHAR(255)
- concentracion: VARCHAR(100)
- forma_farmaceutica: VARCHAR(100)
- fabricante: VARCHAR(255)
- descripcion: TEXT
- indicaciones: TEXT
- contraindicaciones: TEXT
- efectos_secundarios: TEXT
- dosis_usual: TEXT
- requiere_receta: BOOLEAN
- activo: BOOLEAN
```

**Medicamentos Precargados:**
1. Paracetamol 500mg
2. Ibuprofeno 400mg
3. Amoxicilina 500mg
4. Omeprazol 20mg
5. Losartán 50mg
6. Metformina 850mg
7. Atorvastatina 20mg
8. Loratadina 10mg
9. Salbutamol 100mcg
10. Diclofenaco 50mg

#### 2. `prescriptions`
Recetas médicas emitidas por doctores.

```sql
- id: UUID
- paciente_id: UUID (FK profiles)
- medico_id: UUID (FK profiles)
- medical_record_id: UUID (FK medical_records)
- appointment_id: UUID (FK appointments)
- fecha_prescripcion: DATE
- fecha_vencimiento: DATE
- diagnostico: VARCHAR(255)
- instrucciones_generales: TEXT
- status: VARCHAR(20) -- activa, surtida, vencida, cancelada
- farmacia_id: UUID (FK profiles)
- fecha_surtida: TIMESTAMPTZ
- notas: TEXT
```

#### 3. `prescription_medications`
Medicamentos incluidos en cada receta.

```sql
- id: UUID
- prescription_id: UUID (FK prescriptions)
- medication_id: UUID (FK medications_catalog)
- nombre_medicamento: VARCHAR(255)
- dosis: VARCHAR(100)
- frecuencia: VARCHAR(100)
- via_administracion: VARCHAR(50)
- duracion_dias: INTEGER
- cantidad_total: VARCHAR(50)
- instrucciones_especiales: TEXT
```

#### 4. `medication_reminders`
Recordatorios configurados por pacientes.

```sql
- id: UUID
- paciente_id: UUID (FK profiles)
- prescription_medication_id: UUID (FK prescription_medications)
- nombre_medicamento: VARCHAR(255)
- dosis: VARCHAR(100)
- horarios: TIME[] -- Array de horarios
- dias_semana: INTEGER[] -- 0-6, null = todos los días
- fecha_inicio: DATE
- fecha_fin: DATE
- activo: BOOLEAN
- notificar_email: BOOLEAN
- notificar_push: BOOLEAN
- notas: TEXT
```

#### 5. `medication_intake_log`
Registro de tomas (adherencia).

```sql
- id: UUID
- reminder_id: UUID (FK medication_reminders)
- paciente_id: UUID (FK profiles)
- fecha_programada: TIMESTAMPTZ
- fecha_tomada: TIMESTAMPTZ
- status: VARCHAR(20) -- pendiente, tomado, omitido, retrasado
- notas: TEXT
```

## 🔧 Servicios Implementados

### `medications-service.ts`

#### Catálogo
- `searchMedicationsCatalog(searchTerm)` - Buscar medicamentos
- `getMedicationById(medicationId)` - Obtener medicamento específico

#### Prescripciones
- `getPatientPrescriptions(patientId)` - Todas las recetas del paciente
- `getPrescription(prescriptionId)` - Receta específica con detalles
- `createPrescription(data)` - Crear receta (doctores)
- `markPrescriptionAsFilled(prescriptionId, pharmacyId)` - Marcar como surtida

#### Recordatorios
- `getPatientReminders(patientId)` - Recordatorios activos
- `createReminder(data)` - Crear recordatorio
- `updateReminder(reminderId, updates)` - Actualizar recordatorio
- `deactivateReminder(reminderId)` - Desactivar recordatorio

#### Registro de Tomas
- `getTodayIntakeLog(patientId)` - Tomas del día
- `recordMedicationIntake(intakeId, status, notes)` - Registrar toma
- `getAdherenceStats(patientId, days)` - Estadísticas de adherencia
- `getActiveMedicationsSummary(patientId)` - Resumen de medicamentos activos

## 🎨 Páginas Implementadas

### 1. Dashboard Principal
**Ruta:** `/dashboard/paciente/medicamentos`

**Secciones:**
- **Cards de Resumen:**
  - Medicamentos activos
  - Tomados hoy / Total
  - Porcentaje de adherencia
  - Racha actual (días)

- **Alerta de Próxima Toma:**
  - Medicamento
  - Hora programada
  - Minutos restantes

- **4 Pestañas:**
  1. **Hoy**: Tomas programadas con botones de acción
  2. **Recordatorios**: Lista de recordatorios activos
  3. **Recetas**: Prescripciones médicas
  4. **Estadísticas**: Gráficos de adherencia y rachas

### 2. Nuevo Recordatorio
**Ruta:** `/dashboard/paciente/medicamentos/recordatorios/nuevo`

**Flujo:**
1. **Buscar Medicamento:**
   - Búsqueda en catálogo
   - Autocompletado
   - O escribir manualmente

2. **Configurar Horarios:**
   - Agregar múltiples horarios
   - Visualización en badges
   - Eliminar horarios

3. **Días de la Semana:**
   - Botones para cada día
   - Todos los días por defecto
   - Selección múltiple

4. **Duración:**
   - Calendario para fecha inicio
   - Calendario para fecha fin (opcional)
   - Tratamientos indefinidos

5. **Notificaciones:**
   - Push (activado por defecto)
   - Email (opcional)
   - Notas personalizadas

### 3. Detalle de Receta
**Ruta:** `/dashboard/paciente/medicamentos/recetas/[id]`

**Información Mostrada:**
- Estado de la receta (badge)
- Información del médico prescriptor
- Diagnóstico
- Lista de medicamentos con:
  - Nombre y genérico
  - Dosis y frecuencia
  - Vía de administración
  - Duración del tratamiento
  - Instrucciones especiales
  - Indicaciones y contraindicaciones (expandible)
  - Botón para crear recordatorio
- Instrucciones generales
- Fechas (prescripción, vencimiento, surtida)
- Notas adicionales

## 🔍 Funcionalidades Detalladas

### Búsqueda de Medicamentos

```typescript
// Busca en 3 campos
- nombre_comercial
- nombre_generico
- principio_activo

// Características
- Case-insensitive
- Búsqueda parcial (ILIKE)
- Límite de 20 resultados
- Solo medicamentos activos
```

### Generación Automática de Tomas

Cuando se crea un recordatorio:
1. Se generan registros para los próximos 7 días
2. Se respetan los días de la semana configurados
3. Se crea una entrada por cada horario
4. Estado inicial: "pendiente"

### Cálculo de Adherencia

```typescript
Adherencia = (Tomas Completadas / Total Programadas) * 100

Racha Actual = Días consecutivos con todas las tomas completadas
Mejor Racha = Máximo de días consecutivos histórico
```

### Estados de Tomas

- **Pendiente**: Aún no es hora o no se ha registrado
- **Tomado**: Paciente confirmó la toma
- **Omitido**: Paciente indicó que no tomó el medicamento
- **Retrasado**: Tomado después de la hora programada

## 📱 Flujos de Usuario

### Flujo 1: Crear Recordatorio desde Receta

1. Paciente recibe receta del doctor
2. Ve receta en `/medicamentos` pestaña "Recetas"
3. Click en "Ver Detalles"
4. En cada medicamento, click "Crear Recordatorio"
5. Formulario pre-llenado con nombre y dosis
6. Configura horarios y días
7. Guarda recordatorio
8. Aparece en dashboard

### Flujo 2: Registrar Toma del Día

1. Paciente abre `/medicamentos`
2. Ve pestaña "Hoy" con tomas pendientes
3. Recibe notificación push a la hora programada
4. Click en botón "Tomado" o "Omitir"
5. Se actualiza el registro
6. Se actualiza contador "Tomados Hoy"
7. Se recalcula adherencia

### Flujo 3: Revisar Adherencia

1. Paciente va a pestaña "Estadísticas"
2. Ve porcentaje de adherencia (últimos 30 días)
3. Ve barra de progreso visual
4. Ve desglose: tomadas, omitidas, retrasadas
5. Ve racha actual y mejor racha
6. Identifica patrones de olvidos

### Flujo 4: Buscar Medicamento en Catálogo

1. En "Nuevo Recordatorio"
2. Escribe en barra de búsqueda
3. Ve resultados en tiempo real
4. Click en medicamento
5. Nombre y dosis se auto-completan
6. Continúa configuración

## 🔐 Seguridad (RLS)

### Políticas Implementadas

**medications_catalog:**
- Todos pueden leer (solo activos)

**prescriptions:**
- Pacientes ven sus recetas
- Doctores ven recetas que crearon
- Solo doctores pueden crear/editar

**prescription_medications:**
- Visible si tienes acceso a la receta
- Solo doctores pueden agregar

**medication_reminders:**
- Pacientes ven y gestionan sus recordatorios
- Control total sobre sus datos

**medication_intake_log:**
- Pacientes ven y registran sus tomas
- Privacidad total

## 📊 Métricas y Estadísticas

### Para el Paciente:
- Adherencia general (%)
- Tomas completadas vs programadas
- Racha actual y mejor racha
- Medicamentos activos
- Próxima toma

### Para el Sistema:
- Medicamentos más recetados
- Adherencia promedio por medicamento
- Horarios más comunes
- Tasa de olvidos por horario
- Efectividad de notificaciones

## 🚀 Funcionalidades Futuras

### Corto Plazo:
- [ ] Notificaciones push reales
- [ ] Notificaciones por email
- [ ] Editar recordatorios existentes
- [ ] Historial de cambios en recordatorios
- [ ] Exportar adherencia a PDF

### Mediano Plazo:
- [ ] Gráficos de adherencia por medicamento
- [ ] Comparación mes a mes
- [ ] Alertas de interacciones medicamentosas
- [ ] Recordatorios de resurtir receta
- [ ] Integración con farmacias

### Largo Plazo:
- [ ] IA para predecir olvidos
- [ ] Recomendaciones de horarios óptimos
- [ ] Integración con wearables
- [ ] Reconocimiento de pastillas por foto
- [ ] Asistente virtual de medicamentos

## 🔗 Integraciones

### Con Historial Clínico:
- Medicamentos actuales sincronizados
- Alergias visibles al crear receta
- Historial de medicamentos previos

### Con Sistema de Citas:
- Recetas vinculadas a citas
- Crear receta durante consulta
- Seguimiento post-consulta

### Con Farmacias:
- Enviar receta a farmacia
- Verificar disponibilidad
- Tracking de surtido
- Recordatorios de resurtir

## 💡 Casos de Uso

### Caso 1: Paciente con Hipertensión

**Escenario:** Juan debe tomar Losartán diariamente.

**Flujo:**
1. Doctor prescribe Losartán en consulta
2. Receta aparece en sistema
3. Juan crea recordatorio para las 8:00 AM
4. Recibe notificación diaria
5. Registra toma cada día
6. Mantiene 95% de adherencia
7. Doctor ve adherencia en próxima consulta

### Caso 2: Tratamiento con Antibiótico

**Escenario:** María tiene infección, antibiótico por 7 días.

**Flujo:**
1. Doctor prescribe Amoxicilina cada 8 horas
2. María crea recordatorio: 8:00, 16:00, 00:00
3. Configura duración: 7 días
4. Recibe 3 notificaciones diarias
5. Completa tratamiento al 100%
6. Recordatorio se desactiva automáticamente

### Caso 3: Múltiples Medicamentos

**Escenario:** Pedro tiene diabetes e hipertensión.

**Flujo:**
1. Tiene 3 medicamentos activos
2. Dashboard muestra próxima toma
3. Ve lista de tomas del día
4. Registra cada toma con un click
5. Estadísticas muestran adherencia por medicamento
6. Identifica que olvida más el de la noche

## 🎨 Principios de Diseño

1. **Simplicidad:** Interfaz clara y directa
2. **Accesibilidad:** Botones grandes, texto legible
3. **Feedback Inmediato:** Confirmaciones visuales
4. **Prevención de Errores:** Validaciones claras
5. **Motivación:** Rachas y porcentajes
6. **Privacidad:** Control total de datos

## 📝 Notas Técnicas

### Optimizaciones:
- Índices en tablas principales
- Caché de resúmenes frecuentes
- Lazy loading de listas largas
- Paginación en historial

### Consideraciones:
- Zona horaria del paciente
- Notificaciones programadas
- Sincronización offline
- Backup de recordatorios

---

Este sistema proporciona a los pacientes una herramienta completa para gestionar sus medicamentos, mejorar su adherencia al tratamiento y mantener un control detallado de su salud.
