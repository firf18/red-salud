package com.example.red_salud_paciente.data.network

/**
 * Configuración de Supabase para la aplicación
 */
object SupabaseConfig {
    // URL de la instancia de Supabase
    const val SUPABASE_URL = "https://hwckkfiirldgundbcjsp.supabase.co"
    
    // Clave anónima de la API de Supabase
    const val SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2trZmlpcmxkZ3VuZGJjanNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDA4MjcsImV4cCI6MjA3Nzc3NjgyN30.6Gh2U3mx7NsePvQEYMGnh23DqhJV43QRlPvYRynO8fY"
    
    // URL de la API REST
    const val REST_API_URL = "$SUPABASE_URL/rest/v1"
    
    // URL de autenticación
    const val AUTH_URL = "$SUPABASE_URL/auth/v1"
    
    // URL de almacenamiento
    const val STORAGE_URL = "$SUPABASE_URL/storage/v1"
}

