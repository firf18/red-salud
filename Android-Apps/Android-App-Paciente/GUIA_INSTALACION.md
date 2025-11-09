# Guía de Instalación - Red Salud App Android

## Paso 1: Requisitos Previos

Antes de comenzar, asegúrate de tener instalados:

- **Android Studio** (versión Arctic Fox o superior)
  - Descargar desde: https://developer.android.com/studio
  - Versión recomendada: Android Studio Hedgehog 2023.1.1 o superior

- **JDK 11 o superior**
  - Generalmente viene incluido con Android Studio
  - Verificar: Java > 11

- **Android SDK**
  - API Level 31 (Android 12) o superior recomendado
  - Se descarga automáticamente en Android Studio

## Paso 2: Clonar el Repositorio

```bash
# Opción 1: Con Git
git clone https://github.com/tu-usuario/red-salud.git
cd red-salud/Android-Apps/Android-App-Paciente

# Opción 2: Descargar ZIP
# - Descarga el ZIP del repositorio
# - Extrae en tu carpeta de proyectos
# - Abre la carpeta Android-App-Paciente
```

## Paso 3: Abrir en Android Studio

1. **Abrir Android Studio**
2. **Seleccionar**: File > Open...
3. **Navegar hasta**: `Red-Salud-Paciente` (la carpeta principal del proyecto)
4. **Hacer clic en**: Open

## Paso 4: Sincronizar Gradle

La sincronización ocurre automáticamente:

1. **Esperar a que Android Studio abra el proyecto**
2. **En la parte superior, verás**: "Gradle Sync"
3. **Dejar que se complete** (puede tomar 2-5 minutos la primera vez)
4. **Si hay error**: 
   - Build > Clean Project
   - Build > Rebuild Project

## Paso 5: Verificar SDK

1. Ir a: File > Project Structure
2. En "SDK Location":
   - Android SDK Location: Debe estar configurado
   - Si no aparece, hacer clic en "Edit" y seleccionar la carpeta SDK
3. En "Project": 
   - Compilar SDK: 36 (Android 16)
   - Min SDK: 31 (Android 12)

## Paso 6: Configurar Emulador (Opcional)

### Si quieres usar emulador en lugar de dispositivo físico:

1. **Abrir AVD Manager**: Tools > Device Manager
2. **Crear nuevo dispositivo virtual**:
   - Hacer clic en "Create device"
   - Seleccionar: Pixel 6 (o similar)
   - Siguiente
   - Seleccionar: Android 13 o 14
   - Completar configuración
3. **Ejecutar emulador**: Hacer clic en Play

## Paso 7: Ejecutar la Aplicación

### Opción 1: En Emulador
1. Conectar emulador (ver Paso 6)
2. En Android Studio: Run > Run 'app'
3. Seleccionar el emulador en la lista
4. Hacer clic en OK

### Opción 2: En Dispositivo Físico
1. **Conectar dispositivo Android** con USB
2. **Habilitar "Depuración USB"**:
   - Ir a Settings > About phone
   - Buscar "Build number"
   - Tocar 7 veces seguidas
   - Ir a Settings > Developer options
   - Activar "USB debugging"
3. **En Android Studio**: Run > Run 'app'
4. **Seleccionar tu dispositivo** en la lista
5. **Hacer clic en OK**

## Paso 8: Primer Inicio

La primera vez que ejecutes:

1. **Se compilará la aplicación** (esperar 2-3 minutos)
2. **Se instalará en el dispositivo** (1-2 minutos)
3. **Se abrirá la pantalla de Login**

## Paso 9: Probar Login

### Crear una cuenta:
1. Hacer clic en "¿No tienes cuenta? Regístrate aquí"
2. Llenar formulario:
   - Nombre Completo: Tu nombre
   - Cédula: Cualquier número (ej: 12345678)
   - Email: ejemplo@correo.com
   - Contraseña: 123456
   - Confirmar Contraseña: 123456
3. Hacer clic en "Registrarse"

### Iniciar sesión:
1. Email: ejemplo@correo.com
2. Contraseña: 123456
3. Hacer clic en "Iniciar Sesión"

## Paso 10: Solucionar Problemas

### La compilación falla
```bash
# Ejecutar desde terminal
cd Android-Apps/Android-App-Paciente
./gradlew clean build
```

### Error de dependencias
```bash
# Actualizar dependencias
./gradlew assemble --refresh-dependencies
```

### No encuentra Java
1. File > Project Structure
2. En "JDK location": Hacer clic en "Edit"
3. Seleccionar la ruta de Java (generalmente en Android Studio)

### El emulador no se inicia
1. Eliminar emulador: Tools > Device Manager > Click derecho > Delete
2. Crear uno nuevo (ver Paso 6)

### App se cierra al abrir
1. Revisar logcat: View > Tool Windows > Logcat
2. Ver los errores en rojo
3. Resolver según el error

## Estructura de Carpetas Importante

```
Android-App-Paciente/
├── app/
│   └── src/
│       └── main/
│           ├── java/com/example/red_salud_paciente/
│           │   ├── data/               # Base de datos/Modelos
│           │   ├── presentation/       # UI (Pantallas)
│           │   ├── di/                 # Inyección de dependencias
│           │   ├── utils/              # Utilidades
│           │   ├── constants/          # Constantes
│           │   └── MainActivity.kt
│           └── AndroidManifest.xml     # Configuración app
├── gradle/
├── build.gradle.kts                    # Dependencias
├── settings.gradle.kts                 # Configuración
└── README_APP.md                       # Documentación
```

## Verificar Instalación Correcta

La app debería:
1. ✅ Compilar sin errores
2. ✅ Instalar en emulador o dispositivo
3. ✅ Mostrar pantalla de Login
4. ✅ Permitir registro de nuevos usuarios
5. ✅ Permitir login
6. ✅ Mostrar Dashboard
7. ✅ Navegar entre secciones

## Próximos Pasos

Una vez instalada:

1. **Explorar la app**: Navegar por todas las secciones
2. **Revisar código**: Entender la estructura
3. **Hacer cambios**: Modificar según necesidad
4. **Compilar cambios**: Presionar Ctrl+F5 o Run 'app'

## Comandos Útiles desde Terminal

```bash
# Limpiar proyecto
./gradlew clean

# Compilar
./gradlew build

# Ejecutar en dispositivo
./gradlew installDebug

# Ejecutar tests
./gradlew test

# Ver dependencias
./gradlew dependencies

# Linter/Análisis
./gradlew lint
```

## Soporte y Ayuda

Si tienes problemas:

1. Revisar los errores en **Logcat**
2. Consultar la documentación oficial:
   - Android: https://developer.android.com
   - Compose: https://developer.android.com/develop/ui/compose
   - Supabase: https://supabase.com/docs
3. Contactar al equipo de desarrollo

## Notas Importantes

- La app requiere **conexión a internet** para funcionar
- Los datos se sincronizan con **Supabase** (backend)
- Cambios en la web se ven automáticamente en mobile
- La base de datos es la **misma** que el dashboard web

¡Listo! Ahora tienes la app Android instalada y lista para usar.

