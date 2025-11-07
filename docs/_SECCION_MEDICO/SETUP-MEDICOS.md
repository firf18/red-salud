# Setup del Sistema de Médicos

## 🎯 Objetivo

Crear un dashboard médico flexible que se adapte automáticamente a cada especialidad, mostrando solo los módulos y funcionalidades relevantes para cada profesional.

## 📋 Pasos de Implementación

### 1. Aplicar Migración de Base de Datos

#### Opción A: Desde Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Copia el contenido de `supabase/migrations/009_create_doctors_system.sql`
4. Pégalo en el editor y ejecuta

#### Opción B: Desde CLI

```bash
# Si tienes Supabase CLI instalado
supabase db push

# O manualmente con psql
psql -h [TU_HOST].supabase.co -U postgres -d postgres -f supabase/migrations/009_create_doctors_system.sql
```

### 2. Verificar Tablas Creadas

Ejecuta en SQL Editor:

```sql
-- Ver especialidades insertadas
SELECT name, icon, color FROM medical_specialties ORDER BY name;

-- Verificar estructura
\d doctor_profiles
\d doctor_reviews
\d doctor_availability_exceptions
```

Deberías ver 10 especialidades médicas pre-cargadas.

### 3. Probar Registro de Médico

1. Ve a `http://localhost:3000/auth/register`
2. Selecciona **"Médico"**
3. Completa el formulario de registro
4. Serás redirigido a `/dashboard/medico/perfil/setup`
5. Completa los 3 pasos del setup:
   - **Paso 1**: Especialidad y matrícula
   - **Paso 2**: Experiencia y contacto
   - **Paso 3**: Configuración de consultas

### 4. Verificar Dashboard Personalizado

Después del setup, verás:
- ✅ Dashboard con módulos según tu especialidad
- ✅ Estadísticas personalizadas
- ✅ Accesos rápidos filtrados
- ✅ Alerta si no estás verificado

## 🏗️ Estructura Creada

```
📁 Sistema de Médicos
├── 📄 supabase/migrations/009_create_doctors_system.sql
│   ├── medical_specialties (10 especialidades)
│   ├── doctor_profiles (perfil extendido)
│   ├── doctor_reviews (calificaciones)
│   └── doctor_availability_exceptions (horarios especiales)
│
├── 📄 lib/supabase/types/doctors.ts
│   └── Tipos TypeScript completos
│
├── 📄 lib/supabase/services/doctors-service.ts
│   ├── getSpecialties()
│   ├── getDoctorProfile()
│   ├── createDoctorProfile()
│   ├── updateDoctorProfile()
│   ├── searchDoctors()
│   ├── getDoctorReviews()
│   ├── getAvailableSlots()
│   └── getDoctorStats()
│
├── 📄 hooks/use-doctor-profile.ts
│   └── Hook personalizado para médicos
│
├── 📄 app/auth/register/medico/page.tsx
│   └── Página de registro
│
└── 📄 app/dashboard/medico/
    ├── page.tsx (Dashboard principal)
    └── perfil/setup/page.tsx (Setup inicial)
```

## 🎨 Especialidades Configuradas

| Especialidad | Módulos Habilitados | Características Especiales |
|-------------|---------------------|---------------------------|
| **Medicina General** | Todos | Dashboard completo |
| **Cardiología** | Todos + Métricas | Seguimiento cardiovascular |
| **Pediatría** | Todos | Adaptado para niños |
| **Dermatología** | Sin laboratorio | Galería de imágenes |
| **Ginecología** | Todos | Historial reproductivo |
| **Traumatología** | Sin telemedicina | Requiere presencial |
| **Psiquiatría** | Todos + Métricas | Salud mental |
| **Oftalmología** | Sin laboratorio | Métricas visuales |
| **Nutrición** | Sin recetas | Planes alimenticios |
| **Odontología** | Sin telemedicina | Odontograma |

## 🔧 Configuración de Módulos

Cada especialidad define qué módulos están habilitados:

