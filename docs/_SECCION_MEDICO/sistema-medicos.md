# Sistema de Médicos - Dashboard Flexible por Especialidad

## Visión General

El sistema de médicos está diseñado para ser **flexible y adaptable** a todas las especialidades médicas. Cada especialidad tiene configuración personalizada de módulos y campos, permitiendo que el dashboard se ajuste automáticamente a las necesidades específicas de cada profesional.

## Arquitectura del Sistema

### 1. Especialidades Médicas (`medical_specialties`)

Cada especialidad define:
- **Módulos habilitados**: Qué funcionalidades están disponibles
- **Campos personalizados**: Campos específicos para consultas
- **Configuración visual**: Iconos y colores

#### Especialidades Incluidas

1. **Medicina General** - Dashboard completo con todos los módulos
2. **Cardiología** - Enfoque en métricas cardiovasculares
3. **Pediatría** - Adaptado para pacientes pediátricos
4. **Dermatología** - Sin laboratorio, con galería de imágenes
5. **Ginecología** - Historial reproductivo especializado
6. **Traumatología** - Sin telemedicina (requiere presencial)
7. **Psiquiatría** - Enfoque en salud mental y seguimiento
8. **Oftalmología** - Métricas visuales específicas
9. **Nutrición** - Sin recetas, con planes alimenticios
10. **Odontología** - Odontograma y tratamientos dentales

### 2. Perfil del Médico (`doctor_profiles`)

Información completa del profesional:

#### Datos Profesionales
- Matrícula y país de emisión
- Años de experiencia
- Educación y certificaciones
- Idiomas que habla

#### Configuración de Consultas
- Duración de consulta (15-120 minutos)
- Precio por consulta
- Aceptación de obras sociales
- Horarios de atención por día

#### Verificación
- Estado de verificación
- Fecha y responsable de verificación

#### Estadísticas
- Total de consultas
- Calificación promedio
- Total de reseñas

### 3. Sistema de Horarios

#### Horario Regular (`schedule`)
```json
{
  "monday": {
    "enabled": true,
    "slots": [
      {"start": "09:00", "end": "13:00"},
      {"start": "15:00", "end": "19:00"}
    ]
  }
}
```

#### Excepciones (`doctor_availability_exceptions`)
- Vacaciones o días no disponibles
- Horarios especiales (ej: sábado excepcional)
- Razón de la excepción

### 4. Sistema de Reseñas

Los pacientes pueden calificar:
- **Rating general** (1-5 estrellas)
- **Puntualidad**
- **Comunicación**
- **Profesionalismo**
- Comentario opcional
- Opción de reseña anónima

## Módulos del Dashboard

### Módulos Principales

1. **Citas** (`citas`)
   - Agenda diaria/semanal/mensual
   - Gestión de citas
   - Historial de consultas

2. **Historial Clínico** (`historial`)
   - Acceso a historiales de pacientes
   - Notas de evolución
   - Documentos médicos

3. **Recetas** (`recetas`)
   - Prescripción de medicamentos
   - Historial de recetas
   - Plantillas de recetas frecuentes

4. **Telemedicina** (`telemedicina`)
   - Videoconsultas
   - Chat en tiempo real
   - Grabación de sesiones

5. **Mensajería** (`mensajeria`)
   - Comunicación asíncrona con pacientes
   - Consultas rápidas
   - Notificaciones

6. **Laboratorio** (`laboratorio`)
   - Solicitud de estudios
   - Visualización de resultados
   - Interpretación de análisis

7. **Métricas** (`metricas`)
   - Seguimiento de signos vitales
   - Gráficos de evolución
   - Alertas automáticas

8. **Documentos** (`documentos`)
   - Certificados médicos
   - Informes
   - Consentimientos

## Personalización por Especialidad

### Ejemplo: Cardiología

```json
{
  "modules_config": {
    "citas": true,
    "historial": true,
    "recetas": true,
    "telemedicina": true,
    "mensajeria": true,
    "laboratorio": true,
    "metricas": true,  // ← Importante para cardiólogos
    "documentos": true
  },
  "custom_fields": [
    {
      "id": "ecg_result",
      "name": "Resultado ECG",
      "type": "textarea",
      "required": false
    },
    {
      "id": "heart_rate_variability",
      "name": "Variabilidad FC",
      "type": "number",
      "required": false
    }
  ]
}
```

