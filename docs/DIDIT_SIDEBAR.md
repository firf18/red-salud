# Sidebar Estilo Didit - Implementación

## Descripción

Se implementó un sidebar colapsible estilo Didit para el dashboard de Red-Salud, con diseño moderno y animaciones suaves.

## Características Principales

### Desktop Sidebar (`DiditSidebar`)

- ✅ **Colapsible**: Se puede contraer a solo iconos o expandir con texto
- ✅ **Botón Toggle**: Botón flotante en el rail del sidebar para expandir/contraer
- ✅ **Grupos de Menú**: Navegación organizada por categorías (Principal, Servicios, Otros)
- ✅ **Estados Activos**: Resaltado visual del item activo con fondo y borde
- ✅ **Animaciones Suaves**: Transiciones fluidas con Framer Motion
- ✅ **User Info**: Avatar y nombre del usuario en el header
- ✅ **Footer**: Botón de cerrar sesión y copyright
- ✅ **Responsive**: Se oculta automáticamente en móvil

### Mobile Sidebar (`DiditMobileSidebar`)

- ✅ **Slide-in**: Aparece desde la izquierda con animación
- ✅ **Overlay**: Fondo oscuro semi-transparente
- ✅ **Full Navigation**: Todos los items del menú visibles
- ✅ **Close Button**: Botón X para cerrar
- ✅ **Auto-close**: Se cierra al seleccionar un item

### Mobile Header

- ✅ **Hamburger Menu**: Botón para abrir el sidebar móvil
- ✅ **Logo**: Branding de Red-Salud
- ✅ **Notificaciones**: Icono de campana

## Estructura de Archivos

```
components/dashboard/layout/
├── dashboard-layout-client.tsx    # Layout principal integrado
├── didit-sidebar.tsx              # Sidebar desktop
└── didit-mobile-sidebar.tsx       # Sidebar móvil
```

## Configuración de Menú

El menú se configura mediante grupos en `dashboard-layout-client.tsx`:

```typescript
const menuGroups = [
  {
    label: "Principal",
    items: [
      { key: "dashboard", label: "Vista General", icon: "LayoutDashboard", route: "/dashboard/paciente" },
      { key: "perfil", label: "Mi Perfil", icon: "User", route: "/dashboard/paciente/perfil" },
      { key: "citas", label: "Citas Médicas", icon: "Calendar", route: "/dashboard/paciente/citas" },
    ],
  },
  {
    label: "Servicios",
    items: [
      { key: "historial", label: "Historial Clínico", icon: "FileText", route: "/dashboard/paciente/historial" },
      // ... más items
    ],
  },
  {
    label: "Otros",
    items: [
      { key: "configuracion", label: "Configuración", icon: "Settings", route: "/dashboard/paciente/configuracion" },
    ],
  },
];
```

## Estilos y Diseño

### Colores

- **Activo**: `bg-gray-50 text-blue-600 ring-1 ring-gray-100`
- **Hover**: `hover:bg-gray-50`
- **Logout**: `text-red-600 hover:bg-red-50`

### Dimensiones

- **Expandido**: 224px (14rem)
- **Colapsado**: 64px (4rem)
- **Móvil**: 288px (18rem)

### Animaciones

- **Duración**: 200ms (linear)
- **Tipo**: Framer Motion con `ease-linear`

## Iconos Disponibles

Los iconos se mapean desde `lucide-react`:

- `LayoutDashboard` - Vista general
- `User` - Perfil
- `Calendar` - Citas
- `FileText` - Historial
- `Pill` - Medicamentos
- `Activity` - Métricas
- `MessageSquare` - Mensajes
- `FlaskConical` - Laboratorio
- `Video` - Telemedicina
- `Star` - Calificaciones
- `Settings` - Configuración

## Uso

El sidebar se integra automáticamente en el `DashboardLayoutClient`:

```tsx
<DiditSidebar
  userName={userName}
  userEmail={userEmail}
  menuGroups={menuGroups}
  onProfileClick={() => setProfileModalOpen(true)}
  onLogout={handleLogout}
/>
```

## Responsive Breakpoints

- **Desktop**: `md:` (768px+) - Sidebar visible
- **Mobile**: `<768px` - Header con hamburger menu

## Funcionalidades

### Desktop

1. Click en avatar → Abre modal de perfil
2. Click en toggle → Colapsa/expande sidebar
3. Click en item → Navega a la ruta
4. Click en logout → Cierra sesión

### Mobile

1. Click en hamburger → Abre sidebar
2. Click en overlay → Cierra sidebar
3. Click en item → Navega y cierra sidebar
4. Click en X → Cierra sidebar

## Próximas Mejoras

- [ ] Tooltips en modo colapsado
- [ ] Badges de notificaciones en items
- [ ] Búsqueda rápida de módulos
- [ ] Favoritos/Accesos rápidos
- [ ] Temas claro/oscuro
- [ ] Personalización de orden de items

## Notas Técnicas

- Usa `data-*` attributes para estados CSS
- Compatible con Next.js 15 App Router
- Optimizado para SSR
- Accesible con navegación por teclado
- Animaciones con GPU acceleration
