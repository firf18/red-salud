# 📱 Plan de Implementación: Perfil de Paciente Android

## 🎯 Objetivo
Replicar la funcionalidad completa del perfil de paciente del dashboard web en la aplicación Android, incluyendo:
- Visualización de datos personales
- Edición de información básica
- Gestión de información médica
- Contacto de emergencia
- Validación de cédula
- Actualización de avatar

## 📊 Estado Actual

### ✅ Ya Implementado en Android
- Estructura MVVM completa
- Repositorios base
- Navegación con Jetpack Compose
- Integración con Supabase
- Autenticación (Login/Registro)
- Dashboard básico

### 🔨 Por Implementar
- Pantalla de perfil completa
- Formularios de edición
- Validación de cédula con API
- Gestión de avatar
- Sincronización con backend

## 📁 Archivos a Crear/Modificar

### 1. Modelos de Datos

**Archivo**: `data/models/ProfileModels.kt`
```kotlin
data class PatientProfile(
    // Datos básicos
    val id: String,
    val email: