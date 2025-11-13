import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@mobile/providers/AuthProvider';
import { useAppointments } from '@mobile/hooks';
import { AppointmentFilters, AppointmentList } from '@mobile/components/citas';
import type { Appointment } from '@mobile/types';

type FilterType = 'todas' | 'proximas' | 'pasadas' | 'canceladas';

export default function CitasPaciente() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<FilterType>('proximas');

  const { appointments, isLoading } = useAppointments(user?.id!);

  // Filtrar citas según el filtro activo
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];

    const now = new Date();

    switch (activeFilter) {
      case 'proximas':
        return appointments.filter(
          (apt) => new Date(apt.fecha_hora) >= now && apt.status !== 'cancelada'
        );
      case 'pasadas':
        return appointments.filter(
          (apt) => new Date(apt.fecha_hora) < now && apt.status !== 'cancelada'
        );
      case 'canceladas':
        return appointments.filter((apt) => apt.status === 'cancelada');
      case 'todas':
      default:
        return appointments;
    }
  }, [all, activeFilter]);

  // Contar citas por categoría
  const counts = useMemo(() => {
    if (!appointments) return { todas: 0, proximas: 0, pasadas: 0, canceladas: 0 };

    const now = new Date();
    return {
      todas: appointments.length,
      proximas: appointments.filter(
        (apt) => new Date(apt.fecha_hora) >= now && apt.status !== 'cancelada'
      ).length,
      pasadas: appointments.filter(
        (apt) => new Date(apt.fecha_hora) < now && apt.status !== 'cancelada'
      ).length,
      canceladas: appointments.filter((apt) => apt.status === 'cancelada').length,
    };
  }, [all]);

  const handleAppointmentPress = (appointment: Appointment) => {
    router.push(`/(tabs)/paciente/citas/${appointment.id}`);
  };

  const getEmptyMessage = () => {
    switch (activeFilter) {
      case 'proximas':
        return 'No tienes citas próximas';
      case 'pasadas':
        return 'No tienes citas pasadas';
      case 'canceladas':
        return 'No tienes citas canceladas';
      default:
        return 'No tienes citas registradas';
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <AppointmentFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={counts}
      />

      <AppointmentList
        appointments={filteredAppointments}
        isLoading={isLoading}
        onAppointmentPress={handleAppointmentPress}
        emptyMessage={getEmptyMessage()}
      />
    </View>
  );
}
