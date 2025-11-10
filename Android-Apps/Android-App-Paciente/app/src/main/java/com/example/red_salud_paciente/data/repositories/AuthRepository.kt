package com.example.red_salud_paciente.data.repositories

import com.example.red_salud_paciente.data.local.DataStoreManager
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import io.github.jan.supabase.gotrue.user.UserInfo
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repositorio para manejar la autenticación de usuarios con Supabase
 */
@Singleton
class AuthRepository @Inject constructor(
    private val authClient: Auth,
    private val dataStoreManager: DataStoreManager
) {
    
    /**
     * Iniciar sesión con email y contraseña
     */
    suspend fun signInWithEmail(email: String, password: String): Result<Unit> {
        return try {
            authClient.signInWith(Email) {
                this.email = email
                this.password = password
            }
            
            val user = authClient.currentUserOrNull()
            val session = authClient.currentSessionOrNull()
            
            // Guardar datos de la sesión
            dataStoreManager.saveSession(
                userId = user?.id ?: "",
                email = user?.email ?: "",
                name = user?.userMetadata?.get("full_name")?.toString() ?: "",
                accessToken = session?.accessToken ?: "",
                refreshToken = session?.refreshToken ?: ""
            )
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Registrar un nuevo usuario
     */
    suspend fun signUpWithEmail(email: String, password: String, fullName: String): Result<Unit> {
        return try {
            authClient.signUpWith(Email) {
                this.email = email
                this.password = password
                data = buildMap {
                    put("full_name", fullName)
                }
            }
            
            // Iniciar sesión automáticamente después del registro exitoso
            signInWithEmail(email, password)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Cerrar sesión
     */
    suspend fun signOut() {
        try {
            authClient.signOut()
            dataStoreManager.clearSession()
        } catch (e: Exception) {
            // Log the error
            e.printStackTrace()
        }
    }
    
    /**
     * Obtener el usuario actual
     */
    suspend fun getCurrentUser(): UserInfo? {
        return try {
            authClient.retrieveUser()
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Verificar si hay una sesión activa
     */
    fun isUserLoggedIn(): Flow<Boolean> = dataStoreManager.isLoggedIn
    
    /**
     * Obtener el token de acceso
     */
    suspend fun getAccessToken(): String? {
        return try {
            authClient.currentSessionOrNull()?.accessToken
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Restablecer contraseña
     */
    suspend fun resetPassword(email: String): Result<Unit> {
        return try {
            authClient.resetPasswordForEmail(email)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
