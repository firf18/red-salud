# 🚀 Despliegue Paso a Paso - Sistema de Verificación SACS

## 📋 Índice
1. [Pre-requisitos](#pre-requisitos)
2. [Despliegue de Base de Datos](#1-despliegue-de-base-de-datos)
3. [Despliegue de Edge Function](#2-despliegue-de-edge-function)
4. [Despliegue de Servicio Backend](#3-despliegue-de-servicio-backend)
5. [Pruebas](#4-pruebas)
6. [Troubleshooting](#5-troubleshooting)

---

## Pre-requisitos

✅ Cuenta de Supabase activa  
✅ Proyecto de Supabase creado  
✅ Supabase CLI instalado (`npm install -g supabase`)  
✅ Node.js 18+ instalado  
✅ Git configurado  

---

## 1️⃣ Despliegue de Base de Datos

### Opción A: Usando Supabase CLI (Recomendado)

```bash
# 1. Conectar al proyecto
supabase link --project-ref TU_PROJECT_REF

# 2. Verificar conexión
supabase status

# 3. Aplicar migración
supabase db push

# 4. Verificar que se aplicó
supabase db diff
```

### Opción B: Usando SQL Editor

1. Abrir Supabase Dashboard
2. Ir a **SQL Editor**
3. Abrir el archivo `supabase/migrations/010_create_doctor_verifications_cache.sql`
4. Copiar todo el contenido
5. Pegar en SQL Editor
6. Click en **Run**

### ✅ Verificar Instalación

Ejecutar en SQL Editor:

```sql
-- Debe retornar la tabla
SELECT * FROM doctor_verifications_cache LIMIT 1;

-- Debe retornar las columnas
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'doctor_verifications_cache';
```

---

## 2️⃣ Despliegue de Edge Function

### Paso 1: Preparar Edge Function

```bash
# Verificar que el archivo existe
ls supabase/functions/verify-doctor-sacs/index.ts
```

### Paso 2: Desplegar

```bash
# Desplegar la función
supabase functions deploy verify-doctor-sacs

# Verificar que se desplegó
supabase functions list
```

Deberías ver:

```
┌─────────────────────────┬─────────┬────────────────────┐
│ NAME                    │ STATUS  │ UPDATED AT         │
├─────────────────────────┼─────────┼────────────────────┤
│ verify-doctor-sacs      │ ACTIVE  │ 2024-XX-XX XX:XX   │
└─────────────────────────┴─────────┴────────────────────┘
```

### Paso 3: Configurar Variables de Entorno (Opcional)

Si vas a usar el servicio backend:

1. Ir a **Supabase Dashboard** > **Edge Functions**
2. Click en `verify-doctor-sacs`
3. Ir a **Settings**
4. Agregar variable:
   - Key: `SACS_BACKEND_URL`
   - Value: `https://tu-servicio-backend.com` (o `http://localhost:3001` para pruebas)

### ✅ Verificar Instalación

Probar desde el dashboard:

1. Ir a **Edge Functions** > `verify-doctor-sacs`
2. Click en **Invoke Function**
3. Body:
```json
{
  "cedula": "12345678",
  "tipo_documento": "V"
}
```
4. Click en **Invoke**

---

## 3️⃣ Despliegue de Servicio Backend

### Opción A: Despliegue Local (Para Desarrollo)

```bash
# 1. Ir al directorio
cd sacs-verification-service

# 2. Instalar dependencias
npm install

# 3. Iniciar servicio
npm start
```

El servicio estará en `http://localhost:3001`

### Opción B: Despliegue en Railway (Recomendado para Producción)

#### 1. Crear cuenta en Railway.app

- Ir a https://railway.app
- Registrarse con GitHub

#### 2. Crear nuevo proyecto

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
cd sacs-verification-service
railway init

# Desplegar
railway up
```

#### 3. Configurar variables de entorno

En Railway Dashboard:
- `NODE_ENV=production`
- `PORT=3001`

#### 4. Obtener URL del servicio

Railway te dará una URL como: `https://tu-app.railway.app`

#### 5. Actualizar Edge Function

Ir a Supabase Dashboard y actualizar `SACS_BACKEND_URL` con la URL de Railway.

### Opción C: Despliegue en Render

#### 1. Crear cuenta en Render.com

- Ir a https://render.com
- Registrarse

#### 2. Crear Web Service

1. Click en **New +** > **Web Service**
2. Conectar repositorio de GitHub
3. Configurar:
   - **Name**: `sacs-verification-service`
   - **Root Directory**: `sacs-verification-service`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

#### 3. Variables de entorno

- `NODE_ENV=production`

#### 4. Deploy

Click en **Create Web Service**

### ✅ Verificar Instalación

```bash
# Health check
curl https://tu-servicio.com/health

# Debe retornar:
# {"status":"ok","message":"SACS Verification Service is running"}

# Probar verificación
curl -X POST https://tu-servicio.com/verify \
  -H "Content-Type: application/json" \
  -d '{"cedula":"12345678","tipo_documento":"V"}'
```

---

## 4️⃣ Pruebas

### Prueba 1: Base de Datos

```sql
-- Insertar registro de prueba
INSERT INTO doctor_verifications_cache (
  cedula, tipo_documento, nombre_completo,
  profesion_principal, matricula_principal,
  especialidad_display, es_medico_humano,
  es_veterinario, tiene_postgrados,
  profesiones, postgrados, verified,
  verified_at, source
) VALUES (
  '99999999', 'V', 'TEST USUARIO',
  'MEDICO CIRUJANO', '999999',
  'Medicina General', true,
  false, false,
  '[]'::jsonb, '[]'::jsonb, true,
  NOW(), 'test'
);

-- Verificar
SELECT * FROM doctor_verifications_cache WHERE cedula = '99999999';

-- Limpiar
DELETE FROM doctor_verifications_cache WHERE cedula = '99999999';
```

### Prueba 2: Servicio Backend

```bash
cd sacs-verification-service
node test-quick.js
```

### Prueba 3: Edge Function

```bash
# Ver logs en tiempo real
supabase functions logs verify-doctor-sacs --tail
```

En otra terminal:

```bash
# Invocar función
curl -X POST https://TU_PROJECT_REF.supabase.co/functions/v1/verify-doctor-sacs \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"cedula":"12345678","tipo_documento":"V"}'
```

### Prueba 4: Frontend

1. Crear usuario con rol "medico"
2. Ir a `/dashboard/medico/perfil/setup`
3. Completar formulario:
   - Tipo: V
   - Cédula: (una cédula real de prueba)
4. Click en "Verificar con SACS"
5. Verificar que:
   - ✅ Muestra datos del SACS
   - ✅ Nombre NO es editable
   - ✅ Permite seleccionar especialidad
   - ✅ Crea perfil correctamente

---

## 5️⃣ Troubleshooting

### Error: "Cannot connect to database"

**Solución:**
```bash
# Verificar conexión
supabase status

# Reconectar
supabase link --project-ref TU_PROJECT_REF
```

### Error: "Edge Function not found"

**Solución:**
```bash
# Listar funciones
supabase functions list

# Re-desplegar
supabase functions deploy verify-doctor-sacs
```

### Error: "Backend service not available"

**Solución:**
1. Verificar que el servicio esté corriendo
2. Verificar URL en variable de entorno
3. Verificar logs del servicio

### Error: "SACS website not responding"

**Solución:**
- El sitio del SACS puede estar caído temporalmente
- Intentar más tarde
- Verificar en navegador: https://sistemas.sacs.gob.ve/consultas/prfsnal_salud

### Error: "Puppeteer failed to launch"

**Solución:**

En Railway/Render, agregar buildpack:
```bash
# Railway
railway run apt-get install -y chromium

# Render
# Agregar en render.yaml:
buildCommand: apt-get update && apt-get install -y chromium && npm install
```

### Logs no aparecen

**Solución:**
```bash
# Edge Function logs
supabase functions logs verify-doctor-sacs --tail

# Backend logs (Railway)
railway logs

# Backend logs (Render)
# Ver en dashboard de Render
```

---

## 📊 Checklist Final

### Base de Datos
- [ ] Migración aplicada
- [ ] Tabla `doctor_verifications_cache` existe
- [ ] Columnas correctas
- [ ] Índices creados
- [ ] RLS configurado

### Edge Function
- [ ] Función desplegada
- [ ] Aparece en `supabase functions list`
- [ ] Variables de entorno configuradas
- [ ] Logs funcionan

### Servicio Backend
- [ ] Dependencias instaladas
- [ ] Servicio inicia correctamente
- [ ] Health check responde
- [ ] Endpoint `/verify` funciona
- [ ] Puppeteer funciona

### Frontend
- [ ] Formulario carga
- [ ] Validaciones funcionan
- [ ] Verificación funciona
- [ ] Datos se muestran correctamente
- [ ] Perfil se crea
- [ ] Redirección funciona

---

## 🎉 ¡Listo!

Si todos los checks están ✅, tu sistema de verificación SACS está completamente funcional.

### Próximos Pasos

1. **Monitoreo**: Configurar alertas para errores
2. **Rate Limiting**: Limitar consultas por usuario
3. **Cache**: Optimizar tiempos de respuesta
4. **Logs**: Implementar logging estructurado
5. **Tests**: Agregar tests automatizados

---

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs de cada componente
2. Verificar variables de entorno
3. Consultar documentación de Supabase
4. Revisar issues en GitHub
