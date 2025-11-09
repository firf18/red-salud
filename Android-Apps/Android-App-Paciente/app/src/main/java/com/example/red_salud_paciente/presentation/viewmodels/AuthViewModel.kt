package com.example.red_salud_paciente.presentation.viewmodels

import com.example.red_salud_paciente.data.repositories.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

sealed class AuthEvent {
    data class Login(val email: String, val password: String) : AuthEvent()
    data class Register(val email: String, val password: String, val fullName: String) : AuthEvent()
    object Logout : AuthEvent()
    object CheckAuth : AuthEvent()
}

data class AuthState(
    val isAuthenticated: Boolean = false,
    val isLoading: Boolean = false,
    val error: String? = null,
    val userEmail: String? = null
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : BaseViewModel<AuthState, AuthEvent>() {

    init {
        onEvent(AuthEvent.CheckAuth)
    }

    override fun onEvent(event: AuthEvent) {
        when (event) {
            is AuthEvent.Login -> login(event.email, event.password)
            is AuthEvent.Register -> register(event.email, event.password, event.fullName)
            is AuthEvent.Logout -> logout()
            is AuthEvent.CheckAuth -> checkAuth()
        }
    }

    private fun login(email: String, password: String) {
        execute(
            block = { authRepository.signInWithEmail(email, password) },
            onSuccess = { setState(AuthState(isAuthenticated = true, userEmail = email)) },
            onError = { setState(AuthState(error = it.message)) }
        )
    }

    private fun register(email: String, password: String, fullName: String) {
        execute(
            block = { authRepository.signUpWithEmail(email, password, fullName) },
            onSuccess = { setState(AuthState(isAuthenticated = true, userEmail = email)) },
            onError = { setState(AuthState(error = it.message)) }
        )
    }

    private fun logout() {
        execute(
            block = { authRepository.signOut() },
            onSuccess = { setState(AuthState(isAuthenticated = false, userEmail = null)) },
            onError = { setState(AuthState(error = it.message)) }
        )
    }

    private fun checkAuth() {
        execute(
            block = { authRepository.getCurrentUser() != null },
            onSuccess = { isAuthenticated ->
                setState(
                    AuthState(
                        isAuthenticated = isAuthenticated,
                        userEmail = if (isAuthenticated) authRepository.getCurrentUser()?.email else null
                    )
                )
            }
        )
    }
}
