/**
 * Selector de doctor
 */

import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Doctor } from '@mobile/types/doctor';
import { Avatar } from '@mobile/components/ui';

interface DoctorSelectorProps {
  doctor?: Doctor | null;
  onPress: () => void;
  label?: string;
  error?: string;
}

export function DoctorSelector({ 
  doctor, 
  onPress, 
  label = 'Doctor',
  error 
}: DoctorSelectorProps) {
  return (
    <View>
      {label && (
        <Text className="text-gray-700 font-medium mb-2">{label}</Text>
      )}
      
      <Pressable
        onPress={onPress}
        className={`
          bg-white border rounded-lg p-4 flex-row items-center justify-between
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      >
        {doctor ? (
          <View className="flex-row items-center flex-1">
            <Avatar
              source={doctor.foto_url ? { uri: doctor.foto_url } : undefined}
              fallback={`${doctor.nombre} ${doctor.apellido}`}
              size="md"
            />
            <View className="ml-3 flex-1">
              <Text className="text-gray-900 font-semibold">
                Dr. {doctor.nombre} {doctor.apellido}
              </Text>
              <Text className="text-gray-500 text-sm">{doctor.especialidad}</Text>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
              <Ionicons name="person-outline" size={20} color="#9CA3AF" />
            </View>
            <Text className="ml-3 text-gray-400">Seleccionar doctor</Text>
          </View>
        )}
        
        <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" />
      </Pressable>

      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}
