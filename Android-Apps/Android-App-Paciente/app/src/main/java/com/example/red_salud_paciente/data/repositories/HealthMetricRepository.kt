package com.example.red_salud_paciente.data.repositories

import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.gotrue.Auth
import kotlinx.serialization.json.JsonObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class HealthMetricRepository @Inject constructor(
    private val dbClient: Postgrest,
    private val authClient: Auth
) {
    suspend fun getHealthMetrics() = runCatching {
        val userId = authClient.currentUserOrNull()?.id ?: throw Exception("No user logged in")
        dbClient.from("health_metrics")
            .select()
            .eq("user_id", userId)
            .order("date", ascending = false)
            .decodeList<JsonObject>()
    }
}
