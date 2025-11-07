# Sistema de Historial Clínico

## 📋 Descripción General

Sistema completo de gestión de historial clínico que permite a los pacientes visualizar, buscar y gestionar todos sus registros médicos de manera organizada y segura.

## 🎯 Características Principales

### Para Pacientes

1. **Vista Completa del Historial**
   - Todos los registros médicos ordenados cronológicamente
   - Información detallada de cada consulta
   - Datos del médico tratante

2. **Búsqueda Avanzada**
   - Buscar por diagnóstico, síntomas, tratamiento o medicamentos
   - Resultados en tiempo real
   - Filtros por fecha y doctor

3. **Resumen Inteligente**
   - Estadísticas de salud
   - Diagnósticos frecuentes
   - Medicamentos actuales
   - Doctores consultados

4. **Detalles Completos**
   - Vista detallada de cada registro
   - Información del médico
   - Diagnóstico y síntomas
   - Tratamiento y medicamentos
   - Exámenes solicitados
   - Observaciones adicionales

5. **Exportación**
   - Descargar historial en PDF
   - Compartir con otros médicos
   - Historial completo o por fechas

## 📊 Estructura de Datos

### Tabla: `medical_records`

```sql
CREATE TABLE medical_records (
  id UUID PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES profiles(id),
  medico_id UUID NOT NULL REFERENCES profiles(id),
  appointment_id UUID REFERENCES appointments(id),
  diagnostico TEXT NOT NULL,
  sintomas TEXT,
  tratamiento TEXT,
  medicamentos TEXT,
  examenes_solicitados TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Campos Explicados

- **diagnostico**: Diagnóstico principal del médico (requerido)
- **sintomas**: Síntomas reportados por el paciente
- **tratamiento**: Plan de tratamiento indicado
- **medicamentos**: Medicamentos recetados (separados por comas)
- **examenes_solicitados**: Exámenes o estudios solicitados (separados por comas)
- **observaciones**: Notas adicionales del médico
- **appointment_id**: Vinculación con la cita (opcional)

## 🔧 Servicios Implementados

### `medical-records-service.ts`

#### Funciones Principales:

1. **`getPatientMedicalRecords(patientId, filters?)`**
   - Obtiene todos los registros de un paciente
   - Soporta filtros por fecha, doctor y búsqueda
   - Incluye información del médico y cita

2. **`getMedicalRecord(recordId)`**
   - Obtiene un registro específico
   - Incluye toda la información relacionada

3. **`getMedicalHistorySummary(patientId)`**
   - Genera resumen inteligente del historial
   - Calcula estadísticas automáticamente
   - Identifica patrones y tendencias

4. **`searchMedicalRecords(patientId, searchTerm)`**
   - Búsqueda en diagnóstico, síntomas, tratamiento y medicamentos
   - Resultados ordenados por relevancia

5. **`getMedicalRecordByAppointment(appointmentId)`**
   - Obtiene el registro médico de una cita específica
   - Útil para ver notas post-consulta

6. **`exportMedicalHistory(patientId)`**
   - Exporta historial completo
   - Incluye datos del paciente y detalles médicos
   - Formato preparado para PDF

7. **`createMedicalRecord(data)` (Para doctores)**
   - Crea nuevo registro médico
   - Registra actividad en logs

8. **`updateMedicalRecord(recordId, updates)` (Para doctores)**
   - Actualiza registro existente
   - Mantiene historial de cambios

## 🎨 Componentes de UI

### Página Principal: `/dashboard/paciente/historial`

**Secciones:**

1. **Header con Estadísticas**
   - Total de consultas
   - Número de doctores
   - Medicamentos actuales
   - Última consulta

2. **Barra de Búsqueda**
   - Búsqueda en tiempo real
   - Botón de limpiar
   - Resultados instantáneos

3. **Pestañas Organizadas**
   - **Registros Médicos**: Lista completa
   - **Resumen**: Estadísticas y análisis
   - **Estadísticas**: Gráficos (próximamente)

4. **Tarjetas de Registros**
   - Diagnóstico destacado
   - Información del doctor
   - Fecha de consulta
   - Síntomas y tratamiento resumidos
   - Botón "Ver Detalles"

### Página de Detalle: `/dashboard/paciente/historial/[id]`

**Secciones:**

1. **Información del Médico**
   - Foto de perfil
   - Nombre completo
   - Especialidad

2. **Diagnóstico Principal**
   - Destacado visualmente
   - Fácil de identificar

3. **Síntomas Reportados**
   - Descripción completa
   - Formato legible

4. **Tratamiento Indicado**
   - Plan de tratamiento detallado
   - Instrucciones claras

5. **Medicamentos Recetados**
   - Lista organizada
   - Cada medicamento en su propia tarjeta

6. **Exámenes Solicitados**
   - Lista de estudios pendientes
   - Fácil seguimiento

7. **Observaciones Adicionales**
   - Notas del médico
   - Información complementaria

8. **Información de la Consulta**
   - Fecha y hora
   - Motivo de consulta
   - Vinculación con cita

## 🔍 Funcionalidad de Búsqueda

### Campos Buscables:
- Diagnóstico
- Síntomas
- Tratamiento
- Medicamentos

### Características:
- Búsqueda case-insensitive
- Búsqueda parcial (ILIKE)
- Resultados ordenados por fecha
- Limpieza de búsqueda con un click

### Ejemplo de Uso:
```typescript
// Buscar "dolor de cabeza"
search("dolor de cabeza");

