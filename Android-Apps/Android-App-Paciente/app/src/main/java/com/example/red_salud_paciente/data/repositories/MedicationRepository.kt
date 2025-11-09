package com.example.red_salud_paciente.data.repositories

import io.github.jan.supabase.postgrest.PostgrestClient
import io.github.jan.supabase.gotrue.GoTrueClient
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MedicationRepository @Inject constructor(
    private val dbClient: PostgrestClient,
    private val authClient: GoTrueClient
) {
    suspend fun getCurrentMedications() = runCatching {
        val userId = authClient.currentUser?.id ?: throw Exception("No user logged in")
        dbClient.from("medications")
            .select()
            .eq("user_id", userId)
            .eq("is_active", true)
            .execute()
            .decodeList<Map<String, Any>>()
    }
}
