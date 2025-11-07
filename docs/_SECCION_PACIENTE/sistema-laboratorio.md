# Sistema de Laboratorio Clínico - Red-Salud

## Descripción General

Sistema completo para la gestión de órdenes de laboratorio, resultados de exámenes clínicos y seguimiento de análisis médicos. Permite a pacientes visualizar sus resultados, comparar valores históricos y descargar reportes.

## Características Principales

### Para Pacientes

- ✅ Ver historial completo de órdenes de laboratorio
- ✅ Consultar resultados de exámenes
- ✅ Visualizar valores individuales con rangos de referencia
- ✅ Identificar valores anormales con alertas visuales
- ✅ Descargar PDFs de resultados
- ✅ Filtrar órdenes por estado y fecha
- ✅ Ver instrucciones de preparación
- ✅ Seguimiento de estado de órdenes
- ✅ Estadísticas de laboratorio
- 🔄 Comparar resultados históricos (preparado)

### Para Médicos

- ✅ Crear órdenes de laboratorio
- ✅ Seleccionar exámenes del catálogo
- ✅ Establecer prioridad (normal, urgente, STAT)
- ✅ Agregar diagnóstico presuntivo
- ✅ Incluir instrucciones para el paciente
- ✅ Ver resultados de sus pacientes

### Para Laboratorios

- ✅ Recibir órdenes asignadas
- ✅ Actualizar estado de procesamiento
- ✅ Cargar resultados
- ✅ Ingresar valores individuales
- ✅ Validar resultados
- ✅ Generar PDFs

## Estructura de Base de Datos

### Tabla: lab_test_types

Catálogo de tipos de exámenes disponibles.

```sql
- id: UUID (PK)
- codigo: VARCHAR(50) UNIQUE
- nombre: VARCHAR(255)
- categoria: VARCHAR(100)
- descripcion: TEXT
- preparacion_requerida: TEXT
- tiempo_entrega_horas: INTEGER
- requiere_ayuno: BOOLEAN
- precio_referencia: NUMERIC
- activo: BOOLEAN
- created_at, updated_at: TIMESTAMPTZ
```

**Categorías comunes:**
- Hematología
- Química Sanguínea
- Urianálisis
- Hormonas
- Inmunología
- Microbiología

### Tabla: lab_orders

Órdenes de laboratorio solicitadas.

```sql
- id: UUID (PK)
- paciente_id: UUID (FK → profiles)
- medico_id: UUID (FK → profiles)
- laboratorio_id: UUID (FK → profiles)
- appointment_id: UUID (FK → appointments)
- medical_record_id: UUID (FK → medical_records)
- numero_orden: VARCHAR(50) UNIQUE
- fecha_orden: DATE
- fecha_muestra: TIMESTAMPTZ
- fecha_entrega_estimada: DATE
- diagnostico_presuntivo: TEXT
- indicaciones_clinicas: TEXT
- status: VARCHAR(50)
- prioridad: VARCHAR(20)
- requiere_ayuno: BOOLEAN
- instrucciones_paciente: TEXT
- notas_internas: TEXT
- costo_total: NUMERIC
- created_at, updated_at: TIMESTAMPTZ
```

**Estados (status):**
- `pendiente`: Orden creada, esperando toma de muestra
- `muestra_tomada`: Muestra recolectada
- `en_proceso`: Análisis en curso
- `completada`: Resultados disponibles
- `cancelada`: Orden cancelada
- `rechazada`: Muestra rechazada

**Prioridades:**
- `normal`: Procesamiento estándar
- `urgente`: Procesamiento prioritario
- `stat`: Procesamiento inmediato

### Tabla: lab_order_tests

Exámenes específicos incluidos en cada orden.

```sql
- id: UUID (PK)
- order_id: UUID (FK → lab_orders)
- test_type_id: UUID (FK → lab_test_types)
- status: VARCHAR(50)
- resultado_disponible: BOOLEAN
- created_at: TIMESTAMPTZ
```

