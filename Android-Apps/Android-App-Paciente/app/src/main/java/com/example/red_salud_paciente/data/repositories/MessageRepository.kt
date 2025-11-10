package com.example.red_salud_paciente.data.repositories

import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.gotrue.Auth
import kotlinx.serialization.json.JsonObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MessageRepository @Inject constructor(
    private val dbClient: Postgrest,
    private val authClient: Auth
) {
    suspend fun getMessages() = runCatching {
        val userId = authClient.currentUserOrNull()?.id ?: throw Exception("No user logged in")
        dbClient.from("messages")
            .select()
            .or("sender_id.eq.$userId,receiver_id.eq.$userId")
            .order("timestamp", ascending = false)
            .decodeList<JsonObject>()
    }
}
