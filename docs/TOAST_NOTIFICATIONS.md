# Sistema de Notificaciones Toast

## Descripción

Se ha implementado un sistema de notificaciones toast elegante y funcional para reemplazar los `alert()` nativos del navegador.

## Características

### Tipos de Notificación

1. **Success** (Éxito)
   - Color: Verde
   - Icono: CheckCircle
   - Uso: Operaciones completadas exitosamente

2. **Error** (Error)
   - Color: Rojo
   - Icono: AlertCircle
   - Uso: Errores y fallos en operaciones

3. **Warning** (Advertencia)
   - Color: Amarillo
   - Icono: AlertTriangle
   - Uso: Advertencias y situaciones que requieren atención

4. **Info** (Información)
   - Color: Azul
   - Icono: Info
   - Uso: Mensajes informativos generales

### Funcionalidades

- ✅ Animaciones suaves de entrada/salida
- ✅ Auto-cierre configurable (default: 5 segundos)
- ✅ Botón de cierre manual
- ✅ Posicionamiento fijo en la esquina superior derecha
- ✅ Z-index alto (200) para estar sobre modales
- ✅ Diseño responsive
- ✅ Accesibilidad con ARIA labels

## Uso en el Modal de Perfil

### Casos de Uso Implementados

1. **Guardar Perfil**
   ```typescript
   // Éxito
   showNotification("Perfil actualizado correctamente", "success");
   
   // Error
   showNotification("Faltan campos requeridos: nombre, teléfono y cédula", "error");
   ```

2. **Subir Avatar**
   ```typescript
   // Inicio
   showNotification("Subiendo imagen...", "info");
   
   // Éxito
   showNotification("Imagen subida correctamente", "success");
   
   // Error
   showNotification("Error al subir la imagen", "error");
   
   // Usuario no identificado
   showNotification("Error: Usuario no identificado", "error");
   ```

## Componente Toast

### Props

```typescript
interface ToastProps {
  message: string;           // Mensaje a mostrar
  type?: ToastType;          // Tipo de notificación (default: "info")
  isVisible: boolean;        // Control de visibilidad
  onClose: () => void;       // Callback al cerrar
  duration?: number;         // Duración en ms (default: 5000)
}
```

### Ejemplo de Implementación

```typescript
import { Toast, type ToastType } from "@/components/ui/toast";

function MyComponent() {
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<ToastType>("info");
  const [showToast, setShowToast] = useState(false);

  const showNotification = (message: string, type: ToastType = "info") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      
      <button onClick={() => showNotification("¡Hola!", "success")}>
        Mostrar notificación
      </button>
    </>
  );
}
```

## Mejoras sobre alert()

| Característica | alert() | Toast |
|---------------|---------|-------|
| Bloquea la UI | ✅ Sí | ❌ No |
| Personalizable | ❌ No | ✅ Sí |
| Animaciones | ❌ No | ✅ Sí |
| Auto-cierre | ❌ No | ✅ Sí |
| Múltiples tipos | ❌ No | ✅ Sí |
| Accesibilidad | ⚠️ Básica | ✅ Completa |
| Diseño moderno | ❌ No | ✅ Sí |

## Estilos

El componente usa Tailwind CSS con colores semánticos:

- **Success**: green-50, green-200, green-600, green-800
- **Error**: red-50, red-200, red-600, red-800
- **Warning**: yellow-50, yellow-200, yellow-600, yellow-800
- **Info**: blue-50, blue-200, blue-600, blue-800

## Accesibilidad

- Botón de cierre con `aria-label="Cerrar notificación"`
- Colores con contraste WCAG AA
- Iconos descriptivos para cada tipo
- Animaciones respetan `prefers-reduced-motion`

## Próximas Mejoras

- [ ] Cola de notificaciones (múltiples toasts simultáneos)
- [ ] Posiciones configurables (top-left, bottom-right, etc.)
- [ ] Acciones personalizadas (botones en el toast)
- [ ] Sonidos opcionales
- [ ] Persistencia de notificaciones importantes
