package com.example.red_salud_paciente.di

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStore
import com.example.red_salud_paciente.data.local.DataStoreManager
import com.example.red_salud_paciente.data.repositories.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import io.github.jan.supabase.gotrue.GoTrueClient
import io.github.jan.supabase.postgrest.PostgrestClient
import io.github.jan.supabase.storage.StorageClient
import javax.inject.Singleton

// Para DataStore
private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "red_salud_prefs")

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
    @Provides
    @Singleton
    fun provideDataStoreManager(@ApplicationContext context: Context): DataStoreManager {
        return DataStoreManager(context.dataStore)
    }
    
    @Provides
    @Singleton
    fun provideAuthRepository(
        authClient: GoTrueClient,
        dataStoreManager: DataStoreManager
    ): AuthRepository {
        return AuthRepository(authClient, dataStoreManager)
    }
    
    @Provides
    @Singleton
    fun provideAppointmentRepository(
        dbClient: PostgrestClient,
        authClient: GoTrueClient
    ): AppointmentRepository {
        return AppointmentRepository(dbClient, authClient)
    }
    
    @Provides
    @Singleton
    fun provideMedicationRepository(
        dbClient: PostgrestClient,
        authClient: GoTrueClient
    ): MedicationRepository {
        return MedicationRepository(dbClient, authClient)
    }
    
    @Provides
    @Singleton
    fun provideLabRepository(
        dbClient: PostgrestClient,
        storageClient: StorageClient,
        authClient: GoTrueClient
    ): LabRepository {
        return LabRepository(dbClient, storageClient, authClient)
    }
    
    @Provides
    @Singleton
    fun provideHealthMetricRepository(
        dbClient: PostgrestClient,
        authClient: GoTrueClient
    ): HealthMetricRepository {
        return HealthMetricRepository(dbClient, authClient)
    }
    
    @Provides
    @Singleton
    fun provideMedicalRecordRepository(
        dbClient: PostgrestClient,
        authClient: GoTrueClient
    ): MedicalRecordRepository {
        return MedicalRecordRepository(dbClient, authClient)
    }
    
    @Provides
    @Singleton
    fun provideMessageRepository(
        dbClient: PostgrestClient,
        authClient: GoTrueClient
    ): MessageRepository {
        return MessageRepository(dbClient, authClient)
    }
    
    @Provides
    @Singleton
    fun provideTelemedRepository(
        dbClient: PostgrestClient,
        authClient: GoTrueClient
    ): TelemedRepository {
        return TelemedRepository(dbClient, authClient)
    }
}
