/**
 * Componente de filtros para citas
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';

type FilterType = 'todas' | 'proximas' | 'pasadas' | 'canceladas';

interface AppointmentFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts?: {
    todas: number;
    proximas: number;
    pasadas: number;
    canceladas: number;
  };
}

const filters: { key: FilterType; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'proximas', label: 'Próximas' },
  { key: 'pasadas', label: 'Pasadas' },
  { key: 'canceladas', label: 'Canceladas' },
];

export function AppointmentFilters({ 
  activeFilter, 
  onFilterChange, 
  counts 
}: AppointmentFiltersProps) {
  return (
    <View className="flex-row gap-2 px-4 py-3 bg-white border-b border-gray-100">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        const count = counts?.[filter.key];
        
        return (
          <Pressable
            key={filter.key}
            onPress={() => onFilterChange(filter.key)}
            className={`
              px-4 py-2 rounded-full border
              ${isActive 
                ? 'bg-blue-600 border-blue-600' 
                : 'bg-white border-gray-300'
              }
            `}
          >
            <Text
              className={`
                font-medium
                ${isActive ? 'text-white' : 'text-gray-700'}
              `}
            >
              {filter.label}
              {count !== undefined && ` (${count})`}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
