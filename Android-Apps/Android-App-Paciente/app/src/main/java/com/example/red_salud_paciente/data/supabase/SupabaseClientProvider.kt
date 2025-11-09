package com.example.red_salud_paciente.data.supabase

import android.content.Context

class SupabaseClientProvider(
    private val context: Context
) {
    // TODO: Implementar cliente real de Supabase cuando se resuelvan las dependencias
    val client: MockSupabaseClient by lazy {
        MockSupabaseClient()
    }
}

// Clase mock para simular el cliente de Supabase
class MockSupabaseClient {
    // TODO: Implementar métodos reales cuando se integre Supabase
    fun handleDeeplinks(intent: Any) {
        // Mock implementation
    }
}