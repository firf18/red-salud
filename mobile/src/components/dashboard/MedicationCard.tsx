import React from 'react';
import { View, Text } from 'react-native';
import type { Medication } from '@mobile/types';
import { Badge } from '../ui/Badge';

interface MedicationCardProps {
  medication: Medication;
  onPress?: () => void;
}

export function MedicationCard({ medication }: MedicationCardProps) {
  const horariosToShow = medication.horarios?.slice(0, 3) || [];

  return (
    <View className="bg-orange-50 p-3 rounded-lg border border-orange-200">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 bg-orange-100 rounded-lg items-center justify-center shrink-0">
          <Text className="text-lg">💊</Text>
        </View>
        
        <View className="flex-1">
          <Text className="font-medium text-gray-900 text-sm">
            {medication.nombre_medicamento}
          </Text>
          <Text className="text-xs text-gray-600">{medication.dosis}</Text>
          
          <View className="flex-row flex-wrap gap-1 mt-2">
            {horariosToShow.map((hora, idx) => (
              <Badge key={idx} variant="default">
                {hora}
              </Badge>
            ))}
            {medication.horarios && medication.horarios.length > 3 && (
              <Badge variant="default">
                +{medication.horarios.length - 3}
              </Badge>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
