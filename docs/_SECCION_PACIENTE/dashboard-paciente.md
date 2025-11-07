# Dashboard Principal del Paciente - Red-Salud

## Descripción General

Dashboard avanzado y completamente integrado que proporciona una vista unificada de toda la información de salud del paciente, con acceso rápido a todos los servicios de la plataforma.

## Características Principales

### 1. Vista General Personalizada
- Saludo personalizado con nombre del paciente
- Fecha actual en español
- Botón de acceso rápido para nueva cita

### 2. Alertas en Tiempo Real
- Notificación de sesiones de telemedicina activas
- Acceso directo para unirse a videoconsultas
- Alertas visuales destacadas

### 3. Estadísticas Clave (Cards Interactivos)
- **Próximas Citas**: Número de citas programadas + total de consultas
- **Medicamentos Activos**: Recordatorios configurados
- **Resultados Pendientes**: Órdenes de laboratorio en proceso
- **Mensajes Sin Leer**: Conversaciones activas

Cada card es clickeable y redirige a la sección correspondiente.

### 4. Próximas Citas
- Lista de las 3 próximas citas médicas
- Información del doctor con avatar
- Fecha y hora formateada en español
- Estado de la cita (Confirmada/Pendiente)
- Motivo de consulta
- Acceso rápido a ver todas las citas

### 5. Actividad Reciente
- Últimas 5 acciones del usuario
- Iconos contextuales por tipo de actividad
- Colores según estado (éxito, error, advertencia)
- Timestamps formateados
- Tipos de actividad:
  - Citas creadas/canceladas
  - Recetas generadas
  - Órdenes de laboratorio
  - Mensajes enviados
  - Sesiones de telemedicina
  - Actualizaciones de perfil
  - Métricas registradas

### 6. Métricas de Salud
- Últimas 4 mediciones registradas
- Valores con unidades de medida
- Fecha de cada medición
- Acceso rápido para registrar nueva métrica
- Visualización clara de valores primarios y secundarios

### 7. Medicamentos Activos
- Lista de los 3 medicamentos con recordatorios activos
- Nombre y dosis
- Horarios de toma (primeros 3)
- Diseño visual con iconos
- Acceso rápido para agregar recordatorio

### 8. Accesos Rápidos
- Grid de 4 servicios principales:
  - Telemedicina (videoconsultas)
  - Laboratorio (resultados)
  - Historial (clínico)
  - Mensajes (comunicación)
- Botón de configuración
- Iconos coloridos y descriptivos

## Integración con Sistemas

### Sistema de Citas
```typescript
- Carga citas próximas (pendientes/confirmadas)
- Muestra información del doctor
- Formato de fecha/hora en español
- Redirección a gestión de citas
```

### Sistema de Medicamentos
```typescript
- Carga recordatorios activos
- Muestra horarios configurados
- Acceso a crear nuevos recordatorios
```

### Sistema de Laboratorio
```typescript
- Cuenta órdenes pendientes
- Estados: en_proceso, muestra_tomada
- Redirección a resultados
```

### Sistema de Mensajería
```typescript
- Cuenta mensajes no leídos
- Filtra por receptor (no enviados por el usuario)
- Acceso directo a conversaciones
```

### Sistema de Telemedicina
```typescript
- Detecta sesiones activas (waiting, active)
- Alerta prominente si hay sesión activa
- Botón para unirse inmediatamente
```

### Sistema de Métricas
```typescript
- Carga últimas 4 mediciones
- Incluye tipo de métrica y unidad
- Muestra valores primarios y secundarios
```

### Sistema de Actividad
```typescript
- Registra todas las acciones del usuario
- Últimas 5 actividades
- Iconos y colores contextuales
```

## Estructura de Datos

### DashboardStats
```typescript
interface DashboardStats {
  upcomingAppointments: number;
  totalConsultations: number;
  activeMedications: number;
  pendingLabResults: number;
  unreadMessages: number;
  activeTelemed: number;
}
```

### RecentActivity
```typescript
interface RecentActivity {
  id: string;
  type: string;
  description: string;
  date: string;
  status: string;
}
```

## Queries de Base de Datos

### Citas
```sql
SELECT * FROM appointments
WHERE paciente_id = $userId
AND status IN ('pendiente', 'confirmada')
ORDER BY fecha_hora ASC
LIMIT 3
```

### Medicamentos
```sql
SELECT * FROM medication_reminders
WHERE paciente_id = $userId
AND activo = true
ORDER BY created_at DESC
LIMIT 3
```

### Laboratorio
```sql
SELECT id FROM lab_orders
WHERE paciente_id = $userId
AND status IN ('en_proceso', 'muestra_tomada')
```

### Mensajes
```sql
SELECT id FROM messages_new
WHERE sender_id != $userId
AND is_read = false
```