### Ejemplo: Dermatología

```json
{
  "modules_config": {
    "citas": true,
    "historial": true,
    "recetas": true,
    "telemedicina": true,  // ← Útil para seguimiento de lesiones
    "mensajeria": true,
    "laboratorio": false,  // ← No necesita laboratorio
    "metricas": false,
    "documentos": true
  },
  "custom_fields": [
    {
      "id": "skin_type",
      "name": "Tipo de Piel",
      "type": "select",
      "options": ["Tipo I", "Tipo II", "Tipo III", "Tipo IV", "Tipo V", "Tipo VI"]
    },
    {
      "id": "lesion_photos",
      "name": "Fotos de Lesiones",
      "type": "file_upload",
      "multiple": true
    }
  ]
}
```

## Flujo de Registro de Médico

1. **Selección de Rol**: Usuario elige "Médico" en `/auth/register`
2. **Registro Básico**: Email, contraseña, nombre
3. **Setup Profesional**: `/dashboard/medico/perfil/setup`
   - Paso 1: Especialidad y matrícula
   - Paso 2: Experiencia y contacto
   - Paso 3: Configuración de consultas
4. **Dashboard Personalizado**: Módulos según especialidad

## Búsqueda de Médicos

Los pacientes pueden buscar médicos por:
- Especialidad
- Calificación mínima
- Acepta obras sociales
- Precio máximo
- Idiomas
- Disponibilidad

## Estadísticas del Médico

El dashboard muestra:
- Citas del día
- Total de pacientes atendidos
- Consultas completadas
- Calificación promedio
- Próximas citas
- Mensajes pendientes

## Verificación de Médicos

Para garantizar la calidad:
1. Médico completa perfil con matrícula
2. Admin verifica documentación
3. Perfil marcado como "Verificado"
4. Badge de verificación visible para pacientes

## Integración con Sistema de Citas

El sistema de médicos se integra con:
- **Appointments**: Gestión de citas
- **Messaging**: Comunicación con pacientes
- **Telemedicine**: Consultas virtuales
- **Medical Records**: Historiales clínicos

## Próximos Pasos

1. ✅ Migración de base de datos
2. ✅ Tipos TypeScript
3. ✅ Servicios y hooks
4. ✅ Páginas de registro/login
5. ✅ Dashboard principal
6. ✅ Setup de perfil
7. ⏳ Página de agenda/citas
8. ⏳ Lista de pacientes
9. ⏳ Gestión de horarios
10. ⏳ Sistema de reseñas

## Archivos Creados

```
supabase/migrations/
  └── 009_create_doctors_system.sql

lib/supabase/
  ├── types/doctors.ts
  └── services/doctors-service.ts

hooks/
  └── use-doctor-profile.ts

app/
  ├── auth/register/medico/page.tsx
  └── dashboard/medico/
      ├── page.tsx
      └── perfil/setup/page.tsx

docs/
  └── sistema-medicos.md
```

## Comandos para Aplicar

```bash
# Aplicar migración
psql -h [HOST] -U postgres -d postgres -f supabase/migrations/009_create_doctors_system.sql

# O desde Supabase Dashboard > SQL Editor
```

## Respuesta a tu Pregunta

> ¿Cómo hacer un dashboard que no sea genérico y sea personalizado para todas las especialidades?

**Solución implementada:**

1. **Configuración por Especialidad**: Cada especialidad define qué módulos están habilitados
2. **Campos Personalizados**: Sistema de campos dinámicos según necesidades
3. **Dashboard Adaptativo**: El frontend renderiza solo los módulos habilitados
4. **Plantillas Flexibles**: Cada especialidad puede tener plantillas de consulta propias
5. **Métricas Relevantes**: Solo se muestran las métricas importantes para cada especialidad

Esto permite que un cardiólogo vea métricas cardiovasculares, un dermatólogo tenga galería de imágenes, y un nutricionista trabaje con planes alimenticios, todo desde la misma plataforma pero con experiencias personalizadas.
