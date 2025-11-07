# Guía de Prueba - Verificación de Médicos

## Preparación

### 1. Aplicar Migración
Ejecuta en el SQL Editor de Supabase:
```sql
-- Agregar campo para datos de verificación SACS
ALTER TABLE doctor_profiles 
ADD COLUMN IF NOT EXISTS verification_data JSONB DEFAULT '{}'::jsonb;

-- Índice para búsquedas por verificación
CREATE INDEX IF NOT EXISTS idx_doctor_verification ON doctor_profiles USING gin(verification_data);
```

### 2. Desplegar Edge Function
```bash
# Login en Supabase
supabase login

# Link al proyecto
supabase link --project-ref TU_PROJECT_REF

# Desplegar función
supabase functions deploy verify-doctor-sacs
```

### 3. Verificar Políticas RLS
Asegúrate de que estas políticas existan:

```sql
-- Especialidades públicas
CREATE POLICY IF NOT EXISTS "Especialidades son públicas"
  ON medical_specialties FOR SELECT
  TO authenticated
  USING (true);

-- Médicos pueden crear su perfil
CREATE POLICY IF NOT EXISTS "Médicos pueden insertar su propio perfil"
  ON doctor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Médicos pueden actualizar su perfil
CREATE POLICY IF NOT EXISTS "Médicos pueden actualizar su propio perfil"
  ON doctor_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
```

## Flujo de Prueba

### Escenario 1: Médico Nuevo (Sin Perfil)

1. **Crear cuenta de médico**:
   - Ir a `/auth/register/medico`
   - Registrarse con email y contraseña
   - Confirmar email

2. **Acceder al dashboard**:
   - Ir a `/dashboard/medico`
   - Debe mostrar:
     - Dashboard con blur de fondo
     - Modal de verificación profesional
     - Botón "Comenzar Verificación"

3. **Iniciar verificación**:
   - Click en "Comenzar Verificación"
   - Redirige a `/dashboard/medico/perfil/setup`
   - Muestra formulario de verificación SACS

4. **Verificar con SACS**:
   - Ingresar cédula venezolana (solo números)
   - Click en "Verificar Identidad"
   - Debe mostrar:
     - Loading spinner
     - Mensaje "Verificando con SACS..."

5. **Completar perfil**:
   - Si la verificación es exitosa:
     - Muestra datos verificados en panel verde
     - Formulario para completar información
   - Llenar:
     - Especialidad
     - Teléfono (opcional)
     - Email profesional (opcional)
     - Biografía (opcional)
   - Click en "Completar Registro"

6. **Verificar dashboard**:
   - Redirige a `/dashboard/medico`
   - Dashboard completo sin overlay
   - Muestra estadísticas
   - Acceso a todos los módulos

### Escenario 2: Médico con Perfil

1. **Login**:
   - Ir a `/auth/login/medico`
   - Ingresar credenciales

2. **Dashboard**:
   - Debe mostrar dashboard completo
   - Sin overlay de verificación
   - Estadísticas visibles:
     - Citas Hoy: 0
     - Pacientes Totales: 0
     - Consultas Completadas: 0
     - Calificación: 0.0

3. **Navegación**:
   - Verificar que todos los módulos sean accesibles
   - Click en cada tarjeta de acceso rápido

### Escenario 3: Error en Verificación

1. **Cédula inválida**:
   - Ingresar cédula con letras
   - Debe mostrar: "Solo números"

2. **Cédula no encontrada**:
   - Ingresar cédula que no existe en SACS
   - Debe mostrar: "No se encontró registro en SACS"

3. **Error de conexión**:
   - Si SACS no responde
   - Debe mostrar: "Error al conectar con el servicio de verificación"

## Verificación de Datos

### En Supabase Dashboard

1. **Tabla doctor_profiles**:
```sql
SELECT 
  id,
  specialty_id,
  license_number,
  license_country,
  is_verified,
  verified_at,
  verification_data
FROM doctor_profiles;
```

Debe mostrar:
- `license_country`: 'VE'
- `is_verified`: true
- `verified_at`: timestamp
- `verification_data`: JSON con datos del SACS

2. **Tabla medical_specialties**:
```sql
SELECT * FROM medical_specialties ORDER BY name;
```

Debe tener al menos 10 especialidades.

## Pruebas de Edge Function

### Desde la consola de Supabase

```javascript
// En la consola del navegador
const { data, error } = await supabase.functions.invoke('verify-doctor-sacs', {
  body: { cedula: '12345678' }
});

console.log('Resultado:', data);
console.log('Error:', error);
```

### Con curl

```bash
curl -i --location --request POST 'https://TU_PROJECT_REF.supabase.co/functions/v1/verify-doctor-sacs' \
  --header 'Authorization: Bearer TU_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"cedula":"12345678"}'
```

## Checklist de Verificación

- [ ] Migración aplicada correctamente
- [ ] Edge Function desplegada
- [ ] Políticas RLS configuradas
- [ ] Especialidades cargadas en la BD
- [ ] Dashboard muestra overlay para médicos sin perfil
- [ ] Formulario de verificación funciona
- [ ] Verificación SACS retorna datos
- [ ] Perfil se crea correctamente
- [ ] Dashboard completo se muestra después del setup
- [ ] No hay errores en la consola del navegador
- [ ] Estadísticas se cargan sin errores

## Problemas Comunes

### "Error fetching specialties"
- Verificar que la tabla `medical_specialties` existe
- Ejecutar la migración 009_create_doctors_system.sql
- Verificar política RLS de lectura

### "Error calling verification function"
- Verificar que la Edge Function esté desplegada
- Revisar logs en Supabase Dashboard > Edge Functions
- Confirmar que el nombre sea exactamente 'verify-doctor-sacs'

### "No se encontró registro en SACS"
- Verificar que la cédula sea válida
- Confirmar que el médico esté registrado en SACS
- Probar con otra cédula conocida

### Dashboard no redirige después del setup
- Verificar que el perfil se creó en la BD
- Revisar errores en la consola
- Confirmar que `is_verified` sea true

## Datos de Prueba

### Cédulas de Ejemplo (Ficticias)
Para testing, puedes usar:
- 12345678
- 23456789
- 34567890

**Nota**: Estas son ficticias. Para pruebas reales necesitas cédulas de médicos venezolanos registrados en el SACS.

## Logs a Revisar

### Navegador
- Console: Errores de JavaScript
- Network: Llamadas a la API
- Application > Local Storage: Datos de sesión

### Supabase
- Logs > Edge Functions: Errores de la función
- Database > Logs: Errores de queries
- Auth > Users: Usuarios creados
