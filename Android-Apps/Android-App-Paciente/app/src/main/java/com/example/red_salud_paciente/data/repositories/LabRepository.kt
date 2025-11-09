package com.example.red_salud_paciente.data.repositories

import io.github.jan.supabase.postgrest.PostgrestClient
import io.github.jan.supabase.storage.StorageClient
import io.github.jan.supabase.gotrue.GoTrueClient
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LabRepository @Inject constructor(
    private val dbClient: PostgrestClient,
    private val storageClient: StorageClient,
    private val authClient: GoTrueClient
) {
    suspend fun getLabResults() = runCatching {
        val userId = authClient.currentUser?.id ?: throw Exception("No user logged in")
        dbClient.from("lab_results")
            .select()
            .eq("user_id", userId)
            .order("date", ascending = false)
            .execute()
            .decodeList<Map<String, Any>>()
    }
}
