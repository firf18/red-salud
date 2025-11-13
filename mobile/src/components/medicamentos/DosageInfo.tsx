/**
 * Componente de información de dosis
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DosageInfoProps {
  dosis: string;
  unidad?: string;
  via_administracion?: string;
  instrucciones?: string;
  efectos_secundarios?: string;
}

export function DosageInfo({ 
  dosis, 
  unidad,
  via_administracion,
  instrucciones,
  efectos_secundarios,
}: DosageInfoProps) {
  return (
    <View className="bg-white rounded-lg p-4">
      <Text className="text-lg font-semibold text-gray-900 mb-3">
        Información de Dosis
      </Text>

      {/* Dosis */}
      <View className="flex-row items-center py-3 border-b border-gray-100">
        <Ionicons name="medkit-outline" size={20} color="#6B7280" />
        <View className="ml-3 flex-1">
          <Text className="text-gray-500 text-sm">Dosis</Text>
          <Text className="text-gray-900 font-medium">
            {dosis} {unidad || ''}
          </Text>
        </View>
      </View>

      {/* Vía de administración */}
      {via_administracion && (
        <View className="flex-row items-center py-3 border-b border-gray-100">
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <View className="ml-3 flex-1">
            <Text className="text-gray-500 text-sm">Vía de Administración</Text>
            <Text className="text-gray-900 font-medium">{via_administracion}</Text>
          </View>
        </View>
      )}

      {/* Instrucciones */}
      {instrucciones && (
        <View className="py-3 border-b border-gray-100">
          <View className="flex-row items-start">
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
            <View className="ml-3 flex-1">
              <Text className="text-gray-500 text-sm mb-1">Instrucciones</Text>
              <Text className="text-gray-900">{instrucciones}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Efectos secundarios */}
      {efectos_secundarios && (
        <View className="py-3">
          <View className="flex-row items-start">
            <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
            <View className="ml-3 flex-1">
              <Text className="text-gray-500 text-sm mb-1">
                Posibles Efectos Secundarios
              </Text>
              <Text className="text-gray-700">{efectos_secundarios}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