### Tabla: lab_results

Resultados generales de exámenes.

```sql
- id: UUID (PK)
- order_id: UUID (FK → lab_orders)
- test_type_id: UUID (FK → lab_test_types)
- fecha_resultado: TIMESTAMPTZ
- resultado_pdf_url: TEXT
- observaciones_generales: TEXT
- validado_por: UUID (FK → profiles)
- fecha_validacion: TIMESTAMPTZ
- notificado_paciente: BOOLEAN
- fecha_notificacion: TIMESTAMPTZ
- created_at, updated_at: TIMESTAMPTZ
```

### Tabla: lab_result_values

Valores individuales de cada parámetro analizado.

```sql
- id: UUID (PK)
- result_id: UUID (FK → lab_results)
- parametro: VARCHAR(255)
- valor: VARCHAR(255)
- unidad: VARCHAR(50)
- rango_referencia: VARCHAR(255)
- valor_minimo: NUMERIC
- valor_maximo: NUMERIC
- es_anormal: BOOLEAN
- nivel_alerta: VARCHAR(20)
- notas: TEXT
- orden: INTEGER
- created_at: TIMESTAMPTZ
```

**Niveles de Alerta:**
- `normal`: Valor dentro del rango
- `bajo`: Valor por debajo del rango
- `alto`: Valor por encima del rango
- `critico`: Valor crítico que requiere atención inmediata

### Tabla: lab_order_status_history

Historial de cambios de estado.

```sql
- id: UUID (PK)
- order_id: UUID (FK → lab_orders)
- status_anterior: VARCHAR(50)
- status_nuevo: VARCHAR(50)
- comentario: TEXT
- cambiado_por: UUID (FK → profiles)
- created_at: TIMESTAMPTZ
```

## Seguridad (RLS)

### lab_test_types
- Cualquiera puede ver tipos de exámenes activos

### lab_orders
- Pacientes ven solo sus órdenes
- Médicos ven órdenes que crearon
- Laboratorios ven órdenes asignadas
- Médicos pueden crear órdenes
- Usuarios autorizados pueden actualizar

### lab_results
- Usuarios ven resultados de sus órdenes
- Laboratorios pueden crear/actualizar resultados

### lab_result_values
- Usuarios ven valores de sus resultados

## Funciones Especiales

### generate_lab_order_number()

Genera números de orden únicos en formato: `LAB-YYYYMMDD-XXXX`

Ejemplo: `LAB-20251105-0001`

## Flujo de Trabajo

### 1. Creación de Orden

```
Médico → Crea orden
       → Selecciona exámenes
       → Establece prioridad
       → Agrega instrucciones
       → Asigna laboratorio (opcional)
```

### 2. Procesamiento

```
Laboratorio → Recibe orden
           → Toma muestra (actualiza estado)
           → Procesa análisis
           → Ingresa resultados
           → Valida resultados
```

### 3. Entrega de Resultados

```
Sistema → Notifica al paciente
       → Paciente ve resultados
       → Puede descargar PDF
       → Médico revisa resultados
```

## API Reference

### getLabTestTypes(categoria?)

Obtiene tipos de exámenes disponibles.

**Returns:** `{ success, data: LabTestType[], error }`

### getPatientLabOrders(patientId, filters?)

Obtiene órdenes de un paciente.

**Filters:**
- `status`: Filtrar por estado
- `fecha_desde`: Fecha inicio
- `fecha_hasta`: Fecha fin
- `prioridad`: Filtrar por prioridad

**Returns:** `{ success, data: LabOrder[], error }`

### getLabOrderDetails(orderId)

Obtiene detalles completos de una orden.

**Returns:** `{ success, data: LabOrder, error }`

### getLabOrderResults(orderId)

Obtiene resultados de una orden.

**Returns:** `{ success, data: LabResult[], error }`

### getPatientLabStats(patientId)

Obtiene estadísticas de laboratorio.

