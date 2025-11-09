# Análisis de Rutas 404 - Red-Salud

## Problema Identificado

Existe una **inconsistencia crítica** entre las rutas definidas en las constantes y las rutas reales de Next.js App Router.

## Causa Raíz

### 1. Grupos de Rutas en Next.js
En Next.js App Router, los directorios entre paréntesis `(nombre)` son **grupos de rutas** que:
- **NO** añaden segmentos a la URL
- Solo sirven para organizar el código y compartir layouts
- Ejemplo: `app/(public)/servicios/page.tsx` → URL: `/servicios` (NO `/public/servicios`)

### 2. Constantes Incorrectas
En `lib/constants.ts`, las rutas están definidas con el prefijo `/public`:

```typescript
export const ROUTES = {
  HOME: "/public",              // ❌ INCORRECTO
  SERVICIOS: "/public/servicios", // ❌ INCORRECTO
  PRECIOS: "/public/precios",     // ❌ INCORRECTO
  // ...
}
```

### 3. Rutas Hardcodeadas
En `components/layout/header.tsx`, hay rutas hardcodeadas que tampoco existen:

```typescript
const servicios = [
  { name: "Pacientes", href: "/public/servicios/pacientes" }, // ❌ NO EXISTE
  { name: "Médicos", href: "/public/servicios/medicos" },     // ❌ NO EXISTE
  // ...
]
```

## Estructura Real de Rutas

### Rutas Públicas (Grupo `(public)`)
```
app/(public)/page.tsx                    → /
app/(public)/servicios/page.tsx          → /servicios
app/(public)/servicios/pacientes/        → /servicios/pacientes (SI EXISTE)
app/(public)/servicios/medicos/          → /servicios/medicos (SI EXISTE)
app/(public)/precios/page.tsx            → /precios
app/(public)/nosotros/page.tsx           → /nosotros
app/(public)/blog/page.tsx               → /blog
app/(public)/soporte/page.tsx            → /soporte
app/(public)/soporte/contacto/page.tsx   → /soporte/contacto
app/(public)/soporte/faq/page.tsx        → /soporte/faq
app/(public)/terminos/page.tsx           → /terminos
app/(public)/privacidad/page.tsx         → /privacidad
```

### Rutas de Autenticación (Grupo `(auth)`)
```
app/(auth)/login/page.tsx                → /login
app/(auth)/login/[role]/page.tsx         → /login/[role]
app/(auth)/register/page.tsx             → /register
app/(auth)/register/paciente/            → /register/paciente
app/(auth)/register/medico/              → /register/medico
app/(auth)/forgot-password/page.tsx      → /forgot-password
app/(auth)/reset-password/page.tsx       → /reset-password
app/(auth)/callback/route.ts             → /callback
```

### Rutas de Dashboard
```
app/dashboard/paciente/page.tsx          → /dashboard/paciente
app/dashboard/medico/page.tsx            → /dashboard/medico
app/dashboard/farmacia/page.tsx          → /dashboard/farmacia
app/dashboard/laboratorio/page.tsx       → /dashboard/laboratorio
app/dashboard/clinica/page.tsx           → /dashboard/clinica
app/dashboard/ambulancia/page.tsx        → /dashboard/ambulancia
app/dashboard/seguro/page.tsx            → /dashboard/seguro
```

## Conflicto con `app/page.tsx`

Existe un **conflicto de rutas**:
- `app/page.tsx` → `/`
- `app/(public)/page.tsx` → `/`

Ambos archivos intentan manejar la ruta raíz `/`, lo que puede causar comportamiento impredecible.

## Soluciones Requeridas

### 1. Corregir `lib/constants.ts`

