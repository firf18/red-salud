package com.example.red_salud_paciente.data.supabase

import com.example.red_salud_paciente.data.network.SupabaseConfig
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.GoTrue
import io.github.jan.supabase.gotrue.gotrue
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.storage.storage
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Proveedor del cliente de Supabase para la inyección de dependencias
 */
@Singleton
class SupabaseClientProvider @Inject constructor() {
    val client: SupabaseClient = createSupabaseClient(
        supabaseUrl = SupabaseConfig.SUPABASE_URL,
        supabaseKey = SupabaseConfig.SUPABASE_ANON_KEY
    ) {
        install(GoTrue) {
            // Configuración adicional de autenticación si es necesaria
        }
        install(Postgrest)
        install(Storage)
    }
}

/**
 * Extensiones para acceder a los módulos de Supabase de manera más sencilla
 */
val SupabaseClient.auth get() = gotrue
val SupabaseClient.db get() = postgrest
val SupabaseClient.storage get() = storage
