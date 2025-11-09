package com.example.red_salud_paciente.data.repositories

import io.github.jan.supabase.postgrest.PostgrestClient
import io.github.jan.supabase.gotrue.GoTrueClient
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MessageRepository @Inject constructor(
    private val dbClient: PostgrestClient,
    private val authClient: GoTrueClient
) {
    suspend fun getMessages() = runCatching {
        val userId = authClient.currentUser?.id ?: throw Exception("No user logged in")
        dbClient.from("messages")
            .select()
            .or("sender_id.eq.$userId,receiver_id.eq.$userId")
            .order("timestamp", ascending = false)
            .execute()
            .decodeList<Map<String, Any>>()
    }
}
