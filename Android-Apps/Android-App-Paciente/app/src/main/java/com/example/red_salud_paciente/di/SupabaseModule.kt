package com.example.red_salud_paciente.di

import com.example.red_salud_paciente.data.supabase.SupabaseClientProvider
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import io.github.jan.supabase.SupabaseClient
import javax.inject.Singleton

/**
 * Módulo de Dagger Hilt para proporcionar instancias relacionadas con Supabase
 */
@Module
@InstallIn(SingletonComponent::class)
object SupabaseModule {
    
    @Provides
    @Singleton
    fun provideSupabaseClient(provider: SupabaseClientProvider): SupabaseClient {
        return provider.client
    }
    
    @Provides
    @Singleton
    fun provideSupabaseAuthClient(supabaseClient: SupabaseClient) = supabaseClient.auth
    
    @Provides
    @Singleton
    fun provideSupabaseDatabaseClient(supabaseClient: SupabaseClient) = supabaseClient.db
    
    @Provides
    @Singleton
    fun provideSupabaseStorageClient(supabaseClient: SupabaseClient) = supabaseClient.storage
}
