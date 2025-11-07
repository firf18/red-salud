# 🚀 Despliegue del Sistema de Verificación SACS a Producción

## 📋 Resumen

Sistema completo de verificación de médicos venezolanos mediante scraping del SACS (Servicio Autónomo de Contraloría Sanitaria).

### Componentes:
1. **Servicio Backend** (Node.js + Puppeteer) - Hace el scraping
2. **Edge Function** (Supabase) - Proxy y almacenamiento
3. **Base de Datos** (PostgreSQL) - Logs de verificaciones
4. **Dashboard** (Next.js) - Interfaz de usuario

---

## 🏗️ Arquitectura

```
┌─────────────────┐
│   Dashboard     │
│   (Next.js)     │
└────────┬────────┘
         │
         ↓ POST /verify
┌─────────────────┐
│  Edge Function  │
│   (Supabase)    │
└────────┬────────┘
         │
         ↓ HTTP Request
┌─────────────────┐
│ Backend Service │
│ (Puppeteer)     │
│ Railway/Render  │
└────────┬────────┘
         │
         ↓ Scraping
┌─────────────────┐
│   SACS.gob.ve   │
│  (Sitio Web)    │
└─────────────────┘
```

---

## 📦 PASO 1: Desplegar el Servicio Backend

### Opción A: Railway.app (Recomendado)

1. **Crear cuenta en Railway**: https://railway.app

2. **Crear nuevo proyecto**:
   ```bash
   cd sacs-verification-service
   railway init
   ```

3. **Configurar variables de entorno**:
   ```bash
   railway variables set PORT=3001
   railway variables set NODE_ENV=production
   ```

4. **Desplegar**:
   ```bash
   railway up
   ```

5. **Obtener URL del servicio**:
   - Railway te dará una URL como: `https://tu-servicio.railway.app`
   - Guarda esta URL para el siguiente paso

### Opción B: Render.com

1. **Crear cuenta en Render**: https://render.com

2. **Crear nuevo Web Service**:
   - Conectar repositorio de GitHub
   - Seleccionar carpeta: `sacs-verification-service`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Configurar variables de entorno**:
   ```
   PORT=3001
   NODE_ENV=production
   ```

4. **Desplegar** y obtener la URL

### Verificar el Servicio

```bash
# Health check
curl https://tu-servicio.railway.app/health

# Respuesta esperada:
{
  "status": "ok",
  "service": "SACS Verification Service",
  "version": "2.0.0",
  "timestamp": "2025-11-07T..."
}
```

---

## 🗄️ PASO 2: Crear la Tabla en Supabase

1. **Ir a Supabase Dashboard** → SQL Editor

2. **Ejecutar la migración**:
   ```bash
   # Opción 1: Desde el proyecto
   supabase db push

   # Opción 2: Copiar y pegar el contenido de:
   # supabase/migrations/012_create_verificaciones_sacs_table.sql
   ```

3. **Verificar que se creó**:
   - Ir a Table Editor
   - Buscar tabla `verificaciones_sacs`
   - Verificar que tiene las columnas correctas

---

## ⚡ PASO 3: Configurar la Edge Function

1. **Configurar variable de entorno en Supabase**:
   ```bash
   supabase secrets set SACS_BACKEND_URL=https://tu-servicio.railway.app
   ```

2. **Desplegar la Edge Function**:
   ```bash
   supabase functions deploy verify-doctor-sacs
   ```

3. **Verificar el despliegue**:
   ```bash
   # Obtener la URL de la función
   supabase functions list

   # Probar con curl
   curl -X POST https://tu-proyecto.supabase.co/functions/v1/verify-doctor-sacs \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer TU_ANON_KEY" \
     -d '{"cedula": "15229045", "tipo_documento": "V"}'
   ```

---

## 🎨 PASO 4: Integrar en el Dashboard

### Actualizar el componente de setup del médico

Archivo: `app/dashboard/medico/perfil/setup/page.tsx`

```typescript
async function verificarCedula(cedula: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/verify-doctor-sacs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          cedula,
          tipo_documento: 'V',
          user_id: user.id
        })
      }
    );

    const resultado = await response.json();

    if (resultado.verified && resultado.data?.apto_red_salud) {
      // ✅ Médico verificado y apto
      toast.success(`Bienvenido Dr./Dra. ${resultado.data.nombre_completo}`);
      router.push('/dashboard/medico');
    } else if (resultado.data?.es_veterinario) {
      // ❌ Médico veterinario
      toast.error(resultado.message);
    } else {
      // ❌ No registrado o profesión no habilitada
      toast.error(resultado.message);
    }
  } catch (error) {
    toast.error('Error al verificar la cédula. Intenta nuevamente.');
  }
}
```

