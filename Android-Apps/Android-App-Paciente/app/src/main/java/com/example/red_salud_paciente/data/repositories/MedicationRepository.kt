package com.example.red_salud_paciente.data.repositories

import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.gotrue.Auth
import kotlinx.serialization.json.JsonObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MedicationRepository @Inject constructor(
    private val dbClient: Postgrest,
    private val authClient: Auth
) {
    suspend fun getCurrentMedications() = runCatching {
        val userId = authClient.currentUserOrNull()?.id ?: throw Exception("No user logged in")
        dbClient.from("medications")
            .select()
            .eq("user_id", userId)
            .eq("is_active", true)
            .decodeList<JsonObject>()
    }
}
