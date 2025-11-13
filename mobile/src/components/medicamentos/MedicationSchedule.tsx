/**
 * Componente de horario de medicamento
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@mobile/components/ui';

interface MedicationScheduleProps {
  frecuencia: string;
  horarios: string[];
  duracion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export function MedicationSchedule({ 
  frecuencia, 
  horarios, 
  duracion,
  fecha_inicio,
  fecha_fin,
}: MedicationScheduleProps) {
  return (
    <View className="bg-white rounded-lg p-4">
      <Text className="text-lg font-semibold text-gray-900 mb-3">
        Horario de Toma
      </Text>

      {/* Frecuencia */}
      <View className="flex-row items-center py-3 border-b border-gray-100">
        <Ionicons name="time-outline" size={20} color="#6B7280" />
        <View className="ml-3 flex-1">
          <Text className="text-gray-500 text-sm">Frecuencia</Text>
          <Text className="text-gray-900 font-medium">{frecuencia}</Text>
        </View>
      </View>

      {/* Horarios */}
      {horarios && horarios.length > 0 && (
        <View className="py-3 border-b border-gray-100">
          <Text className="text-gray-500 text-sm mb-2">Horarios</Text>
          <View className="flex-row flex-wrap gap-2">
            {horarios.map((hora, index) => (
              <Badge key={index} variant="info">
                {hora}
              </Badge>
            ))}
          </View>
        </View>
      )}

      {/* Duración */}
      {duracion && (
        <View className="flex-row items-center py-3 border-b border-gray-100">
          <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          <View className="ml-3 flex-1">
            <Text className="text-gray-500 text-sm">Duración</Text>
            <Text className="text-gray-900 font-medium">{duracion}</Text>
          </View>
        </View>
      )}

      {/* Fechas */}
      {(fecha_inicio || fecha_fin) && (
        <View className="py-3">
          <Text className="text-gray-500 text-sm mb-1">Período</Text>
          <Text className="text-gray-900">
            {fecha_inicio && `Desde: ${new Date(fecha_inicio).toLocaleDateString()}`}
            {fecha_inicio && fecha_fin && ' - '}
            {fecha_fin && `Hasta: ${new Date(fecha_fin).toLocaleDateString()}`}
          </Text>
        </View>
      )}
    </View>
  );
}
