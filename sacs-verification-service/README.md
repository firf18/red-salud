# 🏥 SACS Verification Service

Servicio backend con Puppeteer para verificar médicos venezolanos en el sistema SACS.

## 🚀 Inicio Rápido

### Instalación Local

```bash
cd sacs-verification-service
npm install
cp .env.example .env
npm start
```

El servicio estará disponible en `http://localhost:3001`

### Desarrollo

```bash
npm run dev
```

## 📡 API Endpoints

### Health Check

```bash
GET /health
```

**Respuesta:**
```json
{
  "status": "ok",
  "service": "SACS Verification Service",
  "version": "2.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Verificar Médico

```bash
POST /verify
Content-Type: application/json

{
  "cedula": "30218596",
  "tipo_documento": "V"
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "verified": true,
  "data": {
    "cedula": "30218596",
    "tipo_documento": "V",
    "nombre_completo": "CARLOS RODRIGUEZ MARTINEZ",
    "profesion_principal": "MEDICO CIRUJANO",
    "matricula_principal": "MPPS-123456",
    "especialidad_display": "CARDIOLOGIA",
    "es_medico_humano": true,
    "es_veterinario": false,
    "tiene_postgrados": true,
    "profesiones": [...],
    "postgrados": [...]
  },
  "message": "Verificación exitosa. Profesional de salud humana registrado en el SACS."
}
```

**Respuesta Rechazada (Veterinario):**
```json
{
  "success": true,
  "verified": false,
  "data": {...},
  "message": "Esta cédula corresponde a un médico veterinario...",
  "razon_rechazo": "MEDICO_VETERINARIO"
}
```

**Respuesta No Encontrado:**
```json
{
  "success": false,
  "verified": false,
  "message": "Esta cédula no está registrada en el SACS...",
  "razon_rechazo": "NO_REGISTRADO_SACS"
}
```

## 🧪 Pruebas

### Probar Localmente

```bash
# Health check
curl http://localhost:3001/health

# Verificar médico
curl -X POST http://localhost:3001/verify \
  -H "Content-Type: application/json" \
  -d '{"cedula": "30218596", "tipo_documento": "V"}'
```

### Probar en Producción

```bash
curl -X POST https://tu-servicio.railway.app/verify \
  -H "Content-Type: application/json" \
  -d '{"cedula": "30218596", "tipo_documento": "V"}'
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env`:

```bash
PORT=3001
NODE_ENV=development
API_KEY=tu-api-key-secreta
PUPPETEER_TIMEOUT=30000
```

### Profesiones Válidas

El servicio valida que el profesional sea de salud humana:

- ✅ MÉDICO CIRUJANO
- ✅ ODONTÓLOGO
- ✅ BIOANALISTA
- ✅ ENFERMERO
- ✅ FARMACÉUTICO
- ✅ FISIOTERAPEUTA
- ✅ NUTRICIONISTA
- ✅ PSICÓLOGO
- ❌ MÉDICO VETERINARIO (rechazado)

## 📦 Despliegue

Ver [DEPLOY-SERVICIO-SACS-BACKEND.md](../docs/DEPLOY-SERVICIO-SACS-BACKEND.md) para instrucciones completas.

### Railway

```bash
# Conectar repositorio y desplegar automáticamente
# Railway detectará el package.json
```

### Render

```bash
# Crear Web Service
# Root Directory: sacs-verification-service
# Build Command: npm install
# Start Command: npm start
```

## 🐛 Troubleshooting

### Error: "Puppeteer failed to launch"

**Solución**: Instala las dependencias de Chromium

```bash
# Ubuntu/Debian
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
```

### Error: "Timeout"

**Solución**: Aumenta el timeout en `PUPPETEER_TIMEOUT`

### Error: "SACS no responde"

**Solución**: El SACS puede estar caído o lento. Intenta más tarde.

## 📊 Logs

El servicio registra:

- ✅ Verificaciones exitosas
- ❌ Errores de scraping
- ⏱️ Tiempos de respuesta
- 🔍 Cédulas consultadas

```
[SACS] Iniciando verificación: V-30218596
[SACS] Navegando a la página...
[SACS] Llenando formulario...
[SACS] Consultando...
[SACS] Tabla de datos básicos cargada
[SACS] Tabla de profesiones cargada
[SACS] Extrayendo datos...
[SACS] 2 postgrado(s) encontrado(s)
[SACS] Verificación completada: APROBADO
```

## 🔐 Seguridad

### Recomendaciones:

1. **No expongas el servicio públicamente** - Solo debe ser accesible por la Edge Function
2. **Usa API Key** - Agrega autenticación
3. **Rate Limiting** - Limita peticiones por IP
4. **HTTPS** - Siempre usa HTTPS en producción
5. **Logs** - No logues información sensible

## 📝 Estructura del Proyecto

```
sacs-verification-service/
├── index.js              # Servidor Express + Puppeteer
├── package.json          # Dependencias
├── .env.example          # Variables de entorno ejemplo
├── README.md             # Este archivo
└── test-local.js         # Script de prueba local
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit tus cambios (`git commit -am 'Agrega mejora'`)
4. Push a la rama (`git push origin feature/mejora`)
5. Abre un Pull Request

## 📄 Licencia

MIT

## 📞 Soporte

Para problemas o preguntas:
- Revisa los logs del servicio
- Verifica que el SACS esté disponible
- Consulta la documentación de despliegue
