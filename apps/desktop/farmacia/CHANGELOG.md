# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2026-02-01

### Agregado
- ✨ Estructura inicial del proyecto con Tauri 2.0
- ✨ Sistema de autenticación con login
- ✨ Dashboard principal con métricas
- ✨ Punto de Venta (POS) básico
- ✨ Gestión de inventario
- ✨ Navegación lateral con menú
- ✨ Estado global con Zustand
- ✨ Diseño responsive con TailwindCSS
- ✨ Integración con paquetes compartidos (@red-salud/types, @red-salud/core)
- 📝 Documentación completa (README, DEVELOPMENT, FEATURES)
- 🔧 Configuración de Vite y TypeScript
- 🔧 Configuración de Tauri con plugins

### Estructura Creada
- `/src` - Código fuente React
  - `/layouts` - Layouts de la aplicación
  - `/pages` - Páginas principales
  - `/store` - Estado global
  - `/lib` - Utilidades
- `/src-tauri` - Backend Rust
  - `/src` - Código Rust
  - `Cargo.toml` - Dependencias
  - `tauri.conf.json` - Configuración

### Páginas Implementadas
- LoginPage - Autenticación de usuarios
- DashboardPage - Vista principal con métricas
- POSPage - Punto de venta con carrito
- InventoryPage - Gestión de inventario
- RecetasPage - Placeholder para recetas
- VentasPage - Placeholder para ventas
- EntregasPage - Placeholder para entregas
- ReportesPage - Placeholder para reportes
- ProveedoresPage - Placeholder para proveedores
- AlertasPage - Placeholder para alertas
- ConfigPage - Placeholder para configuración

### Stores Implementados
- authStore - Gestión de autenticación
- cartStore - Gestión del carrito de compras

### Plugins de Tauri Configurados
- tauri-plugin-sql - Base de datos SQLite
- tauri-plugin-store - Almacenamiento persistente
- tauri-plugin-fs - Sistema de archivos
- tauri-plugin-dialog - Diálogos nativos
- tauri-plugin-notification - Notificaciones
- tauri-plugin-shell - Ejecución de comandos
- tauri-plugin-os - Información del sistema
- tauri-plugin-process - Gestión de procesos

## [Unreleased]

### Por Agregar
- Conexión con Supabase
- Base de datos SQLite local
- Sistema de ventas completo
- Reportes y estadísticas
- Recetas digitales
- Entregas a domicilio
- Gestión de proveedores
- Sistema de alertas
- Multi-moneda (USD/VES)
- Modo offline
- Impresión de facturas
- SENIAT compliance

### Por Mejorar
- Optimización de rendimiento
- Testing unitario y de integración
- Manejo de errores
- Validación de formularios
- Feedback visual
- Accesibilidad

### Por Documentar
- Guía de usuario
- API documentation
- Arquitectura del sistema
- Guía de deployment
