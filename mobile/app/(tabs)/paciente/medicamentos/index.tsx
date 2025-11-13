import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@mobile/providers/AuthProvider';
import { useMedications } from '@mobile/hooks';
import { MedicationFilters, MedicationList } from '@mobile/components/medicamentos';
import type { Medication } from '@mobile/types';

type FilterType = 'activos' | 'todos' | 'inactivos';

export default function Medicamentos() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('activos');

  const { medications, isLoading } = useMedications(user?.id!);

  // Filtrar medicamentos según el filtro activo
  const filteredMedications = useMemo(() => {
    if (!medications) return [];

    switch (activeFilter) {
      case 'activos':
        return medications.filter((med) => med.activo);
      case 'inactivos':
        return medications.filter((med) => !med.activo);
      case 'todos':
      default:
        return medications;
    }
  }, [all, activeFilter]);

  // Contar medicamentos por categoría
  const counts = useMemo(() => {
    if (!medications) return { activos: 0, todos: 0, inactivos: 0 };

    return {
      todos: medications.length,
      activos: medications.filter((med) => med.activo).length,
      inactivos: medications.filter((med) => !med.activo).length,
    };
  }, [all]);

  const handleMedicationPress = (medication: Medication) => {
    router.push(`/(tabs)/paciente/medicamentos/${medication.id}`);
  };

  const getEmptyMessage = () => {
    switch (activeFilter) {
      case 'activos':
        return 'No tienes medicamentos activos';
      case 'inactivos':
        return 'No tienes medicamentos inactivos';
      default:
        return 'No tienes medicamentos registrados';
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <MedicationFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />

      <MedicationList
        medications={filteredMedications}
        isLoading={isLoading}
        onMedicationPress={handleMedicationPress}
        emptyMessage={getEmptyMessage()}
      />
    </View>
  );
}
