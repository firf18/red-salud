# Auth Components

Componentes y utilidades para autenticación de usuarios en Red-Salud.

## 📁 Estructura

```
components/auth/
├── login-form.tsx              # Formulario de inicio de sesión
├── register-form.tsx           # Formulario de registro
├── google-signin-button.tsx   # Botón reutilizable de Google OAuth
├── remember-me-checkbox.tsx   # Checkbox "Mantener sesión"
├── index.ts                    # Exportaciones públicas
├── README.md                   # Este archivo
└── REFACTOR_LOG.md            # Historial de refactorización

hooks/auth/
├── use-oauth-signin.ts        # Hook para OAuth (Google)
├── use-rate-limit.ts          # Hook para rate limiting
├── use-oauth-errors.ts        # Hook para errores de OAuth
└── index.ts                   # Exportaciones públicas

lib/auth/
├── role-validator.ts          # Validación y labels de roles
└── index.ts                   # Exportaciones públicas
```

## 🎯 Componentes

### LoginForm

Formulario completo de inicio de sesión con:
- Validación con Zod
- OAuth con Google
- Rate limiting
- Validación de roles
- Remember me
- Manejo de errores

**Props:**
```typescript
interface LoginFormProps {
  role: string;        // Rol esperado (paciente, medico, etc.)
  roleLabel: string;   // Label en español del rol
}
```

**Uso:**
```tsx
<LoginForm role="medico" roleLabel="Médico" />
```

### RegisterForm

Formulario completo de registro con:
- Validación con Zod
- OAuth con Google
- Campos de nombre y apellido
- Confirmación de contraseña
- Términos y condiciones

**Props:**
```typescript
interface RegisterFormProps {
  role: UserRole;      // Rol para el nuevo usuario
  roleLabel: string;   // Label en español del rol
}
```

**Uso:**
```tsx
<RegisterForm role="paciente" roleLabel="Paciente" />
```

### GoogleSignInButton

Botón reutilizable para OAuth con Google.

**Props:**
```typescript
interface GoogleSignInButtonProps {
  onClick: () => void;
  disabled?: boolean;
  mode?: "login" | "register";
  size?: "default" | "sm" | "lg";
}
```

**Uso:**
```tsx
<GoogleSignInButton
  onClick={handleGoogleSignIn}
  disabled={isLoading}
  mode="login"
/>
```

### RememberMeCheckbox

Checkbox con tooltip explicativo para mantener sesión iniciada.

**Props:**
```typescript
interface RememberMeCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  role?: string;
}
```

## 🪝 Hooks

### useOAuthSignIn

Hook para manejar autenticación con OAuth (Google).

**Uso:**
```typescript
const { signInWithGoogle, isLoading } = useOAuthSignIn({
  role: "medico",
  mode: "login",
  onError: setError,
});
```

**Retorna:**
- `signInWithGoogle`: Función para iniciar OAuth
- `isLoading`: Estado de carga

### useRateLimit

Hook para prevenir ataques de fuerza bruta.

**Uso:**
```typescript
const { checkRateLimit, recordFailedAttempt, resetAttempts } = useRateLimit();
```

### useOAuthErrors

Hook para manejar errores de OAuth desde URL params.

**Uso:**
```typescript
useOAuthErrors(setError);
```

## 🛠️ Utilidades

### validateUserRole

Valida que el rol del usuario coincida con el esperado.

**Uso:**
```typescript
import { validateUserRole } from "@/lib/auth";

const validation = validateUserRole(userRole, expectedRole);
if (!validation.isValid) {
  console.error(validation.errorMessage);
}
```

### getRoleLabel

Obtiene el label en español de un rol.

**Uso:**
```typescript
import { getRoleLabel } from "@/lib/auth";

const label = getRoleLabel("medico"); // "Médico"
```

## 🎨 Principios de Diseño

1. **SRP (Single Responsibility Principle):** Cada componente/hook tiene una única responsabilidad
2. **DRY (Don't Repeat Yourself):** Código compartido extraído a componentes/hooks reutilizables
3. **Composición:** Componentes pequeños que se componen para formar interfaces complejas
4. **Tipado fuerte:** TypeScript en todos los archivos con interfaces claras
5. **Accesibilidad:** Labels, ARIA attributes, y navegación por teclado

## 📝 Convenciones

- Archivos de componentes en PascalCase: `LoginForm.tsx`
- Archivos de hooks en kebab-case: `use-oauth-signin.ts`
- Archivos de utilidades en kebab-case: `role-validator.ts`
- Exports nombrados (no default exports)
- Documentación JSDoc en funciones públicas

## 🧪 Testing

Para testear estos componentes:

```bash
# Tests unitarios (cuando se implementen)
npm run test components/auth

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔐 Seguridad

- Rate limiting en login (máx 5 intentos en 15 min)
- Validación de roles en cliente y servidor
- Session management con opciones de seguridad
- OAuth con PKCE flow
- Sanitización de inputs

## 📚 Referencias

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
