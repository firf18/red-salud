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
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.storage.Storage
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
        authClient: Auth,
        dataStoreManager: DataStoreManager
    ): AuthRepository {
        return AuthRepository(authClient, dataStoreManager)
    }
    
    @Provides
    @Singleton
    fun provideAppointmentRepository(
        dbClient: Postgrest,
        authClient: Auth
    ): AppointmentRepository {
        return AppointmentRepository(dbClient, authClient)
    }
    
    @Provides
    @Singleton
    fun provideMedicationRepository(
        dbClient: Postgrest,
        authClient: Auth
    ): MedicationRepository {
        return MedicationRepository(dbClient, authClient)
    }
    
    @Provides
    @Singleton
    fun provideLabRepository(
        dbClient: Postgrest,
        storageClient: Storage,
        authClient: Auth
    ): LabRepository {
        return LabRepository(dbClient, storageClient, authClient)
    }
    
    @Provides
    @Singleton
    fun provideHealthMetricRepository(
        dbClient: Postgrest,
        authClient: Auth
    ): HealthMetricRepository {
        return HealthMetricRepository(dbClient, authClient)
    }
    
    @Provides
    @Singleton
    fun provideMedicalRecordRepository(
        dbClient: Postgrest,
        authClient: Auth
    ): MedicalRecordRepository {
        return MedicalRecordRepository(dbClient, authClient)
    }
    
    @Provides
    @Singleton
    fun provideMessageRepository(
        dbClient: Postgrest,
        authClient: Auth
    ): MessageRepository {
        return MessageRepository(dbClient, authClient)
    }
    
    @Provides
    @Singleton
    fun provideTelemedRepository(
        dbClient: Postgrest,
        authClient: Auth
    ): TelemedRepository {
        return TelemedRepository(dbClient, authClient)
    }
}
