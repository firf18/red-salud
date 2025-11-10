# 🚀 Despliegue del Servicio SACS Backend

El servicio de verificación SACS requiere Puppeteer (navegador headless) para hacer scraping del sistema oficial SACS de Venezuela. Este servicio debe desplegarse en un servidor separado.

## 📋 Requisitos

- Node.js 18+
- Servidor con soporte para Puppeteer (Railway, Render, Heroku, VPS)
- 512MB RAM mínimo (recomendado 1GB)

## 🎯 Opciones de Despliegue

### Opción 1: Railway (Recomendado) ⭐

Railway detecta automáticamente Node.js y tiene buen soporte para Puppeteer.

#### Pasos:

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app)
   - Regístrate con GitHub

2. **Crear nuevo proyecto**
   ```bash
   # Desde la carpeta raíz del proyecto
   cd sacs-verification-service
   
   # Inicializar git si no está inicializado
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Desplegar**
   - En Railway: "New Project" → "Deploy from GitHub repo"
   - Selecciona el repositorio
   - Railway detectará automáticamente el `package.json`
   - Root Directory: `sacs-verification-service`

4. **Configurar Variables de Entorno** (opcional)
   ```
   PORT=3001
   NODE_ENV=production
   ```

5. **Obtener URL del servicio**
   - Railway te dará una URL como: `https://tu-servicio.up.railway.app`
   - Copia esta URL

6. **Configurar en Supabase Edge Function**
   - Ve a Supabase Dashboard → Edge Functions → Settings
   - Agrega variable de entorno:
     ```
     SACS_BACKEND_URL=https://tu-servicio.up.railway.app
     ```

### Opción 2: Render

1. **Crear cuenta en Render**
   - Ve a [render.com](https://render.com)

2. **Crear Web Service**
   - New → Web Service
   - Conecta tu repositorio
   - Configuración:
     ```
     Name: sacs-verification-service
     Root Directory: sacs-verification-service
     Environment: Node
     Build Command: npm install
     Start Command: npm start
     ```

3. **Plan**: Free tier funciona, pero puede ser lento en cold starts

4. **Variables de entorno**:
   ```
   PORT=3001
   NODE_ENV=production
   ```

5. **Obtener URL**: `https://tu-servicio.onrender.com`

### Opción 3: VPS (DigitalOcean, Linode, etc.)

Si prefieres más control:

```bash
# Conectar al servidor
ssh user@tu-servidor.com

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar dependencias de Chromium
sudo apt-get install -y \
  chromium-browser \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils

# Clonar repositorio
git clone https://github.com/tu-usuario/red-salud.git
cd red-salud/sacs-verification-service

# Instalar dependencias
npm install

# Configurar PM2 para mantener el servicio corriendo
sudo npm install -g pm2
pm2 start index.js --name sacs-service
pm2 save
pm2 startup

# Configurar Nginx como reverse proxy (opcional)
sudo apt-get install nginx
# Configurar proxy en /etc/nginx/sites-available/default
```

## 🧪 Probar el Servicio

### Localmente

```bash
cd sacs-verification-service
npm install
npm start

# En otra terminal
curl http://localhost:3001/health

# Probar verificación
curl -X POST http://localhost:3001/verify \
  -H "Content-Type: application/json" \
  -d '{"cedula": "12345678", "tipo_documento": "V"}'
```

### En Producción

```bash
# Health check
curl https://tu-servicio.railway.app/health

# Verificación
curl -X POST https://tu-servicio.railway.app/verify \
  -H "Content-Type: application/json" \
  -d '{"cedula": "12345678", "tipo_documento": "V"}'
```

## 🔧 Configurar Edge Function de Supabase

Una vez desplegado el servicio backend:

1. **Ir a Supabase Dashboard**
   - Project → Edge Functions → Settings

2. **Agregar variable de entorno**
   ```
   SACS_BACKEND_URL=https://tu-servicio.railway.app
   ```

3. **Desplegar Edge Function**
   ```bash
   # Instalar Supabase CLI
   npm install -g supabase

   # Login
   supabase login

   # Desplegar función
   supabase functions deploy verify-doctor-sacs
   ```

4. **Probar desde el frontend**
   - La función de setup del médico ahora debería funcionar
   - Ve a `/dashboard/medico/perfil/setup`

## 📊 Monitoreo

### Railway
- Dashboard → Metrics
- Ver logs en tiempo real
- Alertas automáticas

### Render
- Dashboard → Logs
- Métricas de uso

### VPS
```bash
# Ver logs con PM2
pm2 logs sacs-service

# Monitorear recursos
pm2 monit
```

## 🐛 Troubleshooting

### Error: "Puppeteer failed to launch"

**Solución**: Instalar dependencias de Chromium

```bash
# Ubuntu/Debian
sudo apt-get install -y chromium-browser fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 libnspr4 libnss3 libxcomposite1 libxdamage1 libxrandr2 xdg-utils
```

### Error: "Timeout"

**Solución**: El SACS puede estar lento. Aumentar timeout:

```javascript
// En index.js
page.setDefaultTimeout(60000); // 60 segundos
```

### Error: "Memory limit exceeded"

**Solución**: Aumentar memoria del servicio
- Railway: Settings → Resources → Increase memory
- Render: Upgrade plan

### Cold Starts Lentos (Render Free Tier)

**Solución**: 
- Upgrade a plan pago
- O usar Railway (no tiene cold starts)
- O implementar keep-alive ping

## 💰 Costos Estimados

### Railway
- Free tier: $5 crédito mensual
- Hobby: $5/mes (suficiente para este servicio)
- Pro: $20/mes (si necesitas más recursos)

### Render
- Free: $0 (con cold starts)
- Starter: $7/mes (sin cold starts)

### VPS
- DigitalOcean Droplet: $6/mes (1GB RAM)
- Linode: $5/mes (1GB RAM)

## 🔐 Seguridad

### Recomendaciones:

1. **No exponer públicamente**: Solo la Edge Function debe acceder
2. **Agregar API Key** (opcional):
   ```javascript
   // En index.js
   app.use((req, res, next) => {
     const apiKey = req.headers['x-api-key'];
     if (apiKey !== process.env.API_KEY) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     next();
   });
   ```

3. **Rate Limiting**:
   ```bash
   npm install express-rate-limit
   ```
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutos
     max: 100 // límite de requests
   });
   app.use(limiter);
   ```

4. **CORS**: Ya configurado para aceptar solo desde tu dominio

5. **HTTPS**: Railway y Render lo proveen automáticamente

## ✅ Checklist de Despliegue

- [ ] Servicio desplegado en Railway/Render/VPS
- [ ] Health check funcionando (`/health`)
- [ ] Endpoint de verificación funcionando (`/verify`)
- [ ] Variable `SACS_BACKEND_URL` configurada en Supabase
- [ ] Edge Function desplegada
- [ ] Prueba end-to-end desde el frontend
- [ ] Monitoreo configurado
- [ ] Logs accesibles

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del servicio
2. Verifica que el SACS esté disponible: https://sistemas.sacs.gob.ve
3. Prueba el endpoint directamente con curl
4. Revisa la configuración de variables de entorno

## 🔄 Actualizar el Servicio

```bash
# Railway: Push a GitHub, auto-deploy
git push origin main

# Render: Push a GitHub, auto-deploy
git push origin main

# VPS:
ssh user@servidor
cd red-salud/sacs-verification-service
git pull
pm2 restart sacs-service
```

---

**Nota**: El servicio SACS de Venezuela puede estar caído o lento ocasionalmente. Esto es normal y está fuera de nuestro control.
