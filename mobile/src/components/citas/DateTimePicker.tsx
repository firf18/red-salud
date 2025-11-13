/**
 * Selector de fecha y hora
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateTimePickerProps {
  date?: Date;
  onPress: () => void;
  label?: string;
  error?: string;
  mode?: 'date' | 'time' | 'datetime';
  placeholder?: string;
}

export function DateTimePickerComponent({ 
  date, 
  onPress,
  label,
  error,
  mode = 'date',
  placeholder,
}: DateTimePickerProps) {
  const getDisplayText = () => {
    if (!date) {
      if (placeholder) return placeholder;
      if (mode === 'date') return 'Seleccionar fecha';
      if (mode === 'time') return 'Seleccionar hora';
      return 'Seleccionar fecha y hora';
    }

    if (mode === 'date') {
      return format(date, "d 'de' MMMM, yyyy", { locale: es });
    }
    if (mode === 'time') {
      return format(date, 'HH:mm');
    }
    return format(date, "d 'de' MMMM, yyyy - HH:mm", { locale: es });
  };

  const Icon = (props: any) => (
    <Ionicons
      name={mode === 'time' ? 'time-outline' : 'calendar-outline'}
      {...props}
    />
  );

  return (
    <View>
      {label && (
        <Text className="text-gray-700 font-medium mb-2">{label}</Text>
      )}
      
      <Pressable
        onPress={onPress}
        className={`
          bg-white border rounded-lg p-4 flex-row items-center
          ${error ? 'border-red-500' : 'border-gray-300'}
        `}
      >
        <Icon size={20} color={date ? '#1F2937' : '#9CA3AF'} />
        <Text className={`ml-3 flex-1 ${date ? 'text-gray-900' : 'text-gray-400'}`}>
          {getDisplayText()}
        </Text>
      </Pressable>

      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}