**Returns:** `{ success, data: LabResultStats, error }`

## Componentes UI

### Página Principal (`/dashboard/paciente/laboratorio`)

- Estadísticas generales
- Lista de órdenes con filtros
- Tabs: Todas / Pendientes / Completadas
- Tarjetas de orden con información resumida

### Página de Detalles (`/dashboard/paciente/laboratorio/[id]`)

- Información completa de la orden
- Tabs: Exámenes / Resultados / Historial
- Visualización de valores con alertas
- Descarga de PDFs

## Indicadores Visuales

### Estados de Orden

- 🟡 Pendiente: Amarillo
- 🔵 Muestra Tomada: Azul
- 🟣 En Proceso: Púrpura
- 🟢 Completada: Verde
- ⚫ Cancelada: Gris
- 🔴 Rechazada: Rojo

### Niveles de Alerta

- ✅ Normal: Verde
- 📉 Bajo: Azul
- 📈 Alto: Naranja
- ⚠️ Crítico: Rojo

## Ejemplos de Uso

### Crear Orden de Laboratorio

```typescript
const orderData: CreateLabOrderData = {
  medico_id: "doctor-uuid",
  diagnostico_presuntivo: "Control de rutina",
  prioridad: "normal",
  test_type_ids: ["test-1-uuid", "test-2-uuid"],
  instrucciones_paciente: "Presentarse en ayunas de 12 horas"
};

const result = await createLabOrder(patientId, orderData);
```

### Ver Resultados

```typescript
const { order, results, loading } = useLabOrder(orderId);

results.forEach(result => {
  console.log(`Examen: ${result.test_type?.nombre}`);
  result.values?.forEach(value => {
    console.log(`${value.parametro}: ${value.valor} ${value.unidad}`);
    if (value.es_anormal) {
      console.log(`⚠️ Valor anormal: ${value.nivel_alerta}`);
    }
  });
});
```

## Próximas Mejoras

### Corto Plazo
- [ ] Comparación de resultados históricos
- [ ] Gráficas de tendencias
- [ ] Notificaciones push
- [ ] Exportar a PDF mejorado

### Mediano Plazo
- [ ] Integración con dispositivos médicos
- [ ] IA para interpretación de resultados
- [ ] Recomendaciones automáticas
- [ ] Compartir resultados con médicos

### Largo Plazo
- [ ] Blockchain para trazabilidad
- [ ] Integración con wearables
- [ ] Análisis predictivo
- [ ] Telemedicina integrada

## Troubleshooting

### No aparecen órdenes

**Solución:** Verificar que el usuario tenga el rol correcto y que existan órdenes en la BD.

```sql
SELECT * FROM lab_orders WHERE paciente_id = 'user-id';
```

### Resultados no se muestran

**Solución:** Verificar que los resultados estén asociados correctamente.

```sql
SELECT * FROM lab_results WHERE order_id = 'order-id';
```

### Valores anormales no se detectan

**Solución:** Verificar que los rangos de referencia estén configurados.

```sql
UPDATE lab_result_values
SET es_anormal = TRUE,
    nivel_alerta = 'alto'
WHERE valor::numeric > valor_maximo;
```

## Mantenimiento

### Limpiar órdenes antiguas

```sql
-- Archivar órdenes completadas de más de 2 años
UPDATE lab_orders
SET status = 'archivada'
WHERE status = 'completada'
  AND fecha_orden < NOW() - INTERVAL '2 years';
```

### Estadísticas de uso

```sql
-- Exámenes más solicitados
SELECT 
  lt.nombre,
  COUNT(*) as total_solicitudes
FROM lab_order_tests lot
JOIN lab_test_types lt ON lot.test_type_id = lt.id
GROUP BY lt.id, lt.nombre
ORDER BY total_solicitudes DESC
LIMIT 10;
```

---

**Versión:** 1.0.0  
**Fecha:** Noviembre 2025  
**Estado:** ✅ Producción Ready
