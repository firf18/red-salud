package com.example.red_salud_paciente.presentation.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

abstract class BaseViewModel<State, Event> : ViewModel() {
    private val _uiState = MutableStateFlow<State?>(null)
    val uiState: StateFlow<State?> = _uiState.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    protected fun setState(state: State) {
        _uiState.value = state
    }

    protected fun setLoading(loading: Boolean) {
        _isLoading.value = loading
    }

    protected fun setError(error: String?) {
        _error.value = error
    }

    abstract fun onEvent(event: Event)

    protected fun <T> execute(
        block: suspend () -> T,
        onSuccess: (T) -> Unit = {},
        onError: (Throwable) -> Unit = { setError(it.message) }
    ) {
        viewModelScope.launch {
            try {
                setLoading(true)
                val result = block()
                setError(null)
                onSuccess(result)
            } catch (e: Exception) {
                onError(e)
            } finally {
                setLoading(false)
            }
        }
    }
}
