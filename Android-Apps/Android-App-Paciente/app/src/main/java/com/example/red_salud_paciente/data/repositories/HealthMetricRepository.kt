package com.example.red_salud_paciente.data.repositories

import io.github.jan.supabase.postgrest.PostgrestClient
import io.github.jan.supabase.gotrue.GoTrueClient
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class HealthMetricRepository @Inject constructor(
    private val dbClient: PostgrestClient,
    private val authClient: GoTrueClient
) {
    suspend fun getHealthMetrics() = runCatching {
        val userId = authClient.currentUser?.id ?: throw Exception("No user logged in")
        dbClient.from("health_metrics")
            .select()
            .eq("user_id", userId)
            .order("date", ascending = false)
            .execute()
            .decodeList<Map<String, Any>>()
    }
}