// Encuentra registros con:
// - Diagnóstico: "Migraña crónica"
// - Síntomas: "Dolor de cabeza intenso"
// - Tratamiento: "Analgésicos para dolor de cabeza"
```

## 📈 Resumen Inteligente

### Diagnósticos Frecuentes
- Top 5 diagnósticos más comunes
- Contador de ocurrencias
- Útil para identificar condiciones recurrentes

### Medicamentos Actuales
- Medicamentos de los últimos 3 meses
- Lista única (sin duplicados)
- Fácil referencia para nuevos doctores

### Exámenes Pendientes
- Exámenes solicitados en últimos 6 meses
- Recordatorio de estudios pendientes
- Seguimiento de salud preventiva

### Doctores Consultados
- Lista de todos los médicos
- Número de consultas con cada uno
- Especialidad de cada doctor
- Útil para continuidad de atención

## 🔐 Seguridad y Privacidad

### Row Level Security (RLS)

```sql
-- Pacientes solo ven sus propios registros
CREATE POLICY "Pacientes ven sus registros"
  ON medical_records FOR SELECT
  USING (auth.uid() = paciente_id);

-- Doctores ven registros de sus pacientes
CREATE POLICY "Doctores ven sus registros"
  ON medical_records FOR SELECT
  USING (auth.uid() = medico_id);

-- Solo doctores pueden crear registros
CREATE POLICY "Doctores crean registros"
  ON medical_records FOR INSERT
  WITH CHECK (
    auth.uid() = medico_id AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'medico'
    )
  );
