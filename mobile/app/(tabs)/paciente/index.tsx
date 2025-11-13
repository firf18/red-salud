import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@mobile/providers/AuthProvider';
import { Ionicons } from '@expo/vector-icons';

// Hooks
import { useProfile, useAppointments, useMedications } from '@mobile/hooks';

// Components
import { StatsCard, AppointmentCard, MedicationCard } from '@mobile/components/dashboard';
import { Button } from '@mobile/components/ui/Button';
import { Skeleton } from '@mobile/components/ui/Skeleton';

export default function HomePaciente() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  // Queries
  const { data: perfil, isLoading: loadingPerfil, refetch: refetchPerfil } = useProfile(user?.id);
  const { 
    stats: appointmentStats, 
    upcoming, 
    isLoading: loadingAppointments,
    refetch: refetchAppointments 
  } = useAppointments(user?.id!);
  const { 
    stats: medicationStats, 
    active, 
    isLoading: loadingMedications,
    refetch: refetchMedications 
  } = useMedications(user?.id!);

  const nombre = perfil?.nombre?.split(' ')?.[0] || 'Paciente';

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchPerfil(),
      refetchAppointments(),
      refetchMedications(),
    ]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      {/* Header */}
      <View className="bg-white px-4 pt-6 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Hola, {nombre} 👋</Text>
        <Text className="text-gray-600 mt-1">¿Qué deseas hacer hoy?</Text>
      </View>

      {/* Stats Cards */}
      <View className="px-4 py-4">
        <View className="flex-row gap-3 mb-3">
          {loadingAppointments ? (
            <>
              <View className="flex-1">
                <Skeleton className="h-24" variant="rectangular" />
              </View>
              <View className="flex-1">
                <Skeleton className="h-24" variant="rectangular" />
              </View>
            </>
          ) : (
            <>
              <StatsCard
                Icon={IconCalendar}
                value={appointmentStats?.upcoming || 0}
                label="Próximas Citas"
                sublabel={`${appointmentStats?.completed || 0} completadas`}
                color="blue"
                onPress={() => router.push('/(tabs)/paciente/citas')}
              />
              <StatsCard
                Icon={IconLab}
                value={0}
                label="Laboratorio"
                sublabel="Resultados"
                color="green"
                onPress={() => router.push('/(tabs)/paciente/laboratorio')}
              />
            </>
          )}
        </View>

        <View className="flex-row gap-3">
          {loadingMedications ? (
            <>
              <View className="flex-1">
                <Skeleton className="h-24" variant="rectangular" />
              </View>
              <View className="flex-1">
                <Skeleton className="h-24" variant="rectangular" />
              </View>
            </>
          ) : (
            <>
              <StatsCard
                Icon={IconPill}
                value={medicationStats?.active || 0}
                label="Medicamentos"
                sublabel={`${medicationStats?.total || 0} en total`}
                color="purple"
                onPress={() => router.push('/(tabs)/paciente/medicamentos')}
              />
              <StatsCard
                Icon={IconChat}
                value={0}
                label="Mensajes"
                sublabel="Sin leer"
                color="orange"
                onPress={() => router.push('/(tabs)/paciente/mensajes')}
              />
            </>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-4 pb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Acciones Rápidas</Text>
        <View className="gap-3">
          <Button 
            title="📅 Agendar Nueva Cita" 
            onPress={() => router.push('/(tabs)/paciente/citas/nueva')}
            variant="primary"
          />
          <Button 
            title="🎥 Iniciar Telemedicina" 
            onPress={() => router.push('/(tabs)/paciente/telemedicina')}
            variant="ghost"
          />
        </View>
      </View>

      {/* Upcoming Appointments */}
      <View className="px-4 pb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-900">Próximas Citas</Text>
          <Pressable onPress={() => router.push('/(tabs)/paciente/citas')}>
            <Text className="text-blue-600 font-medium">Ver todas</Text>
          </Pressable>
        </View>

        {loadingAppointments ? (
          <View className="gap-3">
            <Skeleton className="h-28" variant="rectangular" />
            <Skeleton className="h-28" variant="rectangular" />
          </View>
        ) : upcoming && upcoming.length > 0 ? (
          <View className="gap-3">
            {upcoming.slice(0, 3).map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onPress={() => router.push(`/(tabs)/paciente/citas/${appointment.id}`)}
              />
            ))}
          </View>
        ) : (
          <View className="bg-white rounded-lg p-6 items-center">
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2">No tienes citas próximas</Text>
            <Text className="text-gray-400 text-sm mt-1">Agenda una nueva cita</Text>
          </View>
        )}
      </View>

      {/* Active Medications */}
      <View className="px-4 pb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-900">Medicamentos Activos</Text>
          <Pressable onPress={() => router.push('/(tabs)/paciente/medicamentos')}>
            <Text className="text-blue-600 font-medium">Ver todos</Text>
          </Pressable>
        </View>

        {loadingMedications ? (
          <View className="gap-3">
            <Skeleton className="h-24" variant="rectangular" />
            <Skeleton className="h-24" variant="rectangular" />
          </View>
        ) : active && active.length > 0 ? (
          <View className="gap-3">
            {active.slice(0, 3).map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onPress={() => router.push(`/(tabs)/paciente/medicamentos/${medication.id}`)}
              />
            ))}
          </View>
        ) : (
          <View className="bg-white rounded-lg p-6 items-center">
            <Ionicons name="medkit-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2">No tienes medicamentos activos</Text>
            <Text className="text-gray-400 text-sm mt-1">Tus medicamentos aparecerán aquí</Text>
          </View>
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}
  const IconCalendar = (props: any) => <Ionicons name="calendar-outline" {...props} />;
  const IconLab = (props: any) => <Ionicons name="stats-chart-outline" {...props} />;
  const IconPill = (props: any) => <Ionicons name="medkit-outline" {...props} />;
  const IconChat = (props: any) => <Ionicons name="chatbubble-outline" {...props} />;
