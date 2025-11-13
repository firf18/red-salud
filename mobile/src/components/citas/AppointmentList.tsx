/**
 * Componente de lista de citas
 */

import React from 'react';
import { View, FlatList, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppointmentCard } from '@mobile/components/dashboard';
import { Skeleton } from '@mobile/components/ui';
import type { Appointment } from '@mobile/types';

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading: boolean;
  onAppointmentPress: (appointment: Appointment) => void;
  emptyMessage?: string;
}

export function AppointmentList({
  appointments,
  isLoading,
  onAppointmentPress,
  emptyMessage = 'No hay citas en esta categoría',
}: AppointmentListProps) {
  if (isLoading) {
    return (
      <View className="px-4 py-3 gap-3">
        <Skeleton className="h-28" variant="rectangular" />
        <Skeleton className="h-28" variant="rectangular" />
        <Skeleton className="h-28" variant="rectangular" />
      </View>
    );
  }

  if (appointments.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 mt-4 text-center text-base">
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={appointments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="px-4 mb-3">
          <AppointmentCard
            appointment={item}
            onPress={() => onAppointmentPress(item)}
          />
        </View>
      )}
      contentContainerStyle={{ paddingVertical: 12 }}
    />
  );
}
