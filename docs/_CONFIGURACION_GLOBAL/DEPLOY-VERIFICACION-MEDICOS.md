# Guía de Despliegue - Sistema de Verificación de Médicos

## Resumen
Sistema completo de verificación profesional para médicos venezolanos mediante SACS.

## Pasos de Despliegue

### 1. Aplicar Migración de Base de Datos

Ejecuta en el **SQL Editor** de Supabase Dashboard:

```sql
-- Agregar campo para datos de verificación SACS
ALTER TABLE doctor_profiles 
ADD COLUMN IF NOT EXISTS verification_data JSONB DEFAULT '{}'::jsonb;

-- Índice para búsquedas por verificación
CREATE INDEX IF NOT EXISTS idx_doctor_verification 
ON doctor_profiles USING gin(verification_data);

COMMENT ON COLUMN doctor_profiles.verification_data 
IS 'Datos de verificación del SACS y otros sistemas';
```

### 2. Verificar Políticas RLS

Asegúrate de que estas políticas existan:

```sql
-- Especialidades públicas para lectura
CREATE POLICY IF NOT EXISTS "Especialidades son públicas"
  ON medical_specialties FOR SELECT
  TO authenticated
  USING (true);

-- Médicos pueden insertar su propio perfil
CREATE POLICY IF NOT EXISTS "Médicos pueden insertar su propio perfil"
  ON doctor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Médicos pueden actualizar su propio perfil
CREATE POLICY IF NOT EXISTS "Médicos pueden actualizar su propio perfil"
  ON doctor_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Médicos pueden leer su propio perfil
CREATE POLICY IF NOT EXISTS "Médicos pueden ver su propio perfil"
  ON doctor_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR is_active = true);
```

### 3. Desplegar Edge Function

#### Instalar Supabase CLI (si no lo tienes)

**Windows (PowerShell)**:
```powershell
scoop install supabase
```

**macOS**:
```bash
brew install supabase/tap/supabase
```

**Linux**:
```bash
curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh
```

#### Desplegar la función

```bash
# 1. Login en Supabase
supabase login

# 2. Link al proyecto (reemplaza con tu project ref)
supabase link --project-ref TU_PROJECT_REF

# 3. Desplegar la función
supabase functions deploy verify-doctor-sacs

# 4. Verificar que se desplegó
supabase functions list
```

### 4. Configurar Variables de Entorno (Opcional)

Si necesitas configurar variables para la Edge Function:

```bash
supabase secrets set SACS_URL=https://sistemas.sacs.gob.ve/consultas/prfsnal_salud
```

### 5. Verificar Despliegue

#### Test desde la consola del navegador

```javascript
// Abre la consola en tu app
const { data, error } = await supabase.functions.invoke('verify-doctor-sacs', {
  body: { cedula: '12345678' }
});

console.log('Resultado:', data);
```

#### Test con curl

```bash
curl -i --location --request POST \
  'https://TU_PROJECT_REF.supabase.co/functions/v1/verify-doctor-sacs' \
  --header 'Authorization: Bearer TU_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"cedula":"12345678"}'
```

## Verificación Post-Despliegue

### Checklist

- [ ] Migración aplicada sin errores
- [ ] Políticas RLS configuradas
- [ ] Edge Function desplegada
- [ ] Función aparece en Supabase Dashboard > Edge Functions
- [ ] Test de función retorna respuesta (aunque sea error de cédula no encontrada)
- [ ] Dashboard de médico muestra overlay de verificación
- [ ] Formulario de setup funciona
- [ ] No hay errores en consola del navegador

### Probar Flujo Completo

1. **Crear cuenta de médico**:
   - Ir a `/auth/register/medico`
   - Registrarse con email

2. **Acceder al dashboard**:
   - Ir a `/dashboard/medico`
   - Debe mostrar overlay de verificación

3. **Completar verificación**:
   - Click en "Comenzar Verificación"
   - Ingresar cédula venezolana
   - Completar perfil
   - Verificar que redirige al dashboard completo

## Troubleshooting

### Error: "Function not found"
```bash
# Verificar que la función esté desplegada
supabase functions list

# Re-desplegar si es necesario
supabase functions deploy verify-doctor-sacs
```

### Error: "Permission denied"
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'doctor_profiles';

-- Re-crear políticas si es necesario
```

### Error: "Column verification_data does not exist"
```sql
-- Verificar que la migración se aplicó
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'doctor_profiles';

-- Aplicar migración si falta
ALTER TABLE doctor_profiles 
ADD COLUMN verification_data JSONB DEFAULT '{}'::jsonb;
```

### Error en Edge Function
```bash
# Ver logs de la función
supabase functions logs verify-doctor-sacs

# Ver logs en tiempo real
supabase functions logs verify-doctor-sacs --follow
```

## Rollback (Si es necesario)

### Revertir Migración
```sql
-- Eliminar columna
ALTER TABLE doctor_profiles DROP COLUMN IF EXISTS verification_data;

-- Eliminar índice
DROP INDEX IF EXISTS idx_doctor_verification;
```

### Eliminar Edge Function
```bash
supabase functions delete verify-doctor-sacs
```

## Monitoreo

### Métricas a Revisar

1. **Edge Function**:
   - Invocaciones por día
   - Tasa de error
   - Tiempo de respuesta

2. **Base de Datos**:
   - Perfiles de médicos creados
   - Tasa de verificación exitosa
   - Errores en logs

3. **Frontend**:
   - Errores en consola
   - Tiempo de carga del dashboard
   - Tasa de conversión del setup

## Soporte

### Logs Importantes

**Edge Function**:
```bash
supabase functions logs verify-doctor-sacs --limit 50
```

**Database**:
```sql
-- Ver últimos perfiles creados
SELECT 
  id,
  created_at,
  is_verified,
  verification_data->>'sacs_verified' as sacs_verified
FROM doctor_profiles
ORDER BY created_at DESC
LIMIT 10;
```

### Contacto

Si encuentras problemas:
1. Revisar logs de Supabase Dashboard
2. Verificar consola del navegador
3. Consultar documentación de Supabase Edge Functions
4. Revisar el archivo `docs/MEJORAS-DASHBOARD-MEDICO.md`

## Próximos Pasos

Después del despliegue exitoso:

1. **Testing exhaustivo** con cédulas reales
2. **Monitorear** logs por 24-48 horas
3. **Ajustar** timeouts si es necesario
4. **Documentar** casos edge encontrados
5. **Optimizar** scraping si hay problemas de performance

## Notas Importantes

- La verificación depende de la disponibilidad del sitio del SACS
- Los datos son públicos y oficiales
- El scraping puede fallar si el SACS cambia su estructura HTML
- Considerar implementar caché para cédulas ya verificadas
- Implementar rate limiting si hay muchas verificaciones simultáneas
