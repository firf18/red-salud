# Sistema de Seguridad de Sesiones - Red-Salud

## 📋 Resumen

Implementación de un sistema de seguridad multi-capa para gestión de sesiones de usuario con las siguientes características:

## 🔐 Características de Seguridad

### 1. **Sesiones Temporales vs Persistentes**

#### Sesión Temporal (Recomendada para dispositivos compartidos)
- ✅ Se cierra automáticamente al cerrar el navegador
- ✅ Usa `sessionStorage` en lugar de `localStorage`
- ✅ Ideal para computadoras públicas o compartidas
- ⏱️ Duración: Hasta cerrar navegador

#### Sesión Persistente (Opción "Recordarme")
- ✅ Permanece activa entre sesiones del navegador
- ✅ Timeout automático por inactividad
- ⚠️ Solo recomendada para dispositivos personales
- ⏱️ Duración: Según rol del usuario

### 2. **Timeouts por Rol**

Cada rol tiene un tiempo de inactividad diferente según el nivel de sensibilidad:

| Rol | Timeout | Justificación |
|-----|---------|---------------|
| **Paciente** | 30 minutos | Datos médicos sensibles |
| **Médico** | 1 hora | Necesita tiempo para consultas |
| **Ambulancia** | 30 minutos | Emergencias requieren seguridad |
| **Farmacia** | 1 hora | Gestión de recetas |
| **Laboratorio** | 1 hora | Procesamiento de resultados |
| **Clínica** | 1 hora | Administración general |
| **Seguro** | 1 hora | Gestión de pólizas |

### 3. **Detección de Actividad**

El sistema monitorea la actividad del usuario:
- 🖱️ Movimientos del mouse
- ⌨️ Pulsaciones de teclado
- 📜 Scroll
- 👆 Toques en pantalla táctil
- 🖱️ Clicks

### 4. **Advertencia de Expiración**

- ⏰ Alerta 5 minutos antes de que expire la sesión
- 🔄 Opción para extender la sesión
- 🚪 Opción para cerrar sesión manualmente
- ⏱️ Contador regresivo visible

### 5. **Device Fingerprinting**

Genera una huella digital del dispositivo basada en:
- User Agent del navegador
- Idioma del sistema
- Resolución de pantalla
- Zona horaria

Si el dispositivo cambia, la sesión se invalida automáticamente.

### 6. **Registro de Actividad**

Todas las acciones de sesión se registran:
- ✅ Inicio de sesión
- 🔄 Extensión de sesión
- ⏰ Cierre por timeout
- 🚪 Cierre manual
- 🔄 Cambio de dispositivo

## 🚀 Implementación

### Paso 1: Configurar en Login

```typescript
// En el componente de login
import { sessionManager } from "@/lib/security/session-manager";

// Después de login exitoso
await sessionManager.setupSession({
  rememberMe: rememberMeChecked,
  role: userRole,
  deviceFingerprint: await getDeviceFingerprint(),
});
```

### Paso 2: Agregar Componente de Advertencia

```typescript
// En el layout del dashboard
import { SessionTimeoutWarning } from "@/components/dashboard/session-timeout-warning";

export default function DashboardLayout({ children }) {
  return (
    <div>
      {children}
      <SessionTimeoutWarning />
    </div>
  );
}
```

### Paso 3: Validar Sesión (Opcional)

```typescript
// En páginas sensibles
const { valid, reason } = await sessionManager.validateSession();

if (!valid) {
  console.log(`Sesión inválida: ${reason}`);
  // Redirigir al login
}
```

## 🎯 Mejores Prácticas

### Para Usuarios

1. **Dispositivos Personales**
   - ✅ Puedes usar "Recordarme"
   - ✅ Más conveniente para uso diario
   - ⚠️ Asegúrate de que tu dispositivo esté protegido

2. **Dispositivos Compartidos/Públicos**
   - ❌ NO uses "Recordarme"
   - ✅ Cierra sesión manualmente al terminar
   - ✅ La sesión se cerrará al cerrar el navegador

3. **Seguridad General**
   - 🔒 Usa contraseñas fuertes
   - 🔄 Cambia tu contraseña regularmente
   - 👀 Revisa el registro de actividad periódicamente

### Para Desarrolladores

1. **Ajustar Timeouts**
   ```typescript
   // En lib/security/session-manager.ts
   const SESSION_TIMEOUTS = {
     paciente: 30 * 60 * 1000, // Modificar aquí
   };
   ```

2. **Personalizar Advertencias**
   ```typescript
   // Cambiar tiempo de advertencia (actualmente 5 minutos)
   if (remaining < 5 * 60 * 1000) {
     setShowWarning(true);
   }
   ```

3. **Agregar Eventos Personalizados**
   ```typescript
   // En setupActivityListeners()
   const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
   // Agregar más eventos si es necesario
   ```

## 🔮 Futuras Mejoras

### Autenticación de Dos Factores (2FA)
- [ ] SMS/Email con código
- [ ] Aplicación autenticadora (Google Authenticator, Authy)
- [ ] Biometría (huella digital, Face ID)

### Gestión Avanzada de Sesiones
- [ ] Ver todas las sesiones activas
- [ ] Cerrar sesiones remotamente
- [ ] Notificaciones de nuevos inicios de sesión
- [ ] Geolocalización de sesiones

### Análisis de Seguridad
- [ ] Detección de patrones sospechosos
- [ ] Alertas de intentos de acceso fallidos
- [ ] Dashboard de seguridad para administradores

## 📊 Métricas de Seguridad

El sistema registra automáticamente:
- Número de sesiones activas
- Promedio de duración de sesión
- Intentos de acceso fallidos
- Sesiones cerradas por timeout
- Cambios de dispositivo detectados

## 🆘 Soporte

Si tienes preguntas sobre la seguridad:
1. Revisa este documento
2. Consulta los logs de actividad en tu perfil
3. Contacta al equipo de soporte

## 📝 Changelog

### v1.0.0 (2024)
- ✅ Sistema de sesiones temporales/persistentes
- ✅ Timeouts por rol
- ✅ Advertencias de expiración
- ✅ Device fingerprinting
- ✅ Registro de actividad
