# 🧪 Guía de Prueba del Sistema de Verificación SACS

## 📋 Pre-requisitos

1. **Base de datos actualizada**
2. **Edge Function desplegada**
3. **Servicio backend corriendo** (opcional para pruebas locales)

---

## 🗄️ Paso 1: Aplicar Migración de Base de Datos

```bash
# Conectar a Supabase
supabase link --project-ref TU_PROJECT_REF

# Aplicar migración
supabase db push
```

O aplicar manualmente en el SQL Editor de Supabase:
- Abrir `supabase/migrations/010_create_doctor_verifications_cache.sql`
- Copiar y ejecutar en SQL Editor

---

## ⚡ Paso 2: Desplegar Edge Function

```bash
# Desplegar la función
supabase functions deploy verify-doctor-sacs

# Verificar que se desplegó correctamente
supabase functions list
```

### Configurar Variables de Entorno (si usas servicio backend)

```bash
# En el dashboard de Supabase > Edge Functions > verify-doctor-sacs > Settings
SACS_BACKEND_URL=https://tu-servicio-backend.com
```

---

## 🖥️ Paso 3: Probar Servicio Backend (Opcional)

```bash
cd sacs-verification-service

# Instalar dependencias
npm install

# Probar localmente
npm test

# Iniciar servicio
npm start
```

El servicio estará disponible en `http://localhost:3001`

### Probar endpoint:

```bash
curl -X POST http://localhost:3001/verify \
  -H "Content-Type: application/json" \
  -d '{"cedula": "12345678", "tipo_documento": "V"}'
```

---

## 🧪 Paso 4: Probar Edge Function

### Desde Supabase Dashboard:

1. Ir a **Edge Functions** > `verify-doctor-sacs`
2. Click en **Invoke Function**
3. Body:
```json
{
  "cedula": "12345678",
  "tipo_documento": "V"
}
```

### Desde código:

```typescript
const { data, error } = await supabase.functions.invoke('verify-doctor-sacs', {
  body: { 
    cedula: '12345678',
    tipo_documento: 'V'
  }
});

console.log('Resultado:', data);
```

---

## 🎨 Paso 5: Probar Frontend

1. **Crear usuario médico:**
   - Registrarse con rol "medico"
   - Será redirigido a `/dashboard/medico/perfil/setup`

2. **Completar verificación:**
   - Seleccionar tipo de documento (V o E)
   - Ingresar cédula
   - Click en "Verificar con SACS"

3. **Casos de prueba:**

### ✅ Caso 1: Médico Válido
- Cédula de médico humano registrado en SACS
- Debe mostrar datos verificados
- Permitir completar perfil

### ❌ Caso 2: Médico Veterinario
- Cédula de veterinario
- Debe rechazar con mensaje específico
- No permitir continuar

### ❌ Caso 3: Cédula No Encontrada
- Cédula que no existe en SACS
- Debe mostrar error
- Permitir reintentar

### ✅ Caso 4: Caché
- Verificar misma cédula dos veces
- Segunda vez debe ser instantánea (desde caché)

---

## 🔍 Paso 6: Verificar en Base de Datos

```sql
-- Ver verificaciones en caché
SELECT 
  cedula,
  tipo_documento,
  nombre_completo,
  profesion_principal,
  es_medico_humano,
  es_veterinario,
  verified,
  verified_at
FROM doctor_verifications_cache
ORDER BY verified_at DESC;

-- Ver perfiles de médicos creados
SELECT 
  dd.profile_id,
  dd.full_name,
  dd.document_type,
  dd.document_number,
  dd.license_number,
  dd.main_profession,
  dd.is_verified,
  s.name as specialty
FROM doctor_details dd
LEFT JOIN specialties s ON dd.specialty_id = s.id
ORDER BY dd.created_at DESC;
```

---

## 📊 Resultados Esperados

### ✅ Verificación Exitosa:
```json
{
  "success": true,
  "verified": true,
  "data": {
    "cedula": "12345678",
    "tipo_documento": "V",
    "nombre_completo": "JUAN PEREZ",
    "profesion_principal": "MEDICO CIRUJANO",
    "matricula_principal": "123456",
    "especialidad_display": "Medicina General",
    "es_medico_humano": true,
    "es_veterinario": false,
    "tiene_postgrados": false,
    "profesiones": [...],
    "postgrados": []
  }
}
```

### ❌ Veterinario Rechazado:
```json
{
  "success": false,
  "verified": false,
  "message": "Esta cédula corresponde a un médico veterinario. Red-Salud es solo para profesionales de salud humana."
}
```

---

## 🐛 Troubleshooting

### Error: "Backend service not available"
- Verificar que el servicio backend esté corriendo
- Verificar variable `SACS_BACKEND_URL` en Edge Function

### Error: "SACS website not responding"
- El sitio del SACS puede estar caído
- Intentar más tarde
- Verificar conectividad

### Error: "No se pudieron extraer datos"
- El HTML del SACS puede haber cambiado
- Revisar logs del servicio backend
- Actualizar selectores en `index.js`

### Caché no funciona
- Verificar que la tabla `doctor_verifications_cache` existe
- Verificar permisos de la Edge Function (service role key)

---

## 📝 Logs y Debugging

### Ver logs de Edge Function:
```bash
supabase functions logs verify-doctor-sacs --tail
```

### Ver logs del servicio backend:
```bash
# En la terminal donde corre el servicio
# Los logs aparecen automáticamente
```

### Habilitar logs detallados:
```typescript
// En index.ts de Edge Function
console.log('[EDGE] Verificando:', cedula);
console.log('[EDGE] Resultado:', result);
```

---

## ✅ Checklist de Validación

- [ ] Migración aplicada correctamente
- [ ] Edge Function desplegada
- [ ] Servicio backend funcionando (si aplica)
- [ ] Formulario carga correctamente
- [ ] Selector V/E funciona
- [ ] Validación de cédula funciona
- [ ] Verificación exitosa muestra datos
- [ ] Nombre NO es editable
- [ ] Veterinarios son rechazados
- [ ] Caché funciona correctamente
- [ ] Perfil se crea en `doctor_details`
- [ ] Redirección al dashboard funciona

---

## 🎯 Próximos Pasos

Una vez validado:
1. Configurar servicio backend en producción (Railway, Render, etc.)
2. Actualizar `SACS_BACKEND_URL` en Edge Function
3. Monitorear logs y errores
4. Ajustar timeouts si es necesario
5. Implementar rate limiting si hay muchas consultas
