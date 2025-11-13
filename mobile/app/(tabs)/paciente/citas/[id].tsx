import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { useAuth } from '@mobile/providers/AuthProvider';
import { useAppointment, useDoctor } from '@mobile/hooks';
import { useAppointments } from '@mobile/hooks';
import { Badge, Button, Modal, Skeleton, Avatar } from '@mobile/components/ui';

export default function CitaDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: appointment, isLoading } = useAppointment(id);
  const { data: doctor } = useDoctor(appointment?.medico_id);
  const { cancel } = useAppointments(user?.id!);

  const handleCancelAppointment = async () => {
    try {
      await cancel(id!);
      setShowCancelModal(false);
      Alert.alert(
        'Cita Cancelada',
        'Tu cita ha sido cancelada exitosamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo cancelar la cita. Intenta nuevamente.');
    }
  };

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-gray-50">
        <View className="bg-white p-4 mb-2">
          <Skeleton className="h-8 w-32 mb-4" variant="rectangular" />
          <Skeleton className="h-6 w-full mb-2" variant="rectangular" />
          <Skeleton className="h-6 w-3/4" variant="rectangular" />
        </View>
        <View className="bg-white p-4">
          <Skeleton className="h-24" variant="rectangular" />
        </View>
      </ScrollView>
    );
  }

  if (!appointment) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-4">
        <Text className="text-gray-500 text-center">Cita no encontrada</Text>
        <Button title="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  const appointmentDate = new Date(appointment.fecha_hora);
  const isPast = appointmentDate < new Date();
  const canCancel = !isPast && appointment.status !== 'cancelada';

  return (
    <>
      <ScrollView className="flex-1 bg-gray-50">
        {/* Header con estado */}
        <View className="bg-white p-4 mb-2">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                {appointment.tipo || 'Consulta General'}
              </Text>
              <Text className="text-gray-600 mt-1">
                {format(appointmentDate, "EEEE, d 'de' MMMM", { locale: es })}
              </Text>
            </View>
            <Badge variant={
              appointment.status === 'confirmada' ? 'success' :
              appointment.status === 'cancelada' ? 'error' :
              appointment.status === 'completada' ? 'info' : 'warning'
            }>
              {appointment.status}
            </Badge>
          </View>
        </View>

        {/* Información del doctor */}
        {doctor && (
          <View className="bg-white p-4 mb-2">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Información del Médico
            </Text>
            
            <View className="flex-row items-center mb-4">
              <Avatar
                source={doctor.foto_url ? { uri: doctor.foto_url } : undefined}
                fallback={`${doctor.nombre} ${doctor.apellido}`}
                size="lg"
              />
              <View className="ml-3 flex-1">
                <Text className="text-gray-900 font-semibold text-lg">
                  Dr. {doctor.nombre} {doctor.apellido}
                </Text>
                <Text className="text-gray-600">{doctor.especialidad}</Text>
                {doctor.cedula_profesional && (
                  <Text className="text-gray-500 text-sm">
                    Cédula: {doctor.cedula_profesional}
                  </Text>
                )}
              </View>
            </View>

            {doctor.telefono && (
              <View className="flex-row items-center py-2">
                <Ionicons name="call-outline" size={20} color="#6B7280" />
                <Text className="text-gray-700 ml-3">{doctor.telefono}</Text>
              </View>
            )}

            {doctor.email && (
              <View className="flex-row items-center py-2">
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <Text className="text-gray-700 ml-3">{doctor.email}</Text>
              </View>
            )}
          </View>
        )}

        {/* Detalles de la cita */}
        <View className="bg-white p-4 mb-2">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Detalles de la Cita
          </Text>

          <View className="flex-row items-center py-3 border-b border-gray-100">
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <View className="ml-3">
              <Text className="text-gray-500 text-sm">Fecha</Text>
              <Text className="text-gray-900 font-medium">
                {format(appointmentDate, "d 'de' MMMM, yyyy", { locale: es })}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center py-3 border-b border-gray-100">
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <View className="ml-3">
              <Text className="text-gray-500 text-sm">Hora</Text>
              <Text className="text-gray-900 font-medium">
                {format(appointmentDate, 'HH:mm')}
              </Text>
            </View>
          </View>

          {appointment.ubicacion && (
            <View className="flex-row items-center py-3 border-b border-gray-100">
              <Ionicons name="location-outline" size={20} color="#6B7280" />
              <View className="ml-3 flex-1">
                <Text className="text-gray-500 text-sm">Ubicación</Text>
                <Text className="text-gray-900 font-medium">
                  {appointment.ubicacion}
                </Text>
              </View>
            </View>
          )}

          {appointment.notas && (
            <View className="flex-row items-start py-3">
            <Ionicons name="document-text-outline" size={20} color="#6B7280" />
              <View className="ml-3 flex-1">
                <Text className="text-gray-500 text-sm">Notas</Text>
                <Text className="text-gray-900 mt-1">{appointment.notas}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Acciones */}
        {canCancel && (
          <View className="p-4">
            <Button
              title="Cancelar Cita"
              onPress={() => setShowCancelModal(true)}
              variant="ghost"
              className="border-red-500"
            >
              <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Modal de confirmación de cancelación */}
      <Modal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelar Cita"
      >
        <View className="p-4">
          <Text className="text-gray-700 mb-4">
            ¿Estás seguro de que deseas cancelar esta cita?
          </Text>
          <Text className="text-gray-500 text-sm mb-6">
            Esta acción no se puede deshacer. Recibirás una confirmación por correo.
          </Text>

          <View className="gap-3">
            <Button
              title="Sí, Cancelar Cita"
              onPress={handleCancelAppointment}
              variant="primary"
              disabled={cancelMutation.isPending}
            />
            <Button
              title="No, Mantener Cita"
              onPress={() => setShowCancelModal(false)}
              variant="ghost"
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
