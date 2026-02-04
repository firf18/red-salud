# 💊 App Tauri Farmacia - Sistema de Gestión Farmacéutica

> Sistema completo de gestión para farmacias desarrollado con Tauri, React, TypeScript y Supabase

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=white)](https://tauri.app/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

## 🎯 Estado del Proyecto

**Versión**: 1.0.0-MVP  
**Estado**: ✅ **Producción Ready** (Funcionalidades Core)  
**Progreso**: 70% del plan original completado  

---

## ✨ Características Principales

### 🛒 Punto de Venta (POS)
- ✅ Búsqueda de productos en tiempo real
- ✅ Carrito de compras con validaciones
- ✅ 5 métodos de pago (Efectivo, Tarjeta, Pago Móvil, Zelle, Transferencia)
- ✅ Cálculo automático de IVA
- ✅ Multi-moneda (USD/VES)
- ✅ Generación de facturas
- ✅ Actualización automática de stock (FEFO)

### 📦 Gestión de Inventario
- ✅ CRUD completo de productos
- ✅ Gestión de lotes con control de caducidades
- ✅ 5 zonas de almacenamiento
- ✅ Búsqueda y filtros avanzados
- ✅ Estados visuales de stock
- ✅ Indicadores de vencimiento

### 🔔 Sistema de Alertas
- ✅ Detección automática de problemas
- ✅ 4 tipos de alertas (Stock bajo, Sin stock, Próximo a vencer, Vencido)
- ✅ 4 niveles de prioridad (Crítica, Alta, Media, Baja)
- ✅ Dashboard de alertas
- ✅ Auto-refresh cada 5 minutos

### 📊 Reportes y Análisis
- ✅ Ventas por período
- ✅ Top 10 productos más vendidos
- ✅ Valorización de inventario
- ✅ Desglose por métodos de pago
- ✅ Exportación a CSV
- ✅ Gráficos visuales

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- pnpm 8+
- Rust 1.70+
- Cuenta de Supabase

### Instalación

1. **Instalar dependencias**
```bash
pnpm install
```

2. **Configurar variables de entorno**

Crear archivo `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. **Configurar base de datos**

Ejecutar en Supabase SQL Editor:
- `../../supabase/migrations/20250201000000_pharmacy_core_tables.sql`
- `TEST_DATA.sql` (datos de prueba)

4. **Iniciar en modo desarrollo**
```bash
pnpm tauri:dev
```

---

## 📖 Documentación

### Guías Principales
- 📘 [Progreso Final](./PROGRESO_FINAL.md) - Estado completo del proyecto
- 🚀 [Guía de Despliegue](./GUIA_DESPLIEGUE.md) - Instrucciones de despliegue
- 📋 [Plan de Implementación](./PLAN_IMPLEMENTACION.md) - Plan detallado

### Progreso por Día
- [Día 1: Configuración y Auth](./PROGRESO_DIA_1.md)
- [Día 2: Dashboard y Productos](./PROGRESO_DIA_2.md)
- [Día 3: POS Funcional](./PROGRESO_DIA_3.md)
- [Día 4: Inventario CRUD](./PROGRESO_DIA_4.md)
- [Día 5: Lotes y Alertas](./PROGRESO_DIA_5.md)
- [Día 6-7: Reportes](./PROGRESO_DIA_6_7.md)

---

## 🎯 Funcionalidades Implementadas

| Módulo | Estado | Completado |
|--------|--------|------------|
| Autenticación | ✅ | 100% |
| Dashboard | ✅ | 100% |
| POS | ✅ | 100% |
| Inventario | ✅ | 100% |
| Lotes | ✅ | 100% |
| Alertas | ✅ | 100% |
| Reportes | ✅ | 100% |
| Recetas | 🟡 | 80% (UI completa) |

---

## 📦 Build para Producción

```bash
pnpm tauri:build
```

---

## 🛠️ Tecnologías

- **React 18** + **TypeScript**
- **Tailwind CSS**
- **React Query** - Data Fetching & Cache
- **Zustand** - State Management
- **Supabase** - Backend as a Service
- **Tauri** - Desktop Framework

---

**¡La app está lista para producción! 🚀**