```

### Logs de Actividad
- Todas las creaciones registradas
- Todas las actualizaciones registradas
- Auditoría completa

## 📱 Flujos de Usuario

### Flujo 1: Ver Historial Completo

1. Usuario navega a `/dashboard/paciente/historial`
2. Sistema carga todos los registros
3. Muestra estadísticas en cards superiores
4. Lista registros ordenados por fecha
5. Usuario puede hacer click en "Ver Detalles"

### Flujo 2: Buscar Registro Específico

1. Usuario escribe en barra de búsqueda
2. Sistema busca en tiempo real
3. Muestra resultados filtrados
4. Usuario puede limpiar búsqueda
5. Vuelve a lista completa

### Flujo 3: Ver Detalle de Registro

1. Usuario hace click en "Ver Detalles"
2. Navega a página de detalle
3. Ve toda la información completa
4. Puede descargar o compartir
5. Botón "Volver" para regresar

### Flujo 4: Ver Resumen de Salud

1. Usuario cambia a pestaña "Resumen"
2. Ve diagnósticos frecuentes
3. Ve medicamentos actuales
4. Ve doctores consultados
5. Identifica patrones de salud

## 🎯 Casos de Uso

### Caso 1: Paciente con Condición Crónica

**Escenario:** María tiene diabetes y necesita revisar su historial.

**Flujo:**
1. Entra a historial clínico
2. Ve que tiene 15 consultas registradas
3. Busca "diabetes" en la barra
4. Encuentra 8 registros relacionados
5. Revisa tratamientos anteriores
6. Ve medicamentos actuales
7. Identifica patrón de control

**Beneficio:** Continuidad en el tratamiento

### Caso 2: Preparación para Nueva Consulta

**Escenario:** Juan tiene cita con nuevo cardiólogo.

**Flujo:**
1. Entra a historial clínico
2. Va a pestaña "Resumen"
3. Ve que ha consultado 3 cardiólogos
4. Revisa diagnósticos frecuentes
5. Ve medicamentos actuales
6. Exporta historial en PDF
7. Lo comparte con nuevo doctor

**Beneficio:** Doctor tiene contexto completo

### Caso 3: Seguimiento de Tratamiento

**Escenario:** Ana necesita verificar medicamentos recetados.

**Flujo:**
1. Entra a historial clínico
2. Ve última consulta hace 2 semanas
3. Hace click en "Ver Detalles"
4. Revisa medicamentos recetados
5. Verifica dosis y frecuencia
6. Descarga registro para farmacia

**Beneficio:** Adherencia al tratamiento

### Caso 4: Búsqueda de Síntoma Recurrente

**Escenario:** Pedro tiene dolor de cabeza frecuente.

**Flujo:**
1. Busca "dolor de cabeza"
2. Encuentra 5 registros
3. Ve que es recurrente
4. Identifica patrón temporal
5. Decide consultar especialista
6. Comparte historial con neurólogo

**Beneficio:** Diagnóstico más preciso

## 📊 Métricas y Estadísticas

### Métricas del Sistema:
- Total de registros por paciente
- Promedio de consultas por mes
- Diagnósticos más comunes
- Medicamentos más recetados
- Doctores más consultados

### Métricas del Paciente:
- Frecuencia de consultas
- Adherencia a tratamientos
- Exámenes pendientes
- Última actualización

## 🚀 Funcionalidades Futuras

### Corto Plazo:
- [ ] Exportar a PDF con formato profesional
- [ ] Compartir con doctores específicos
- [ ] Subir resultados de exámenes
- [ ] Vincular documentos médicos
- [ ] Notificaciones de exámenes pendientes

### Mediano Plazo:
- [ ] Gráficos de evolución
- [ ] Timeline visual del historial
- [ ] Comparación de tratamientos
- [ ] Alertas de medicamentos
- [ ] Integración con laboratorios

### Largo Plazo:
- [ ] IA para análisis de patrones
- [ ] Predicción de riesgos
- [ ] Recomendaciones personalizadas
- [ ] Integración con wearables
- [ ] Blockchain para seguridad

## 🔧 Integración con Otros Módulos

### Con Sistema de Citas:
- Registro médico se crea después de cita
- Vinculación automática con appointment_id
- Paciente ve notas post-consulta

### Con Perfil Médico:
- Alergias y condiciones crónicas visibles
- Medicamentos actuales sincronizados
- Información complementaria

### Con Documentos:
- Subir resultados de exámenes
- Vincular con registros específicos
- Historial completo con evidencia

## 📝 Notas Técnicas

### Optimizaciones:
- Índices en paciente_id y medico_id
- Paginación para historiales largos
- Caché de resúmenes frecuentes
- Lazy loading de detalles

### Consideraciones:
- Datos médicos sensibles (HIPAA/GDPR)
- Encriptación en reposo
- Logs de acceso
- Retención de datos según regulaciones

## 🎨 Principios de Diseño

1. **Claridad:** Información médica clara y comprensible
2. **Accesibilidad:** Fácil navegación para todas las edades
3. **Privacidad:** Datos protegidos y seguros
4. **Completitud:** Toda la información relevante visible
5. **Organización:** Estructura lógica y cronológica
6. **Búsqueda:** Encontrar información rápidamente

---

Este sistema proporciona a los pacientes control total sobre su historial médico, facilitando la continuidad de atención y mejorando la comunicación con profesionales de salud.
