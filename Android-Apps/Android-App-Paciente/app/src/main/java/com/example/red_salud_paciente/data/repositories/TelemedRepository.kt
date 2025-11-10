package com.example.red_salud_paciente.data.repositories

import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.gotrue.Auth
import kotlinx.serialization.json.JsonObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TelemedRepository @Inject constructor(
    private val dbClient: Postgrest,
    private val authClient: Auth
) {
    suspend fun getUpcomingAppointments() = runCatching {
        val userId = authClient.currentUserOrNull()?.id ?: throw Exception("No user logged in")
        dbClient.from("telemed_appointments")
            .select()
            .eq("user_id", userId)
            .gte("scheduled_time", "now()")
            .order("scheduled_time")
            .decodeList<JsonObject>()
    }
}
