# 🚀 Despliegue del Servicio Backend SACS

El servicio backend con Puppeteer debe desplegarse en un servidor externo (Railway, Render, etc.) porque Supabase Edge Functions no soportan Puppeteer.

---

## 📋 Requisitos

- Cuenta en Railway o Render (recomendado)
- Node.js 18+
- El código del servicio está en: `sacs-verification-service/`

---

## 🎯 Opción 1: Desplegar en Railway (Recomendado)

### Paso 1: Preparar el Proyecto

1. Asegúrate de tener un `package.json` en `sacs-verification-service/`:

```json
{
  "name": "sacs-verification-service",
  "version": "2.0.0",
  "description": "Servicio de verificación SACS con Puppeteer",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "puppeteer": "^21.6.0",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Paso 2: Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app)
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio
5. Selecciona la carpeta `sacs-verification-service`

### Paso 3: Configurar Variables de Entorno

En Railway, agrega estas variables:

```bash
PORT=3001
NODE_ENV=production
```

### Paso 4: Configurar Build

Railway detectará automáticamente el `package.json` y ejecutará:
- Build: `npm install`
- Start: `npm start`

### Paso 5: Obtener la URL

Una vez desplegado, Railway te dará una URL como:
```
https://sacs-verification-service-production.up.railway.app
```

---

## 🎯 Opción 2: Desplegar en Render

### Paso 1: Crear Web Service

1. Ve a [render.com](https://render.com)
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name**: `sacs-verification-service`
   - **Root Directory**: `sacs-verification-service`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Paso 2: Variables de Entorno

```bash
PORT=3001
NODE_ENV=production
```

### Paso 3: Plan

- Free tier funciona bien para desarrollo
- Para producción, considera el plan Starter ($7/mes)

### Paso 4: Obtener la URL

Render te dará una URL como:
```
https://sacs-verification-service.onrender.com
```

---

## ⚙️ Configurar Supabase Edge Function

Una vez desplegado el backend, configura la variable de entorno en Supabase:

### Opción A: Via Dashboard

1. Ve a tu proyecto en Supabase
2. Settings → Edge Functions
3. Agrega la variable:
   - **Name**: `SACS_BACKEND_URL`
   - **Value**: `https://tu-servicio.railway.app` (o Render)

### Opción B: Via CLI

```bash
supabase secrets set SACS_BACKEND_URL=https://tu-servicio.railway.app
```

---

## 🧪 Probar el Servicio

### 1. Probar el Backend Directamente

```bash
curl -X POST https://tu-servicio.railway.app/verify \
  -H "Content-Type: application/json" \
  -d '{"cedula": "30218596", "tipo_documento": "V"}'
```

### 2. Probar via Edge Function

```bash
curl -X POST https://hwckkfiirldgundbcjsp.supabase.co/functions/v1/verify-doctor-sacs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"cedula": "30218596", "tipo_documento": "V"}'
```

### 3. Probar desde el Dashboard

Simplemente usa el formulario en `/dashboard/medico/perfil/setup`

---

## 📊 Monitoreo

### Railway

- Ve a tu proyecto → Deployments
- Click en "View Logs" para ver logs en tiempo real
- Métricas de CPU y memoria disponibles

### Render

- Ve a tu servicio → Logs
- Logs en tiempo real disponibles
- Métricas en el dashboard

---

## 🔧 Troubleshooting

### Error: "Backend service error: 500"

**Causa**: El servicio backend no está respondiendo

**Solución**:
1. Verifica que el servicio esté corriendo en Railway/Render
2. Revisa los logs del backend
3. Verifica que la URL en `SACS_BACKEND_URL` sea correcta

### Error: "Timeout"

**Causa**: El scraping del SACS está tardando mucho

**Solución**:
1. El SACS puede ser lento, esto es normal
2. Considera aumentar el timeout en Puppeteer
3. En Railway/Render, asegúrate de tener suficientes recursos

### Error: "Puppeteer failed to launch"

**Causa**: Falta configuración de Chromium

**Solución**:
En Railway/Render, asegúrate de que Puppeteer tenga las dependencias necesarias.

Para Render, agrega un `render.yaml`:

```yaml
services:
  - type: web
    name: sacs-verification-service
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PUPPETEER_SKIP_CHROMIUM_DOWNLOAD
        value: false
```

---

## 💰 Costos Estimados

### Railway
- **Free Tier**: $5 de crédito mensual (suficiente para desarrollo)
- **Hobby**: $5/mes por servicio
- **Pro**: $20/mes (más recursos)

### Render
- **Free**: Gratis (con limitaciones, se duerme después de inactividad)
- **Starter**: $7/mes (siempre activo)
- **Standard**: $25/mes (más recursos)

---

## 🔐 Seguridad

### Recomendaciones:

1. **API Key**: Agrega autenticación al servicio backend
2. **Rate Limiting**: Limita las peticiones por IP
3. **CORS**: Configura CORS solo para tu dominio en producción
4. **Logs**: No logees información sensible

### Ejemplo con API Key:

```javascript
// En index.js del backend
const API_KEY = process.env.API_KEY || 'tu-api-key-secreta';

app.post('/verify', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  if (apiKey !== API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'API key inválida'
    });
  }
  
  // ... resto del código
});
```

Y en la Edge Function:

```typescript
const backendResponse = await fetch(`${BACKEND_SERVICE_URL}/verify`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': Deno.env.get('SACS_API_KEY')!,
  },
  body: JSON.stringify({ cedula, tipo_documento }),
});
```

---

## 📝 Checklist de Despliegue

- [ ] Servicio backend desplegado en Railway/Render
- [ ] Variable `SACS_BACKEND_URL` configurada en Supabase
- [ ] Edge Function desplegada (versión 3+)
- [ ] Tabla `verificaciones_sacs` creada
- [ ] Campos SACS agregados a `profiles`
- [ ] Prueba con cédula real exitosa
- [ ] Logs del backend funcionando
- [ ] Monitoreo configurado

---

## 🚀 Próximos Pasos

Una vez desplegado:

1. Prueba con cédulas reales de médicos
2. Monitorea los logs para detectar errores
3. Ajusta timeouts si es necesario
4. Considera agregar caché para cédulas ya verificadas
5. Implementa rate limiting si hay muchas peticiones

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del backend (Railway/Render)
2. Revisa los logs de la Edge Function (Supabase)
3. Verifica que la URL del backend sea correcta
4. Prueba el backend directamente con curl
5. Verifica que el SACS esté disponible: https://sistemas.sacs.gob.ve/consultas/prfsnal_salud
