package com.example.red_salud_paciente.data.repositories

import io.github.jan.supabase.postgrest.PostgrestClient
import io.github.jan.supabase.gotrue.GoTrueClient
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TelemedRepository @Inject constructor(
    private val dbClient: PostgrestClient,
    private val authClient: GoTrueClient
) {
    suspend fun getUpcomingAppointments() = runCatching {
        val userId = authClient.currentUser?.id ?: throw Exception("No user logged in")
        dbClient.from("telemed_appointments")
            .select()
            .eq("user_id", userId)
            .gte("scheduled_time", "now()")
            .order("scheduled_time")
            .execute()
            .decodeList<Map<String, Any>>()
    }
}