---

## 🧪 PASO 5: Pruebas

### Casos de Prueba

#### 1. Médico Válido ✅
```bash
curl -X POST https://tu-proyecto.supabase.co/functions/v1/verify-doctor-sacs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -d '{
    "cedula": "15229045",
    "tipo_documento": "V"
  }'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "verified": true,
  "data": {
    "cedula": "15229045",
    "nombre_completo": "KARIM MOUKHALLALELE",
    "profesion_principal": "MÉDICO(A) CIRUJANO(A)",
    "matricula_principal": "MPPS-68475",
    "especialidad_display": "INFECTOLOGÍA PEDIÁTRICA",
    "es_medico_humano": true,
    "es_veterinario": false,
    "apto_red_salud": true
  },
  "message": "Verificación exitosa. Profesional de salud humana registrado en el SACS."
}
```

#### 2. Médico Veterinario ❌
```bash
curl -X POST ... -d '{"cedula": "7983901", "tipo_documento": "V"}'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "verified": false,
  "data": {
    "es_veterinario": true,
    "apto_red_salud": false
  },
  "message": "Esta cédula corresponde a un médico veterinario...",
  "razon_rechazo": "MEDICO_VETERINARIO"
}
```

#### 3. No Registrado ❌
```bash
curl -X POST ... -d '{"cedula": "30218596", "tipo_documento": "V"}'
```

**Respuesta esperada**:
```json
{
  "success": false,
  "verified": false,
  "message": "Esta cédula no está registrada en el SACS...",
  "razon_rechazo": "NO_REGISTRADO_SACS"
}
```

---

## 📊 PASO 6: Monitoreo

### Ver logs del servicio backend

**Railway**:
```bash
railway logs
```

**Render**:
- Dashboard → Logs

### Ver logs de Edge Function

```bash
supabase functions logs verify-doctor-sacs
```

### Consultar verificaciones en la BD

```sql
-- Ver últimas verificaciones
SELECT 
  cedula,
  nombre_completo,
  profesion_principal,
  apto_red_salud,
  razon_rechazo,
  fecha_verificacion
FROM verificaciones_sacs
ORDER BY fecha_verificacion DESC
LIMIT 10;

-- Estadísticas
SELECT 
  apto_red_salud,
  razon_rechazo,
  COUNT(*) as total
FROM verificaciones_sacs
GROUP BY apto_red_salud, razon_rechazo;
```

---

## 🔒 Seguridad

### Variables de Entorno Requeridas

**Backend Service (Railway/Render)**:
```env
PORT=3001
NODE_ENV=production
```

**Supabase Edge Function**:
```env
SACS_BACKEND_URL=https://tu-servicio.railway.app
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

**Next.js Frontend**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### Rate Limiting

Considera agregar rate limiting en el backend:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 requests por IP
  message: 'Demasiadas solicitudes, intenta más tarde'
});

app.use('/verify', limiter);
```

---

## 🐛 Troubleshooting

### Error: "Backend service error: 503"
- Verificar que el servicio backend esté corriendo
- Revisar logs del backend
- Verificar la URL en `SACS_BACKEND_URL`

### Error: "Navigation timeout"
- El sitio SACS está caído o muy lento
- Aumentar timeouts en el backend
- Reintentar más tarde

### Error: "No se encontraron datos"
- La cédula no existe en el SACS
- Verificar que sea una cédula válida
- El profesional no está registrado

### Puppeteer no funciona en producción
- Asegurarse de que el servicio tenga suficiente memoria (512MB+)
- Verificar que Chromium se instale correctamente
- Usar `headless: 'new'` en la configuración

---

## 📈 Optimizaciones Futuras

1. **Cache de resultados**: Guardar verificaciones por 30 días
2. **Queue system**: Procesar verificaciones en background
3. **Webhooks**: Notificar cuando termine la verificación
4. **Retry logic**: Reintentar automáticamente si falla
5. **Analytics**: Dashboard de estadísticas de verificaciones

---

## ✅ Checklist de Despliegue

- [ ] Servicio backend desplegado en Railway/Render
- [ ] URL del backend configurada en Supabase
- [ ] Tabla `verificaciones_sacs` creada
- [ ] Edge Function desplegada
- [ ] Variables de entorno configuradas
- [ ] Pruebas con las 3 cédulas de ejemplo
- [ ] Integración en el dashboard
- [ ] Monitoreo configurado
- [ ] Documentación actualizada

---

**Última actualización**: 7 de noviembre de 2025  
**Versión**: 2.0.0
