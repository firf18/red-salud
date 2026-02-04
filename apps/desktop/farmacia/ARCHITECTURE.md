# Arquitectura - Red-Salud Farmacia Desktop

## Visión General

Red-Salud Farmacia Desktop es una aplicación híbrida construida con:
- **Frontend**: React 19 + TypeScript + TailwindCSS
- **Desktop Runtime**: Tauri 2.0 (Rust)
- **Estado**: Zustand con persistencia
- **Base de Datos Local**: SQLite (via Tauri SQL Plugin)
- **Backend Cloud**: Supabase (opcional, para sincronización)

## Arquitectura de Capas

```
┌─────────────────────────────────────────────────────────┐
│                    Presentación (UI)