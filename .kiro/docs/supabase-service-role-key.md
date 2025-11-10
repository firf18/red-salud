# Obtener Supabase Service Role Key

El **Service Role Key** es necesario para que el webhook de Didit pueda actualizar la base de datos directamente desde el servidor.

## 🔑 Cómo Obtener la Clave

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: **hwckkfiirldgundbcjsp**
3. Ve a **Settings** (⚙️) en el menú lateral
4. Haz clic en **API**
5. En la sección **Project API keys**, encontrarás:
   - `anon` / `public` - Ya la tienes configurada
   - **`service_role`** - Esta es la que necesitas

## ⚠️ IMPORTANTE

- **NUNCA** expongas esta clave en el frontend
- **NUNCA** la subas a GitHub sin estar en `.env.local`
- Solo úsala en el servidor (API routes, webhooks)
- Esta clave tiene acceso completo a tu base de datos

## 📝 Configuración

Agrega la clave a tu archivo `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

## ✅ Verificar

Una vez configurada, el webhook de Didit podrá actualizar automáticamente el perfil del usuario cuando complete la verificación.