```typescript
export const ROUTES = {
  HOME: "/",                    // ✅ CORRECTO
  SERVICIOS: "/servicios",      // ✅ CORRECTO
  PRECIOS: "/precios",          // ✅ CORRECTO
  NOSOTROS: "/nosotros",        // ✅ CORRECTO
  SOPORTE: "/soporte",          // ✅ CORRECTO
  CONTACTO: "/soporte/contacto", // ✅ CORRECTO
  BLOG: "/blog",                // ✅ CORRECTO
  FAQ: "/soporte/faq",          // ✅ CORRECTO
  TERMINOS: "/terminos",        // ✅ CORRECTO
  PRIVACIDAD: "/privacidad",    // ✅ CORRECTO
} as const;

export const AUTH_ROUTES = {
  LOGIN: "/login",              // ✅ CORRECTO
  REGISTER: "/register",        // ✅ CORRECTO
  FORGOT_PASSWORD: "/forgot-password", // ✅ CORRECTO
  RESET_PASSWORD: "/reset-password",   // ✅ CORRECTO
} as const;
```

### 2. Corregir `components/layout/header.tsx`

```typescript
const servicios = [
  { name: "Pacientes", href: "/servicios/pacientes" },      // ✅ CORRECTO
  { name: "Médicos", href: "/servicios/medicos" },          // ✅ CORRECTO
  { name: "Clínicas", href: "/servicios/clinicas" },        // ✅ CORRECTO
  { name: "Laboratorios", href: "/servicios/laboratorios" }, // ✅ CORRECTO
  { name: "Farmacias", href: "/servicios/farmacias" },      // ✅ CORRECTO
  { name: "Ambulancias", href: "/servicios/ambulancias" },  // ✅ CORRECTO
  { name: "Seguros", href: "/servicios/seguros" },          // ✅ CORRECTO
];
```

### 3. Resolver Conflicto de Página Raíz

**Opción A: Eliminar `app/page.tsx`** (Recomendado)
- Mantener solo `app/(public)/page.tsx`
- Es más limpio y consistente con la estructura de grupos

**Opción B: Eliminar `app/(public)/page.tsx`**
- Mantener solo `app/page.tsx`
- Requiere mover el Header y Footer al layout raíz

## Páginas que Necesitan Verificación

Verificar que estas páginas existan y funcionen:

### Servicios Específicos
- [ ] `/servicios/pacientes`
- [ ] `/servicios/medicos`
- [ ] `/servicios/clinicas`
- [ ] `/servicios/laboratorios`
- [ ] `/servicios/farmacias`
- [ ] `/servicios/ambulancias`
- [ ] `/servicios/seguros`

### Registro por Rol
- [ ] `/register/paciente`
- [ ] `/register/medico`
- [ ] `/register/farmacia`
- [ ] `/register/laboratorio`
- [ ] `/register/clinica`
- [ ] `/register/ambulancia`
- [ ] `/register/seguro`

## Impacto

### Componentes Afectados
- `components/layout/header.tsx` - Navegación principal
- `components/layout/footer.tsx` - Enlaces del footer
- `components/sections/hero-section.tsx` - CTAs
- `app/(public)/servicios/page.tsx` - Enlaces a servicios
- `app/(public)/precios/page.tsx` - Enlaces de contacto
- `app/(auth)/register/page.tsx` - Enlaces de registro
- Todos los componentes que importen `ROUTES` o `AUTH_ROUTES`

### Severidad
🔴 **CRÍTICA** - Los usuarios no pueden navegar correctamente por el sitio

## Próximos Pasos

1. ✅ Corregir `lib/constants.ts`
2. ✅ Corregir `components/layout/header.tsx`
3. ✅ Resolver conflicto de página raíz
4. ✅ Verificar todos los componentes que usan las constantes
5. ✅ Probar navegación completa del sitio
6. ✅ Actualizar documentación

## Notas Adicionales

- Los grupos de rutas `(nombre)` son invisibles en las URLs
- Next.js 13+ usa App Router por defecto
- Las rutas dinámicas usan `[param]` en el nombre del directorio
- Los layouts se heredan automáticamente en la jerarquía
