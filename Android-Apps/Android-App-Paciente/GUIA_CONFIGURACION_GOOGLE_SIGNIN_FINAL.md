# 🔐 Guía de Configuración de Google Sign-In Completa

## ✅ Estado Actual

Tu aplicación RED SALUD ya tiene:
- ✅ UI profesional con header oscuro (diseño modernista)
- ✅ Formularios de Login y Registro con validaciones
- ✅ Botones de Google Sign-In integrados
- ✅ Google Play Services Auth añadido a las dependencias
- ✅ Utilidades de Google Sign-In (`GoogleSignInUtils.kt`)
- ✅ ViewModel con soporte para Google Sign-In

## 📋 Pasos para que Google Sign-In sea 100% funcional

### Paso 1: Obtener el Web Client ID de Google

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **APIs y Servicios** > **Credenciales**
4. Haz clic en **+ Crear credenciales** > **ID de cliente OAuth 2.0**
5. Selecciona **Aplicación de Android** (si no existe, créala)
6. Necesitarás:
   - El SHA-1 de tu certificado de firma (obtén con `keytool -list -v -keystore ~/.android/debug.keystore`)
   - El nombre de tu paquete: `com.example.red_salud_paciente`

7. Una vez creado, obtén también un **ID de cliente web OAuth 2.0**
   - Este es el `Web Client ID` que necesitas

### Paso 2: Actualizar el Archivo `GoogleSignInUtils.kt`

En el archivo:
```
app/src/main/java/com/example/red_salud_paciente/utils/GoogleSignInUtils.kt
```

Reemplaza:
```kotlin
private const val SERVER_CLIENT_ID = "YOUR_GOOGLE_WEB_CLIENT_ID"
```

Con tu Web Client ID real.

### Paso 3: Actualizar el Repository

En el archivo:
```
app/src/main/java/com/example/red_salud_paciente/data/repositories/Repositories.kt
```

En el método `loginWithGoogle()`, reemplaza:
```kotlin
serverClientId = "YOUR_GOOGLE_WEB_CLIENT_ID"
```

Con tu Web Client ID.

### Paso 4: Configurar Google Sign-In Activity en MainActivity

En el archivo `MainActivity.kt`, necesitarás:

```kotlin
import android.content.Intent
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.common.api.ApiException

class MainActivity : ComponentActivity() {
    private val RC_SIGN_IN = 9001
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        setContent {
            AppNavigation(
                userId = null,
                onLogout = {}
            )
        }
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == RC_SIGN_IN) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            try {
                val account = task.getResult(ApiException::class.java)
                // El usuario ha iniciado sesión exitosamente
            } catch (e: ApiException) {
                // Error en Google Sign-In
            }
        }
    }
}
```

### Paso 5: Compilar y Probar

1. Sincroniza Gradle
2. Compila la app: `./gradlew build`
3. Ejecuta en un dispositivo físico o emulador con Google Play Services instalado

---

## 🎨 UI Profesional Implementada

### Pantalla de Login
```
┌─────────────────────────────────────┐
│  Header Oscuro (Negro #1F1F1F)      │
│         🏥 Red Salud                │
└─────────────────────────────────────┘
        ┌──────────────────────────┐
        │   Iniciar Sesión         │
        ├──────────────────────────┤
        │ ✉️  Email                │
        │ 🔒  Contraseña      👁️  │
        │ [Iniciar Sesión]         │
        │ ─────────────────────────│
        │ O continúa con           │
        │ [🔐 Iniciar con Google]  │
        │                          │
        │ ¿No tienes cuenta?       │
        │  → Regístrate aquí       │
        └──────────────────────────┘
```

### Pantalla de Registro
```
┌─────────────────────────────────────┐
│ ← Header Oscuro (Negro #1F1F1F)     │
│     Crear Cuenta                    │
└─────────────────────────────────────┘
        ┌──────────────────────────┐
        │ 👤  Nombre Completo      │
        │ 🆔  Cédula               │
        │ ✉️  Email                │
        │ 🔒  Contraseña      👁️  │
        │ 🔒  Confirmar            │
        │ [Registrarse]            │
        │ ─────────────────────────│
        │ O regístrate con         │
        │ [🔐 Registrarse Google]  │
        │                          │
        │ ¿Ya tienes cuenta?       │
        │  → Inicia sesión         │
        └──────────────────────────┘
```

---

