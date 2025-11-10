# Setup Rápido - Didit Integration

## ✅ Lo que se ha implementado

1. **API Endpoints**
   - `/api/didit/create-session` - Crea sesiones de verificación
   - `/api/didit/webhook` - Recibe notificaciones de Didit

2. **Componente UI**
   - Tab de documentos rediseñado sin carga inicial
   - Botón para iniciar verificación
   - Estados visuales claros

3. **Seguridad**
   - Validación HMAC SHA-256 en webhook
   - Validación de timestamp
   - Comparación segura de firmas

---

## 🔧 Configuración Requerida

### 1. Variables de Entorno

Agrega a `.env.local`:

```env
DIDIT_API_KEY=KHVEmC8VlOdXqZNTBf1hvvfvLs_0VRlPhwEKtNitVHs
DIDIT_APP_ID=5b0ca147-bbee-4c3b-aa96-53e32fd10d22
DIDIT_WEBHOOK_SECRET=NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_APP_URL=https://red-salud.vercel.app
```

### 2. Configurar Webhook en Didit

**URL del Webhook:**
```
https://red-salud.vercel.app/api/didit/webhook
```

**Pasos:**
1. Ve a https://business.didit.me/
2. Login con tu cuenta
3. Navega a: **Verifications → Settings → API & Webhooks**
4. Agrega la URL del webhook
5. El Secret Key ya está en el código

### 3. Whitelist IP (Si usas Cloudflare)

- **IP de Didit:** `18.203.201.92`
- **Ubicación:** Security → WAF → Tools → IP Access Rules
- **Acción:** Allow

---

## 🚀 Cómo Funciona

### Flujo del Usuario

1. Usuario abre el tab "Documentos"
2. Click en "Iniciar Verificación de Identidad"
3. Se abre ventana de Didit en nueva pestaña
4. Usuario captura documento y selfie
5. Didit procesa con IA (2-3 minutos)
6. Webhook actualiza el perfil automáticamente
7. Usuario ve estado actualizado

### Datos que Didit Extrae

- Número de documento
- Nombre completo
- Fecha de nacimiento
- Género
- Dirección
- Nacionalidad
- Fotos del documento y rostro

---

## 🧪 Testing

### Probar Localmente

1. Instala ngrok:
   ```bash
   ngrok http 3000
   ```

2. Configura la URL de ngrok en Didit:
   ```
   https://tu-url.ngrok.io/api/didit/webhook
   ```

3. Inicia la app y prueba la verificación

### Verificar Logs

Los logs aparecen en la consola del servidor:
- "Webhook recibido: ..."
- "Perfil actualizado exitosamente..."

---

## ⚠️ Problemas Resueltos

### 1. Carga Inicial en Tab Documentos
**Antes:** useEffect cargaba datos al montar
**Ahora:** Usa datos del Redux store, sin carga adicional

### 2. Seguridad del Webhook
**Implementado:**
- Validación HMAC
- Validación de timestamp
- Comparación timing-safe

### 3. Actualización Automática
**Webhook actualiza:**
- Estado de verificación
- Datos del documento
- Registro de actividad

---

## 📊 Estados de Verificación

| Estado | UI | Descripción |
|--------|-----|-------------|
| No Verificado | 🔒 0% | Usuario no ha iniciado |
| En Proceso | ⏳ 50% | Verificación en curso |
| Verificado | ✅ 100% | Completado exitosamente |

---

## 💰 Costos

- **Core KYC:** GRATIS
- **Solo pagas verificaciones exitosas**
- **70% más barato que competidores**

---

## 📞 Soporte

- **WhatsApp:** +34 681 310 687
- **Email:** hello@didit.me
- **Docs:** https://docs.didit.me

---

## ✅ Checklist Final

- [x] API endpoints creados
- [x] Webhook implementado y seguro
- [x] Tab de documentos rediseñado
- [x] Sin carga inicial
- [ ] **Configurar URL webhook en Didit** ⚠️
- [ ] **Agregar variables de entorno** ⚠️
- [ ] Probar en producción

**Estado:** Listo para configurar y desplegar
