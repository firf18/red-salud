# ✅ Configuración Final del Sistema SACS

## 🎉 Estado Actual

### ✅ Completado

1. **Railway CLI** - Instalado y autenticado
2. **Proyecto Railway** - Creado: `sacs-verification-service`
3. **Servicio Desplegado** - ✅ ACTIVO
4. **URL del Servicio**: `https://sacs-verification-service-production.up.railway.app`
5. **Health Check**: ✅ Funcionando
6. **GitHub MCP** - Configurado

---

## 🔧 Configuración Pendiente en Supabase

### Paso 1: Configurar Variable de Entorno

Necesitas agregar la URL del servicio Railway a Supabase Edge Functions:

#### Opción A: Via Dashboard de Supabase (Recomendado)

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/hwckkfiirldgundbcjsp)
2. Click en **Settings** (⚙️) en el menú lateral
3. Click en **Edge Functions**
4. En la sección **Secrets**, click en **Add Secret**
5. Agrega:
   - **Name**: `SACS_BACKEND_URL`
   - **Value**: `https://sacs-verification-service-production.up.railway.app`
6. Click en **Save**

#### Opción B: Via Supabase CLI

```bash
# Primero, asegúrate de estar autenticado
supabase login

# Luego, configura el secret
supabase secrets set SACS_BACKEND_URL=https://sacs-verification-service-production.up.railway.app --project-ref hwckkfiirldgundbcjsp
```

---

## 🧪 Probar el Sistema Completo

### 1. Verificar que el Backend Funciona

```bash
# Health check
curl https://sacs-verification-service-production.up.railway.app/health

# Debería retornar:
# {"status":"ok","service":"SACS Verification Service","version":"2.0.0","timestamp":"..."}
```

### 2. Probar con una Cédula Real

```bash
curl -X POST https://sacs-verification-service-production.up.railway.app/verify \
  -H "Content-Type: application/json" \
  -d '{"cedula": "12345678", "tipo_documento": "V"}'
```

### 3. Probar desde el Dashboard

1. Ve a: `http://localhost:3000/dashboard/medico/perfil/setup`
2. Ingresa una cédula de médico venezolano
3. El sistema debería:
   - Consultar el SACS real
   - Mostrar los datos del médico
   - Permitir completar el perfil

---

## 📊 Monitoreo

### Railway Logs

```bash
# Ver logs en tiempo real
cd sacs-verification-service
railway logs

# O desde cualquier lugar
railway logs --project sacs-verification-service
```

### Supabase Edge Function Logs

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/hwckkfiirldgundbcjsp)
2. Click en **Edge Functions**
3. Click en `verify-doctor-sacs`
4. Click en **Logs**

---

## 🔐 Información del Deployment

### Railway
- **Proyecto**: sacs-verification-service
- **URL**: https://sacs-verification-service-production.up.railway.app
- **Estado**: ✅ ACTIVO
- **Puerto**: 3001
- **Región**: us-east4

### Supabase
- **Proyecto**: red-salud
- **ID**: hwckkfiirldgundbcjsp
- **Edge Function**: verify-doctor-sacs (v3)
- **Estado**: ✅ ACTIVA

---

## 📝 Checklist Final

- [x] Railway CLI instalado
- [x] Proyecto Railway creado
- [x] Servicio desplegado en Railway
- [x] Dominio público generado
- [x] Health check funcionando
- [x] GitHub MCP configurado
- [ ] Variable `SACS_BACKEND_URL` configurada en Supabase
- [ ] Prueba con cédula real desde el dashboard
- [ ] Verificar guardado en base de datos

---

## 🚀 Próximos Pasos

1. **Configurar la variable en Supabase** (ver arriba)
2. **Probar el flujo completo** desde el dashboard
3. **Verificar logs** en Railway y Supabase
4. **Subir cambios a GitHub** (ahora que tienes el MCP configurado)

---

## 💡 Comandos Útiles

### Railway

```bash
# Ver logs
railway logs

# Ver variables de entorno
railway variables

# Redeploy
railway up

# Ver status
railway status
```

### Supabase

```bash
# Ver Edge Functions
supabase functions list

# Ver logs de Edge Function
supabase functions logs verify-doctor-sacs

# Desplegar Edge Function
supabase functions deploy verify-doctor-sacs
```

---

## 🎉 ¡Todo Listo!

Una vez configures la variable `SACS_BACKEND_URL` en Supabase, el sistema estará 100% funcional y listo para verificar médicos venezolanos con el SACS real.

**URL del Servicio**: `https://sacs-verification-service-production.up.railway.app`

**Costo Mensual Estimado**: ~$5 USD (Railway Hobby Plan)