## 🔀 Navegación Post-Login/Registro

Después de autenticarse exitosamente, el usuario ve:

### 📊 Dashboard Principal
```
Red Salud - Paciente [Menu ☰]

[Estadísticas]
┌─────────────────────────────┐
│ 📅 2 Citas Próximas         │
│ 💊 5 Medicamentos Activos   │
│ 🔬 3 Exámenes Pendientes    │
└─────────────────────────────┘

[Acceso Rápido]
┌─────────────────────────────┐
│ 📅 Citas        💊 Medicinas│
│ 🔬 Laboratorio  📊 Métricas │
│ 📋 Historial    💬 Mensajes │
│ 🎥 Telemedicina             │
└─────────────────────────────┘
```

### Subpantallas Disponibles

1. **📅 Citas Médicas**
   - Ver citas próximas
   - Agendar nueva cita
   - Cancelar cita
   - Detalles del médico

2. **💊 Medicamentos**
   - Medicamentos activos
   - Dosis e indicaciones
   - Historial de medicinas
   - Recordatorios de toma

3. **🔬 Resultados de Laboratorio**
   - Exámenes realizados
   - Descargar resultados
   - Ver gráficos de tendencias

4. **📊 Métricas de Salud**
   - Presión arterial
   - Glucosa
   - Peso
   - Gráficos de seguimiento

5. **📋 Historial Médico**
   - Diagnósticos
   - Antecedentes
   - Alergias
   - Cirugías previas

6. **💬 Mensajes**
   - Chat con doctores
   - Consultas escritas
   - Notificaciones

7. **🎥 Telemedicina**
   - Videoconsultas
   - Agendar videollamada
   - Historial de sesiones

---

## 🚀 Próximos Pasos

### Completar la Integración
1. ✅ UI profesional - HECHO
2. ⏳ Configurar Google Cloud Console - REQUIERE ACCIÓN
3. ⏳ Añadir Web Client ID - REQUIERE ACCIÓN
4. ⏳ Conectar con Supabase Backend - PENDIENTE
5. ⏳ Probar en dispositivo real - PENDIENTE

### Mejoras Futuras
- Autenticación con huella dactilar
- Recuperación de contraseña
- Autenticación de 2 factores
- Sincronización con Supabase real

---

## 📱 Características UI Implementadas

✅ **Diseño Moderno**
- Header oscuro profesional
- Cards redondeadas (border-radius: 24dp)
- Colores consistentes

✅ **Validaciones**
- Email válido
- Contraseñas iguales
- Campos requeridos
- Botones deshabilitados en estado inválido

✅ **Estados Reactivos**
- Loading: Spinner circular
- Success: Navegación automática
- Error: Mensaje rojo claro

✅ **Accesibilidad**
- Iconos claros
- Contraste de colores
- Textos legibles
- Toggle de visibilidad de contraseña

---

## 🔗 Flujo Completo

```
Splash / Login
    ↓
┌─────────────────────────┐
│ Inicio de Sesión        │
│ ├─ Email + Contraseña   │
│ └─ Google Sign-In 🔐    │
└─────────────────────────┘
    ↓ ✅ Autenticado
┌─────────────────────────┐
│ Dashboard Principal     │
│ ├─ Citas              │
│ ├─ Medicamentos       │
│ ├─ Laboratorio        │
│ ├─ Métricas           │
│ ├─ Historial          │
│ ├─ Mensajes           │
│ └─ Telemedicina       │
└─────────────────────────┘
    ↓ (Menú)
[Cerrar Sesión] → Login
```

---

## 📖 Archivos Modificados

1. **gradle/libs.versions.toml** - Agregada versión de Google Play Services
2. **app/build.gradle.kts** - Agregada dependencia de Google Auth
3. **AuthScreens.kt** - UI profesional con header oscuro
4. **GoogleSignInComponents.kt** - Componentes mejorados
5. **ViewModels.kt** - Método loginWithGoogle con Context
6. **Repositories.kt** - Implementación real de Google Sign-In
7. **GoogleSignInUtils.kt** - NUEVO: Utilidades de Google Sign-In

---

## ⚠️ Importante

Para hacer funcional Google Sign-In 100%, **debes**:
1. Tener una cuenta de Google Cloud
2. Crear un proyecto en Google Cloud Console
3. Obtener el Web Client ID
4. Actualizar los archivos con tu ID
5. Usar un dispositivo con Google Play Services


