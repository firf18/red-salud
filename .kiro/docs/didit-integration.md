# Integración Didit - Verificación de Identidad

## Resumen

Se ha implementado la integración con Didit para verificación de identidad con IA, reemplazando el sistema anterior de verificación manual de cédulas.

---

## Credenciales

### API
- **App ID:** `5b0ca147-bbee-4c3b-aa96-53e32fd10d22`
- **API Key:** `KHVEmC8VlOdXqZNTBf1hvvfvLs_0VRlPhwEKtNitVHs`

### Webhook
- **Secret Key:** `NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck`
- **URL del Webhook:** `https://tu-dominio.com/api/didit/webhook`

**⚠️ IMPORTANTE:** Debes configurar esta URL en el panel de Didit:
1. Ve a https://business.didit.me/
2. Navega a: Verifications → Settings → API & Webhooks
3. Agrega la URL: `https://red-salud.vercel.app/api/didit/webhook`
4. El Secret Key ya está configurado en el código

---

## Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```env
# Didit API
DIDIT_API_KEY=KHVEmC8VlOdXqZNTBf1hvvfvLs_0VRlPhwEKtNitVHs
DIDIT_APP_ID=5b0ca147-bbee-4c3b-aa96-53e32fd10d22
DIDIT_WEBHOOK_SECRET=NplZn8ap277JVQUxE6K3Ta9JlruolpnNfGzaBuAB0Ck

# Supabase Service Role (para el webhook)
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# URL de la aplicación
NEXT_PUBLIC_APP_URL=https://red-salud.vercel.app
```

---

## Archivos Creados

### 1. API Endpoints

#### `/app/api/didit/create-session/route.ts`
- **Método:** POST
- **Descripción:** Crea una sesión de verificación en Didit
- **Autenticación:** Requiere usuario autenticado
- **Respuesta:**
  ```json
  {
    "success": true,
    "session_id": "uuid",
    "session_url": "https://verify.didit.me/session/uuid"
  }
  ```

#### `/app/api/didit/webhook/route.ts`
- **Método:** POST
- **Descripción:** Recibe notificaciones de Didit sobre cambios de estado
- **Seguridad:** Valida firma HMAC SHA-256
- **Eventos:**
  - `status.updated`: Cambio de estado de verificación
  - `data.updated`: Actualización manual de datos

### 2. Componentes

#### `/components/dashboard/profile/tabs/documents-tab-didit.tsx`
- **Descripción:** Tab de documentos rediseñado con Didit
- **Características:**
  - Sin carga inicial (problema resuelto)
  - Botón para iniciar verificación
  - Abre ventana de Didit en nueva pestaña
  - Muestra estado de verificación en tiempo real
  - Diseño moderno con gradientes

---

## Flujo de Verificación

### 1. Usuario Inicia Verificación
```
Usuario → Click "Iniciar Verificación"
       → POST /api/didit/create-session
       → Didit API crea sesión
       → Se abre ventana con session_url
```

### 2. Usuario Completa Verificación
```
Usuario → Captura documento
       → Toma selfie
       → Didit procesa con IA
       → Valida autenticidad
```

### 3. Webhook Actualiza Estado
```
Didit → POST /api/didit/webhook
     → Valida firma HMAC
     → Actualiza perfil en Supabase
     → Registra actividad
```

### 4. Usuario Ve Resultado
```
Usuario → Regresa a la app
       → Ve estado actualizado
       → Acceso completo si aprobado