```json
{
  "citas": true,          // Gestión de citas
  "historial": true,      // Historiales clínicos
  "recetas": true,        // Prescripciones
  "telemedicina": true,   // Videoconsultas
  "mensajeria": true,     // Chat con pacientes
  "laboratorio": true,    // Resultados de lab
  "metricas": true,       // Signos vitales
  "documentos": true      // Certificados e informes
}
```

## 📊 Datos de Ejemplo

### Crear Médico de Prueba

```sql
-- Primero registra un usuario con rol 'medico'
-- Luego inserta su perfil:

INSERT INTO doctor_profiles (
  id,
  specialty_id,
  license_number,
  license_country,
  years_experience,
  professional_phone,
  consultation_duration,
  consultation_price,
  accepts_insurance,
  bio,
  is_active,
  accepts_new_patients
) VALUES (
  '[USER_ID]', -- ID del usuario registrado
  (SELECT id FROM medical_specialties WHERE name = 'Medicina General'),
  'MP 12345',
  'AR',
  10,
  '+54 11 1234-5678',
  30,
  5000,
  true,
  'Médico general con 10 años de experiencia en atención primaria.',
  true,
  true
);
```

### Agregar Reseña de Prueba

```sql
INSERT INTO doctor_reviews (
  doctor_id,
  patient_id,
  rating,
  comment,
  punctuality_rating,
  communication_rating,
  professionalism_rating,
  is_verified
) VALUES (
  '[DOCTOR_ID]',
  '[PATIENT_ID]',
  5,
  'Excelente atención, muy profesional y empático.',
  5,
  5,
  5,
  true
);
```

## 🔐 Políticas de Seguridad (RLS)

Las políticas implementadas garantizan:

- ✅ Especialidades son públicas (lectura)
- ✅ Perfiles de médicos públicos para búsqueda
- ✅ Solo el médico puede editar su perfil
- ✅ Pacientes pueden crear reseñas
- ✅ Solo el médico ve sus excepciones de horario

## 🚀 Próximos Pasos

1. **Agenda de Citas**
   - Vista diaria/semanal/mensual
   - Gestión de slots disponibles
   - Confirmación de citas

2. **Lista de Pacientes**
   - Búsqueda y filtros
   - Historial de consultas
   - Notas rápidas

3. **Gestión de Horarios**
   - Configurar horarios semanales
   - Agregar excepciones (vacaciones)
   - Bloquear/desbloquear slots

4. **Sistema de Reseñas**
   - Ver reseñas recibidas
   - Responder a comentarios
   - Estadísticas de satisfacción

5. **Integración con Pacientes**
   - Búsqueda de médicos por especialidad
   - Reserva de citas
   - Sistema de favoritos

## 🐛 Troubleshooting

### Error: "Specialty not found"
- Verifica que las especialidades se insertaron correctamente
- Ejecuta: `SELECT * FROM medical_specialties;`

### Error: "License number already exists"
- Cada matrícula debe ser única
- Usa un número diferente o agrega sufijo

### Dashboard no muestra módulos
- Verifica que el perfil tenga `specialty_id` asignado
- Revisa `modules_config` de la especialidad

### No se puede crear perfil
- Asegúrate de que el usuario tenga rol 'medico' en `profiles`
- Verifica que el `user_id` exista

## 📝 Notas Importantes

1. **Verificación de Médicos**: Los médicos deben ser verificados por un admin antes de aparecer destacados
2. **Matrícula Profesional**: Es obligatoria y debe ser única
3. **Horarios**: Se configuran por día de semana con múltiples slots
4. **Precios**: Opcionales, algunos médicos pueden no publicar precios
5. **Obras Sociales**: Sistema preparado para múltiples prepagas

## 🎓 Recursos

- [Documentación Completa](./sistema-medicos.md)
- [Tipos TypeScript](../lib/supabase/types/doctors.ts)
- [Servicios](../lib/supabase/services/doctors-service.ts)
- [Migración SQL](../supabase/migrations/009_create_doctors_system.sql)

---

**¿Preguntas?** Revisa la documentación completa en `docs/sistema-medicos.md`
