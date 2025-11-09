# Guía Visual del Modal de Perfil

## Estructura del Modal

```
┌─────────────────────────────────────────────────────────┐
│  Header (80px) - Gradiente personalizable               │
│  [Selector Color] [X]                                   │
└─────────────────────────────────────────────────────────┘
   ┌──────┐
   │      │  Freddy Ramírez                    ← Avatar flotante (96px)
   │  F   │  firf.1818@gmail.com              ← Nombre (text-2xl)
   └──────┘                                    ← Email (text-sm)
─────────────────────────────────────────────────────────
[Mi Perfil] [Info. Médica] [Documentos] ...  ← Tabs (text-sm)
─────────────────────────────────────────────────────────
│                                                         │
│  Información Personal                    [Editar]      │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐            │
│  │ Nombre Completo │  │ Dirección       │            │
│  │                 │  │                 │            │
│  │ Email           │  │ Ciudad          │            │
│  │                 │  │                 │            │
│  │ Teléfono        │  │ Estado          │            │
│  │                 │  │                 │            │
│  │ Cédula          │  │ Código Postal   │            │
│  │                 │  │                 │            │
│  │ Fecha Nac.      │  │ [Nota]          │            │
│  └─────────────────┘  └─────────────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Dimensiones Clave

### Header
- Altura: 80px (h-20)
- Gradiente: Personalizable con 6 colores
- Botones: 32px (p-2) con iconos de 16px (h-4 w-4)

### Avatar y Nombre
- Avatar: 96px × 96px (h-24 w-24)
- Borde: 4px blanco
- Sombra: shadow-xl
- Posición: -48px desde el header (flotante)
- Nombre: text-2xl font-bold
- Email: text-sm text-gray-600
- Gap entre avatar y texto: 20px (gap-5)

### Navegación
- Altura de tabs: auto con pb-3
- Padding horizontal: 12px (px-3)
- Gap entre tabs: 16px (gap-4)
- Tamaño de fuente: text-sm
- Iconos: 16px × 16px (h-4 w-4)
- Indicador activo: 2px de altura (h-0.5)

### Contenido
- Padding del contenedor: 32px (p-8)
- Gap entre columnas: 24px (gap-6)
- Espaciado entre campos: 16px (space-y-4)
- Altura de inputs: 36px (h-9)
- Altura de textarea: 70px (min-h-[70px])

## Colores del Tema

### Azul (Predeterminado)
```
Gradiente: from-blue-600 to-teal-600
Avatar: bg-blue-100 text-blue-600
Tabs activo: text-blue-600
```

### Púrpura
```
Gradiente: from-purple-600 to-pink-600
Avatar: bg-purple-100 text-purple-600
Tabs activo: text-purple-600
```

### Verde
```
Gradiente: from-green-600 to-emerald-600
Avatar: bg-green-100 text-green-600
Tabs activo: text-green-600
```

### Naranja
```
Gradiente: from-orange-600 to-red-600
Avatar: bg-orange-100 text-orange-600
Tabs activo: text-orange-600
```

### Índigo
```
Gradiente: from-indigo-600 to-blue-600
Avatar: bg-indigo-100 text-indigo-600
Tabs activo: text-indigo-600
```

### Rosa
```
Gradiente: from-pink-600 to-rose-600
Avatar: bg-pink-100 text-pink-600
Tabs activo: text-pink-600
```

## Espaciado Vertical Total

```
Header:                    80px
Avatar (sobresale):       -48px (overlap)
Sección de nombre:         60px
Navegación de tabs:        48px
Padding superior:          32px
Contenido del formulario: ~500px (variable)
Padding inferior:          32px
─────────────────────────────
Total aproximado:         ~704px
```

## Responsive

- Modal: 95vh de altura máxima
- Ancho máximo: 7xl (1280px)
- Contenido scrolleable si excede la altura
- Tabs con scroll horizontal en móviles

## Accesibilidad

- Labels ARIA en todos los botones
- Roles semánticos (nav, main, header)
- Indicadores de estado (aria-current)
- Contraste de colores WCAG AA
- Navegación por teclado