```

---

## Datos Extraídos por Didit

Cuando la verificación es aprobada, Didit extrae y guarda:

- ✅ Número de documento (cédula)
- ✅ Nombre completo
- ✅ Fecha de nacimiento
- ✅ Género/Sexo biológico
- ✅ Dirección
- ✅ Nacionalidad
- ✅ Foto del documento
- ✅ Foto del rostro
- ✅ Validación de autenticidad

---

## Estados de Verificación

| Estado | Descripción | Acción |
|--------|-------------|--------|
| `Not Started` | Sesión creada, usuario no ha comenzado | Esperar |
| `In Progress` | Usuario completando verificación | Esperar |
| `In Review` | Revisión manual requerida | Esperar |
| `Approved` | ✅ Verificación exitosa | Actualizar perfil |
| `Declined` | ❌ Verificación rechazada | Notificar usuario |
| `Abandoned` | Usuario abandonó el proceso | Permitir reintentar |

---

## Seguridad del Webhook

El webhook implementa múltiples capas de seguridad:

### 1. Validación de Firma HMAC
```typescript
const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET_KEY);
const expectedSignature = hmac.update(rawBody).digest("hex");
```

### 2. Validación de Timestamp
- Solo acepta requests dentro de 5 minutos
- Previene ataques de replay

### 3. Comparación Segura
```typescript
crypto.timingSafeEqual(expectedBuffer, providedBuffer)
```

### 4. Cloudflare Whitelist
Si usas Cloudflare, whitelist la IP de Didit:
- **IP:** `18.203.201.92`
- **Ubicación:** Security → WAF → Tools → IP Access Rules

---

## Testing

### 1. Probar Creación de Sesión
```bash
curl -X POST https://tu-dominio.com/api/didit/create-session \
  -H "Cookie: tu-cookie-de-sesion"
```

### 2. Probar Webhook (Local)
```bash
# Instalar ngrok
ngrok http 3000

# Configurar URL en Didit
https://tu-ngrok-url.ngrok.io/api/didit/webhook

# Completar una verificación de prueba
```

### 3. Verificar Logs
```typescript
// Los logs aparecen en:
console.log("Webhook recibido:", { session_id, status, vendor_data });
console.log("Perfil actualizado exitosamente para usuario:", userId);
```

---

## Troubleshooting

### Problema: Webhook no recibe eventos
**Solución:**
1. Verifica que la URL esté configurada en Didit
2. Asegúrate que la URL sea accesible públicamente
3. Revisa que el Secret Key sea correcto
4. Verifica logs del servidor

### Problema: Firma inválida
**Solución:**
1. Verifica que `DIDIT_WEBHOOK_SECRET` sea correcto
2. Asegúrate de usar el raw body (no parseado)
3. Verifica que no haya middleware modificando el body

### Problema: Usuario no ve estado actualizado
**Solución:**
1. Verifica que el webhook se ejecutó correctamente
2. Revisa que `vendor_data` contenga el user ID correcto
3. Verifica permisos de Supabase Service Role Key
4. Usuario debe refrescar la página o reabrir el modal

---

## Mejoras Futuras

### Corto Plazo
- [ ] Notificación en tiempo real cuando se complete la verificación
- [ ] Mostrar progreso de la verificación en la UI
- [ ] Permitir reintentar verificación fallida

### Mediano Plazo
- [ ] Integrar NFC para pasaportes electrónicos
- [ ] Agregar verificación de dirección (POA)
- [ ] Implementar AML screening

### Largo Plazo
- [ ] Autenticación biométrica para login
- [ ] Verificación de edad para servicios restringidos
- [ ] Reusable KYC entre plataformas

---

## Costos

Según Didit:
- **Core KYC:** GRATIS
- **Verificaciones adicionales:** Prepago por créditos
- **Solo pagas por verificaciones exitosas**
- **Hasta 70% más barato que competidores**

---

## Soporte

### Documentación
- **Docs:** https://docs.didit.me/reference/introduction
- **API Reference:** https://docs.didit.me/reference/create-session-verification-sessions
- **Webhooks:** https://docs.didit.me/reference/webhooks

### Contacto Didit
- **WhatsApp:** +34 681 310 687 (recomendado)
- **Email:** hello@didit.me
- **Console:** https://business.didit.me/

---

## Estado Actual

✅ **Implementación Completa**

- API endpoints creados
- Webhook configurado y seguro
- Tab de documentos rediseñado
- Sin problema de carga inicial
- Listo para producción

**Siguiente paso:** Configurar la URL del webhook en el panel de Didit
