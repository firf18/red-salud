# Crear Doctores de Prueba

## Paso 1: Crear Usuarios en Supabase Auth

Ve a tu proyecto en Supabase Dashboard > Authentication > Users y crea 3 nuevos usuarios:

1. **Dr. Carlos García**
   - Email: `dr.garcia@redsalud.com`
   - Password: `Test123456!`

2. **Dra. Ana Martínez**
   - Email: `dra.martinez@redsalud.com`
   - Password: `Test123456!`

3. **Dr. Luis Rodríguez**
   - Email: `dr.rodriguez@redsalud.com`
   - Password: `Test123456!`

## Paso 2: Ejecutar Script SQL

Una vez creados los usuarios, ejecuta este script en SQL Editor:

```sql
-- Actualizar roles a médico
UPDATE profiles 
SET role = 'medico'
WHERE email IN ('dr.garcia@redsalud.com', 'dra.martinez@redsalud.com', 'dr.rodriguez@redsalud.com');

-- Crear perfiles de doctores
DO $$
DECLARE
  doctor_id_1 UUID;
  doctor_id_2 UUID;
  doctor_id_3 UUID;
  specialty_general UUID;
  specialty_cardio UUID;
  specialty_pediatria UUID;
BEGIN
  -- Obtener IDs
  SELECT id INTO doctor_id_1 FROM profiles WHERE email = 'dr.garcia@redsalud.com';
  SELECT id INTO doctor_id_2 FROM profiles WHERE email = 'dra.martinez@redsalud.com';
  SELECT id INTO doctor_id_3 FROM profiles WHERE email = 'dr.rodriguez@redsalud.com';
  
  SELECT id INTO specialty_general FROM specialties WHERE name = 'Medicina General';
  SELECT id INTO specialty_cardio FROM specialties WHERE name = 'Cardiología';
  SELECT id INTO specialty_pediatria FROM specialties WHERE name = 'Pediatría';
  
  -- Doctor 1: Medicina General
  INSERT INTO doctor_details (
    profile_id,
    licencia_medica,
    especialidad_id,
    anos_experiencia,
    biografia,
    tarifa_consulta,
    verified,
    idiomas,
    horario_atencion
  )
  VALUES (
    doctor_id_1,
    'MED-12345',
    specialty_general,
    15,
    'Médico general con 15 años de experiencia en atención primaria. Especializado en medicina preventiva y diagnóstico temprano.',
    45.00,
    true,
    ARRAY['Español', 'Inglés'],
    '{"lunes": "09:00-17:00", "martes": "09:00-17:00", "miercoles": "09:00-17:00", "jueves": "09:00-17:00", "viernes": "09:00-17:00"}'::jsonb
  )
  ON CONFLICT (profile_id) DO NOTHING;
  
  -- Doctor 2: Cardiología
  INSERT INTO doctor_details (
    profile_id,
    licencia_medica,
    especialidad_id,
    anos_experiencia,
    biografia,
    tarifa_consulta,
    verified,
    idiomas,
    horario_atencion
  )
  VALUES (
    doctor_id_2,
    'CARD-67890',
    specialty_cardio,
    20,
    'Cardióloga certificada con amplia experiencia en enfermedades cardiovasculares y prevención.',
    80.00,
    true,
    ARRAY['Español', 'Inglés', 'Francés'],
    '{"lunes": "10:00-18:00", "miercoles": "10:00-18:00", "viernes": "10:00-18:00"}'::jsonb
  )
  ON CONFLICT (profile_id) DO NOTHING;
  
  -- Doctor 3: Pediatría
  INSERT INTO doctor_details (
    profile_id,
    licencia_medica,
    especialidad_id,
    anos_experiencia,
    biografia,
    tarifa_consulta,
    verified,
    idiomas,
    horario_atencion
  )
  VALUES (
    doctor_id_3,
    'PED-11223',
    specialty_pediatria,
    12,
    'Pediatra dedicado al cuidado integral de niños y adolescentes. Enfoque en desarrollo infantil.',
    55.00,
    true,
    ARRAY['Español'],
    '{"lunes": "08:00-14:00", "martes": "08:00-14:00", "miercoles": "08:00-14:00", "jueves": "08:00-14:00", "viernes": "08:00-14:00"}'::jsonb
  )
  ON CONFLICT (profile_id) DO NOTHING;
  
END $$;

-- Verificar
SELECT 
  p.nombre_completo,
  p.email,
  s.name as especialidad,
  dd.tarifa_consulta,
  dd.anos_experiencia,
  dd.verified
FROM doctor_details dd
JOIN profiles p ON p.id = dd.profile_id
LEFT JOIN specialties s ON s.id = dd.especialidad_id
WHERE dd.verified = true;
```

## Alternativa Rápida: Convertir Usuario Existente

Si prefieres convertir un usuario existente en doctor para pruebas:

```sql
-- Reemplaza 'TU_EMAIL@gmail.com' con tu email
UPDATE profiles SET role = 'medico' WHERE email = 'TU_EMAIL@gmail.com';

-- Crear perfil de doctor
INSERT INTO doctor_details (
  profile_id,
  licencia_medica,
  especialidad_id,
  anos_experiencia,
  biografia,
  tarifa_consulta,
  verified,
  idiomas
)
SELECT 
  id,
  'TEST-001',
  (SELECT id FROM specialties WHERE name = 'Medicina General'),
  10,
  'Doctor de prueba',
  50.00,
  true,
  ARRAY['Español']
FROM profiles 
WHERE email = 'TU_EMAIL@gmail.com'
ON CONFLICT (profile_id) DO NOTHING;
```
