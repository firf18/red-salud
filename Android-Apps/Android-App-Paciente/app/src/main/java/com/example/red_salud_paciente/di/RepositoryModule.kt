package com.example.red_salud_paciente.di

import android.content.Context
import com.example.red_salud_paciente.data.repositories.*
import com.example.red_salud_paciente.data.supabase.SupabaseClientProvider
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Singleton
    @Provides
    fun provideSupabaseClientProvider(@ApplicationContext context: Context): SupabaseClientProvider {
        return SupabaseClientProvider(context)
    }

    @Singleton
    @Provides
    fun provideAuthRepository(supabaseClientProvider: SupabaseClientProvider): AuthRepository {
        return AuthRepository(supabaseClientProvider)
    }

    @Singleton
    @Provides
    fun provideAppointmentRepository(supabaseClientProvider: SupabaseClientProvider): AppointmentRepository {
        return AppointmentRepository(supabaseClientProvider)
    }

    @Singleton
    @Provides
    fun provideMedicationRepository(supabaseClientProvider: SupabaseClientProvider): MedicationRepository {
        return MedicationRepository(supabaseClientProvider)
    }

    @Singleton
    @Provides
    fun provideLabRepository(supabaseClientProvider: SupabaseClientProvider): LabRepository {
        return LabRepository(supabaseClientProvider)
    }

    @Singleton
    @Provides
    fun provideHealthMetricRepository(supabaseClientProvider: SupabaseClientProvider): HealthMetricRepository {
        return HealthMetricRepository(supabaseClientProvider)
    }

    @Singleton
    @Provides
    fun provideMedicalRecordRepository(supabaseClientProvider: SupabaseClientProvider): MedicalRecordRepository {
        return MedicalRecordRepository(supabaseClientProvider)
    }

    @Singleton
    @Provides
    fun provideMessageRepository(supabaseClientProvider: SupabaseClientProvider): MessageRepository {
        return MessageRepository(supabaseClientProvider)
    }

    @Singleton
    @Provides
    fun provideTelemedRepository(supabaseClientProvider: SupabaseClientProvider): TelemedRepository {
        return TelemedRepository(supabaseClientProvider)
    }
}