### Telemedicina
```sql
SELECT id FROM telemedicine_sessions
WHERE patient_id = $userId
AND status IN ('waiting', 'active')
```

### Métricas
```sql
SELECT * FROM health_metrics
JOIN health_metric_types ON metric_type_id = health_metric_types.id
WHERE paciente_id = $userId
ORDER BY fecha_medicion DESC
LIMIT 4
```

### Actividad
```sql
SELECT * FROM user_activity_log
WHERE user_id = $userId
ORDER BY created_at DESC
LIMIT 5
```

## Componentes UI Utilizados

- **Card**: Contenedores principales
- **Button**: Acciones y navegación
- **Badge**: Estados y etiquetas
- **Progress**: Barras de progreso (futuro)
- **Tabs**: Organización de contenido (futuro)

## Iconos por Contexto

### Actividades
- `Calendar`: Citas
- `Pill`: Medicamentos
- `Beaker`: Laboratorio
- `MessageSquare`: Mensajes
- `Video`: Telemedicina
- `User`: Perfil
- `Activity`: Métricas

### Estados
- `CheckCircle`: Éxito (verde)
- `AlertCircle`: Error (rojo)
- `Clock`: Pendiente (amarillo)
- `Bell`: Notificación (azul)

## Navegación

Todas las secciones son clickeables y redirigen a:
- `/dashboard/paciente/citas` - Gestión de citas
- `/dashboard/paciente/citas/nueva` - Nueva cita
- `/dashboard/paciente/medicamentos` - Medicamentos
- `/dashboard/paciente/laboratorio` - Resultados de lab
- `/dashboard/paciente/mensajeria` - Mensajes
- `/dashboard/paciente/telemedicina` - Videoconsultas
- `/dashboard/paciente/metricas` - Métricas de salud
- `/dashboard/paciente/metricas/registrar` - Registrar métrica
- `/dashboard/paciente/historial` - Historial clínico
- `/dashboard/paciente/configuracion` - Configuración

## Responsive Design

### Mobile (< 640px)
- Cards en columna única
- Stats en 1 columna
- Contenido apilado verticalmente

### Tablet (640px - 1024px)
- Stats en 2 columnas
- Contenido en 1-2 columnas

### Desktop (> 1024px)
- Stats en 4 columnas
- Contenido principal: 2 columnas
- Sidebar: 1 columna
- Layout 3 columnas total

## Estados de Carga

### Loading
- Spinner centrado
- Mensaje "Cargando dashboard..."
- Bloquea interacción

### Empty States
- Iconos ilustrativos
- Mensajes descriptivos
- Botones de acción (CTA)

### Error States
- Manejo silencioso en consola
- Datos vacíos por defecto
- No bloquea la UI

## Performance

### Optimizaciones
- Carga paralela de datos (Promise.all)
- Límites en queries (LIMIT 3-5)
- Solo datos necesarios (SELECT específico)
- Índices en tablas relacionadas

### Tiempo de Carga Esperado
- < 1 segundo con datos en caché
- < 2 segundos primera carga
- < 500ms navegación interna

## Seguridad

### RLS (Row Level Security)
- Todas las queries filtran por user_id
- Políticas de Supabase activas
- Sin acceso a datos de otros usuarios

### Validaciones
- Verificación de autenticación
- Redirección si no autenticado
- Manejo de errores silencioso

## Mejoras Futuras

### Corto Plazo
- [ ] Gráficos de métricas (Chart.js)
- [ ] Notificaciones push
- [ ] Filtros de actividad
- [ ] Exportar resumen PDF

### Mediano Plazo
- [ ] Widget de clima y salud
- [ ] Recomendaciones personalizadas
- [ ] Integración con wearables
- [ ] Modo offline

### Largo Plazo
- [ ] IA para predicciones
- [ ] Asistente virtual
- [ ] Gamificación
- [ ] Social features

## Testing

### Casos de Prueba

1. **Carga Inicial**
   - Verificar autenticación
   - Cargar todos los datos
   - Mostrar nombre correcto

2. **Navegación**
   - Click en cada card
   - Verificar redirección
   - Mantener estado

3. **Datos Vacíos**
   - Sin citas: mostrar empty state
   - Sin medicamentos: mostrar CTA
   - Sin métricas: botón registrar

4. **Sesión Activa**
   - Detectar telemedicina activa
   - Mostrar alerta
   - Botón funcional

5. **Responsive**
   - Mobile: layout vertical
   - Tablet: 2 columnas
   - Desktop: 3 columnas

## Soporte

Para problemas:
- Revisar logs de consola
- Verificar autenticación
- Comprobar políticas RLS
- Validar datos en Supabase

## Licencia

Propiedad de Red-Salud © 2025
