/**
 * Componente de filtros para medicamentos
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';

type FilterType = 'activos' | 'todos' | 'inactivos';

interface MedicationFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts?: {
    activos: number;
    todos: number;
    inactivos: number;
  };
}

const filters: { key: FilterType; label: string }[] = [
  { key: 'activos', label: 'Activos' },
  { key: 'todos', label: 'Todos' },
  { key: 'inactivos', label: 'Inactivos' },
];

export function MedicationFilters({ 
  activeFilter, 
  onFilterChange, 
  counts 
}: MedicationFiltersProps) {
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
                ? 'bg-purple-600 border-purple-600' 
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
