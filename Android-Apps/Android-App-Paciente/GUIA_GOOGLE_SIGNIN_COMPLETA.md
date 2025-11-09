# Guía de Integración Completa de Google Sign-In

## Paso 1: Configurar Google Cloud Console

### 1.1 Crear Proyecto en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto llamado "Red Salud"
3. Espera a que se cree el proyecto

### 1.2 Habilitar Google Sign-In API
1. En la búsqueda, escribe "Google+ API"
2. Selecciona "Google+ API"
3. Haz clic en "Enable"

### 1.3 Crear Credenciales OAuth 2.0
1. Ve a "Credenciales" en el menú izquierdo
2. Haz clic en "Crear credenciales"
3. Selecciona "OAuth 2.0 Client ID"
4. Selecciona "Aplicación de Android"
5. Sigue los pasos:

### 1.4 Obtener SHA-1 de tu App
```bash
# Para debug
./gradlew signingReport

# O usando keytool
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### 1.5 Agregar SHA-1 a Google Cloud
1. Copia el SHA-1 del paso anterior
2. En "Crear credenciales Android":
   - Package Name: `com.example.red_salud_paciente`
   - SHA-1: Pega el SHA-1 que copiaste
3. Haz clic en "Crear"
4. Descarga el archivo `google-services.json`

## Paso 2: Integrar google-services.json en la App

1. Coloca `google-services.json` en: `app/`
2. Actualiza el archivo `build.gradle` (Project level):

```gradle
plugins {
    // ... plugins existentes
    id 'com.google.gms.google-services' version '4.4.0' apply false
}
```

3. Actualiza `app/build.gradle`:

```gradle
plugins {
    id 'com.android.application'
    id 'kotlin-android'
    id 'kotlin-kapt'
    id 'com.google.gms.google-services'  // Agregar esta línea
    // ... otros plugins
}
```

## Paso 3: Actualizar GoogleSignInUtils.kt

Reemplaza el `serverClientId` con el tuyo:

```kotlin
fun initializeGoogleSignIn(context: Context, serverClientId: String): GoogleSignInClient {
    if (googleSignInClient == null) {
        val gsoBuilder = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(serverClientId)  // Tu Web Client ID
            .requestEmail()
            .requestProfile()
            .build()

        googleSignInClient = GoogleSignIn.getClient(context, gsoBuilder)
    }
    return googleSignInClient!!
}
```

## Paso 4: Actualizar AuthScreens.kt - Implementar Google Sign-In Real

Reemplaza la implementación simulada con la real:

```kotlin
@Composable
fun LoginScreen(
    // ... parámetros existentes
) {
    // ... variables existentes
    val activity = LocalContext.current as? Activity

    GoogleSignInButton(
        onClick = {
            if (activity != null) {
                isGoogleSigningIn = true
                val googleSignInClient = GoogleSignIn.getClient(
                    activity,
                    GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                        .requestIdToken("TU_WEB_CLIENT_ID.apps.googleusercontent.com")
                        .requestEmail()
                        .requestProfile()
                        .build()
                )
                val signInIntent = googleSignInClient.signInIntent
                activity.startActivityForResult(signInIntent, 100)
            }
        },
        isLoading = isGoogleSigningIn,
        enabled = uiState !is AuthUiState.Loading
    )
}
```

## Paso 5: Manejar Resultado en MainActivity.kt

Actualiza MainActivity para manejar el resultado:

```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    private val authViewModel: AuthViewModel by viewModels()
    private val googleSignInLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            try {
                val account = task.getResult(ApiException::class.java)
                // Procesar la cuenta de Google
                authViewModel.loginWithGoogle(
                    email = account.email ?: "",
                    displayName = account.displayName ?: "",
                    idToken = account.idToken
                )
            } catch (e: ApiException) {
                Log.w("GoogleSignIn", "Google sign in failed", e)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // ... código existente
    }
}
```

## Paso 6: Agregación de Firebase (Opcional pero Recomendado)

Para mejor experiencia con Google Sign-In:

```gradle
// app/build.gradle
dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.0.0')
    implementation 'com.google.firebase:firebase-auth-ktx'
}
```

## Configuración en AndroidManifest.xml

Asegúrate de tener los permisos necesarios:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## Verificación Final

1. ✅ Coloca `google-services.json` en la carpeta correcta
2. ✅ Actualiza los plugins en `build.gradle`
3. ✅ Reemplaza el `serverClientId` con el tuyo
4. ✅ Implementa el manejador de resultados
5. ✅ Compila y prueba la app

```bash
./gradlew.bat clean build
```

## Solución de Problemas

### Error: "Cannot resolve symbol 'com.google.gms'"
- Actualiza las dependencias: `Sync Now` en Android Studio
- Verifica que los plugins estén correctos

### Error: "Invalid SHA-1"
- Asegúrate de copiar el SHA-1 correcto (para debug)
- Regenera el `google-services.json`

### Error: "Google Sign-In client is null"
- Verifica que `initializeGoogleSignIn()` se llamó primero
- Verifica que `google-services.json` existe

## Cómo Probar

1. Compila y ejecuta la app
2. Haz clic en "Iniciar con Google" en la pantalla de login
3. Selecciona una cuenta de Google
4. Deberías ser autenticado y navegado al dashboard

¡Listo! Ahora tienes Google Sign-In completamente integrado en tu app. 🎉

