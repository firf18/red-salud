package com.example.red_salud_paciente.data.repositories

import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.gotrue.Auth
import kotlinx.serialization.json.JsonObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LabRepository @Inject constructor(
    private val dbClient: Postgrest,
    private val storageClient: Storage,
    private val authClient: Auth
) {
    suspend fun getLabResults() = runCatching {
        val userId = authClient.currentUserOrNull()?.id ?: throw Exception("No user logged in")
        dbClient.from("lab_results")
            .select()
            .eq("user_id", userId)
            .order("date", ascending = false)
            .decodeList<JsonObject>()
    }
}
