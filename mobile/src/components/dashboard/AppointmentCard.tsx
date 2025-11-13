import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '@mobile/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
}

export function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const fechaHora = new Date(appointment.fecha_hora);
  const isConfirmed = appointment.status === 'confirmada';

  return (
    <Pressable
      onPress={onPress}
      className="bg-blue-50 p-4 rounded-lg border border-blue-200 active:bg-blue-100"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="font-semibold text-gray-900 flex-1 pr-2">
          {appointment.motivo || 'Consulta Médica'}
        </Text>
        <Badge variant={isConfirmed ? 'success' : 'warning'}>
          {isConfirmed ? 'Confirmada' : 'Pendiente'}
        </Badge>
      </View>
      
      <Text className="text-sm text-gray-600 mb-1">
        Dr. {appointment.doctor?.nombre_completo || 'Por asignar'}
      </Text>
      
      <Text className="text-sm text-gray-500">
        ⏰ {format(fechaHora, "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}
      </Text>

      {appointment.ubicacion && (
        <Text className="text-xs text-gray-500 mt-1">
          📍 {appointment.ubicacion}
        </Text>
      )}
    </Pressable>
  );
}
