# Red Salud - Aplicación Móvil para Pacientes

Aplicación Android nativa completa para pacientes que replicate la funcionalidad del dashboard web de Red Salud.

## 🚀 Características

- **Autenticación**: Login y registro de pacientes
- **Dashboard Principal**: Vista general de citas, medicamentos, resultados de laboratorio y métricas
- **Gestión de Citas**: Ver, agendar y cancelar citas médicas
- **Medicamentos**: Visualizar medicamentos activos con dosis e indicaciones
- **Laboratorio**: Acceder a resultados de exámenes de laboratorio
- **Métricas de Salud**: Registrar y visualizar métricas de salud personal
- **Historial Médico**: Acceso a registros médicos completos
- **Mensajería**: Comunicación con profesionales de salud
- **Telemedicina**: Sesiones de videoconsulta

## 📋 Requisitos Previos

- Android Studio (Arctic Fox o superior)
- JDK 11 o superior
- Android SDK 31 o superior

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd red-salud/Android-Apps/Android-App-Paciente
```

2. **Sincronizar dependencias**
- Abrir en Android Studio
- Gradle se sincronizará automáticamente
- Descargar todas las dependencias

3. **Configurar credenciales de Supabase**
- El archivo `SupabaseConfig.kt` contiene las credenciales de conexión
- Ya está configurado con el backend de Red Salud

## 🏗️ Estructura del Proyecto

```
app/src/main/java/com/example/red_salud_paciente/
├── data/
│   ├── models/          # Modelos de datos (User, Appointment, etc)
│   ├── network/         # Configuración de Supabase
│   └── repositories/    # Lógica de acceso a datos
├── presentation/
│   ├── screens/         # Pantallas UI (Compose)
│   ├── viewmodels/      # ViewModels para cada pantalla
│   └── navigation/      # Sistema de navegación
├── di/                  # Inyección de dependencias (Hilt)
└── ui/theme/            # Tema de la aplicación
```

## 🎯 Pantallas Principales

### 1. Autenticación
- **LoginScreen**: Inicio de sesión con email y contraseña
- **RegisterScreen**: Registro de nuevos pacientes con cédula

### 2. Dashboard
- Vista general con estadísticas
- Acceso rápido a funcionalidades principales
- Últimas citas, medicamentos y métricas

### 3. Citas
- Listar todas las citas
- Agendar nuevas citas
- Cancelar citas programadas
- Unirse a sesiones de videollamada

### 4. Medicamentos
- Ver medicamentos activos
- Visualizar dosis e indicaciones
- Historial de medicamentos

### 5. Laboratorio
- Resultados de exámenes
- Estado de resultados pendientes
- Valores de referencia

### 6. Métricas de Salud
- Registrar nuevas métricas (presión, peso, glucosa, etc)
- Visualizar historial de métricas
- Gráficos de tendencias

### 7. Historial Médico
- Acceso a registros de consultas
- Diagnósticos y tratamientos
- Documentos médicos

### 8. Mensajería
- Conversaciones con médicos
- Mensajes sin leer
- Historial de mensajes

### 9. Telemedicina
- Sesiones de videoconsulta programadas
- Acceso a enlaces de sesión
- Notas de sesiones

## 🔐 Autenticación

La app utiliza **Supabase Auth** para autenticación:

- **Registro**: Se crea usuario en Supabase Auth + Perfil en BD
- **Login**: Validación con email y contraseña
- **Sesión**: Se mantiene sesión activa en el dispositivo
- **Logout**: Cierre seguro de sesión

## 🗄️ Base de Datos

Se conecta directamente a **Supabase** (PostgreSQL) con las tablas:
- `profiles` - Datos de pacientes
- `appointments` - Citas médicas
- `medications` - Medicamentos recetados
- `lab_results` - Resultados de laboratorio
- `health_metrics` - Métricas registradas
- `medical_records` - Historial médico
- `messages` - Mensajería
- `telemed_sessions` - Sesiones de telemedicina

## 🛠️ Tecnologías Utilizadas

- **Kotlin** - Lenguaje de programación
- **Jetpack Compose** - UI Framework
- **Hilt** - Inyección de dependencias
- **Supabase SDK** - Backend y autenticación
- **Retrofit** - Cliente HTTP
- **Coroutines** - Programación asíncrona
- **Material 3** - Diseño Material Design 3

## 📦 Dependencias Principales

```kotlin
// Compose
androidx-compose-material3
androidx-navigation-compose

// Supabase
supabase-kotlin
supabase-postgrest

// Networking
retrofit
okhttp
moshi

// Dependency Injection
hilt-android

// Lifecycle
androidx-lifecycle-viewmodel-compose
```

## 🚀 Compilación y Ejecución

### Debug (Emulador o Dispositivo)
```bash
# En Android Studio: Run > Run 'app'
# O desde terminal:
./gradlew installDebug
```

### Release (APK para distribución)
```bash
./gradlew bundleRelease
```

## 🔄 Flujo de la Aplicación

1. **Splash/Auth Check** → Verificar si hay sesión activa
2. **Login/Register** → Si no hay sesión
3. **Dashboard** → Pantalla principal después de autenticarse
4. **Navegación** → Acceso a diferentes módulos
5. **Detalle** → Pantallas detalladas de cada sección
6. **Logout** → Volver a login

## 🎨 Tema de Diseño

- **Color Primario**: Verde (#2E7D32) - Salud y medicina
- **Color Secundario**: Azul (#1976D2) - Confianza
- **Color Terciario**: Rojo (#D32F2F) - Alertas
- **Material Design 3**: Esquema de colores moderno

## 📱 Permisos Requeridos

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## 🐛 Solución de Problemas

### Error de compilación
- Sincronizar Gradle: `File > Sync Now`
- Limpiar proyecto: `Build > Clean Project`
- Reconstruir: `Build > Rebuild Project`

### Error de conexión a Supabase
- Verificar credenciales en `SupabaseConfig.kt`
- Comprobar conexión a internet
- Verificar que el backend esté activo

### App se cierra al iniciar
- Revisar logcat para errores
- Comprobar permisos en AndroidManifest.xml
- Verificar versión de SDK

## 📝 Notas de Desarrollo

- La app está configurada para minSdk 31
- Soporta Android 12 (API 31) en adelante
- Usa Kotlin 2.0.21
- Compose BOM 2024.12.00

## 🤝 Contribuciones

Para contribuir:
1. Crear rama desde `develop`
2. Hacer cambios
3. Crear Pull Request
4. Esperar revisión

## 📄 Licencia

Este proyecto es parte de Red Salud

## 📞 Soporte

Para reportar bugs o solicitar features, contactar al equipo de desarrollo.

## 🔄 Sincronización con Web

La app comparte:
- Misma base de datos (Supabase)
- Mismos modelos de datos
- Misma lógica de negocio
- API REST compatible

Cualquier cambio en la web se refleja automáticamente en la app móvil.

