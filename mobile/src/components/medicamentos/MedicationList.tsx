/**
 * Componente de lista de medicamentos
 */

import React from 'react';
import { View, FlatList, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MedicationCard } from '@mobile/components/dashboard';
import { Skeleton } from '@mobile/components/ui';
import type { Medication } from '@mobile/types';

interface MedicationListProps {
  medications: Medication[];
  isLoading: boolean;
  onMedicationPress: (medication: Medication) => void;
  emptyMessage?: string;
}

export function MedicationList({
  medications,
  isLoading,
  onMedicationPress,
  emptyMessage = 'No hay medicamentos en esta categoría',
}: MedicationListProps) {
  if (isLoading) {
    return (
      <View className="px-4 py-3 gap-3">
        <Skeleton className="h-24" variant="rectangular" />
        <Skeleton className="h-24" variant="rectangular" />
        <Skeleton className="h-24" variant="rectangular" />
      </View>
    );
  }

  if (medications.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-12">
        <Ionicons name="medkit-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 mt-4 text-center text-base">
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={medications}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="px-4 mb-3">
          <MedicationCard
            medication={item}
            onPress={() => onMedicationPress(item)}
          />
        </View>
      )}
      contentContainerStyle={{ paddingVertical: 12 }}
    />
  );
}
