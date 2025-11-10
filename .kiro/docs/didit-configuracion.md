# Configuración de Didit para Red-Salud

## 📋 Resumen

Didit es la plataforma de verificación de identidad AI-native que usamos para verificar la identidad de los pacientes mediante documentos de identidad y detección de vida (liveness).

## 🔑 Obtener Credenciales

### 1. Crear Cuenta en Didit

1. Ve a [business.didit.me](https://business.didit.me/)
2. Regístrate con tu email empresarial
3. Usa el magic login link que te enviarán
4. Crea tu workspace de organización

### 2. Obtener API Key

1. En el Console de Didit, ve a **Verifications** en el menú lateral
2. Haz clic en el ícono de **Settings (⚙️)** en la esquina superior derecha
3. Copia tu **API Key** (trátala como una contraseña)

### 3. Crear y Obtener Workflow ID

1. Ve a **Verifications → Workflows → Create New**
2. Elige una plantilla:
   - **KYC** - Onboarding estándar (recomendado para Red-Salud)
   - **Adaptive Age Verification** - Verificación rápida con selfie
   - **Biometric Authentication** - Login sin contraseña
3. Personaliza con bloques como:
   - Liveness Detection (detección de vida)
   - Face Match (comparación facial)
   - AML (screening de listas)
   - NFC (lectura de chip del documento)
4. Guarda el workflow
5. Copia el **Workflow ID** desde la lista de workflows

### 4. Configurar Webhook

1. Ve a **Verifications → Settings → API & Webhooks**
2. Agrega tu **Webhook URL**: `https://tu-dominio.com/api/didit/webhook`
3. Didit enviará actualizaciones de estado a esta URL

## ⚙️ Configurar Variables de Entorno

Edita el archivo `.env.local` y agrega:

```env
# Didit Configuration
DIDIT_API_KEY=tu_api_key_aqui
DIDIT_WORKFLOW_ID=tu_workflow_id_aqui
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

## 🔄 Flujo de Verificación

### 1. Usuario Inicia Verificación

El usuario hace clic en "Iniciar Verificación" en el dashboard de paciente.

### 2. Backend Crea Sesión

```typescript
POST https://verification.didit.me/v2/session/
Headers:
  x-api-key: YOUR_API_KEY
  content-type: application/json
Body:
  {
    "workflow_id": "WORKFLOW_ID",
    "vendor_data": "USER_ID",
    "callback": "https://tu-app.com/dashboard/paciente",
    "expected_details": {
      "first_name": "Juan",
      "last_name": "Pérez"
    },
    "contact_details": {
      "email": "usuario@email.com",
      "email_lang": "es"
    }
  }
```

### 3. Usuario Completa Verificación

- Se abre una nueva ventana con la interfaz de Didit
- El usuario captura su documento de identidad
- Realiza la verificación de vida (selfie)
- Didit procesa y valida automáticamente

### 4. Webhook Recibe Resultado

Didit envía actualizaciones a `/api/didit/webhook`:

```json
{
  "event_type": "status.updated",
  "session_id": "abc123",
  "status": "approved",
  "vendor_data": "USER_ID",
  "kyc_data": {
    "document_number": "V12345678",
    "first_name": "Juan",
    "last_name": "Pérez",
    "date_of_birth": "1990-01-01"
  }
}
```

### 5. Actualizar Perfil

El webhook actualiza automáticamente el perfil del usuario en Supabase:
- `cedula_verificada` = true
- `photo_verified` = true
- `cedula` = número de documento
- `cedula_photo_verified_at` = timestamp

## 📊 Estados de Verificación

- **not_started** - Sesión creada pero no iniciada
- **in_progress** - Usuario completando verificación
- **in_review** - Revisión manual requerida
- **approved** - Verificación exitosa ✅
- **rejected** - Verificación rechazada ❌

## 🔒 Seguridad

- **NUNCA** expongas el API Key en el frontend
- Todas las llamadas a Didit deben hacerse desde el backend
- El API Key debe estar en variables de entorno
- Usa HTTPS para todos los webhooks

## 🧪 Modo Sandbox

Didit proporciona acceso instantáneo a sandbox para pruebas:
- Usa documentos de prueba
- No se cobran verificaciones
- Mismo flujo que producción

## 📚 Recursos

- [Documentación Oficial](https://docs.didit.me/reference/introduction)
- [Quick Start Guide](https://docs.didit.me/reference/quick-start)
- [API Authentication](https://docs.didit.me/reference/api-authentication)
- [Webhooks](https://docs.didit.me/reference/webhooks)
- [Console de Didit](https://business.didit.me/)

## 💬 Soporte

- **WhatsApp**: [+34 681 310 687](https://api.whatsapp.com/send/?phone=%2B34681310687)
- **Email**: hello@didit.me
