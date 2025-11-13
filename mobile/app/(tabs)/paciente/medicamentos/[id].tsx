import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@mobile/providers/AuthProvider';
import { useMedication, useMedications } from '@mobile/hooks';
import { Badge, Button, Modal, Skeleton } from '@mobile/components/ui';
import { MedicationSchedule, DosageInfo } from '@mobile/components/medicamentos';

export default function MedicamentoDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: medication, isLoading } = useMedication(id);
  const { deactivate, delete: deleteMed } = useMedications(user?.id!);

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync(id!);
      setShowDeactivateModal(false);
      Alert.alert(
        'Medicamento Desactivado',
        'El medicamento ha sido desactivado exitosamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo desactivar el medicamento. Intenta nuevamente.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id!);
      setShowDeleteModal(false);
      Alert.alert(
        'Medicamento Eliminado',
        'El medicamento ha sido eliminado exitosamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el medicamento. Intenta nuevamente.');
    }
  };

  if (isLoading) {
    return (
      <ScrollView className="flex-1 bg-gray-50">
        <View className="bg-white p-4 mb-2">
          <Skeleton className="h-8 w-48 mb-4" variant="rectangular" />
          <Skeleton className="h-6 w-full mb-2" variant="rectangular" />
          <Skeleton className="h-6 w-3/4" variant="rectangular" />
        </View>
        <View className="bg-white p-4 mb-2">
          <Skeleton className="h-32" variant="rectangular" />
        </View>
      </ScrollView>
    );
  }

  if (!medication) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center p-4">
        <Text className="text-gray-500 text-center">Medicamento no encontrado</Text>
        <Button title="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <>
      <ScrollView className="flex-1 bg-gray-50">
        {/* Header con nombre y estado */}
        <View className="bg-white p-4 mb-2">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Pill size={24} color="#8B5CF6" />
                <Text className="text-2xl font-bold text-gray-900 flex-1">
                  {medication.nombre}
                </Text>
              </View>
              <Text className="text-gray-600 text-base">
                {medication.dosis} {medication.unidad || ''}
              </Text>
            </View>
            <Badge variant={medication.activo ? 'success' : 'default'}>
              {medication.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </View>
        </View>

        {/* Información de dosis */}
        <View className="mb-2">
          <DosageInfo
            dosis={medication.dosis}
            unidad={medication.unidad}
            via_administracion={medication.via_administracion}
            instrucciones={medication.instrucciones}
            efectos_secundarios={medication.efectos_secundarios}
          />
        </View>

        {/* Horario de toma */}
        {medication.frecuencia && (
          <View className="mb-2">
            <MedicationSchedule
              frecuencia={medication.frecuencia}
              horarios={medication.horarios || []}
              duracion={medication.duracion}
              fecha_inicio={medication.fecha_inicio}
              fecha_fin={medication.fecha_fin}
            />
          </View>
        )}

        {/* Recordatorios */}
        <View className="bg-white rounded-lg p-4 mb-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Bell size={20} color="#6B7280" />
              <View className="ml-3">
                <Text className="text-gray-900 font-medium">Recordatorios</Text>
                <Text className="text-gray-500 text-sm">
                  {medication.recordatorios_activos 
                    ? 'Activados' 
                    : 'Desactivados'}
                </Text>
              </View>
            </View>
            <Badge variant={medication.recordatorios_activos ? 'info' : 'default'}>
              {medication.recordatorios_activos ? 'ON' : 'OFF'}
            </Badge>
          </View>
        </View>

        {/* Notas adicionales */}
        {medication.notas && (
          <View className="bg-white rounded-lg p-4 mb-2">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Notas Adicionales
            </Text>
            <Text className="text-gray-700">{medication.notas}</Text>
          </View>
        )}

        {/* Información del médico */}
        {medication.medico_nombre && (
          <View className="bg-white rounded-lg p-4 mb-2">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Prescrito por
            </Text>
            <Text className="text-gray-700">
              Dr. {medication.medico_nombre}
            </Text>
            {medication.fecha_prescripcion && (
              <Text className="text-gray-500 text-sm mt-1">
                Fecha: {new Date(medication.fecha_prescripcion).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {/* Acciones */}
        {medication.activo && (
          <View className="p-4 gap-3">
            <Button
              title="Desactivar Medicamento"
              onPress={() => setShowDeactivateModal(true)}
              variant="ghost"
              className="border-orange-500"
            >
              <BellOff size={20} color="#F97316" />
            </Button>

            <Button
              title="Eliminar Medicamento"
              onPress={() => setShowDeleteModal(true)}
              variant="ghost"
              className="border-red-500"
            >
              <Trash2 size={20} color="#EF4444" />
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Modal de confirmación de desactivación */}
      <Modal
        visible={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Desactivar Medicamento"
      >
        <View className="p-4">
          <Text className="text-gray-700 mb-4">
            ¿Deseas desactivar este medicamento?
          </Text>
          <Text className="text-gray-500 text-sm mb-6">
            El medicamento permanecerá en tu historial pero dejará de aparecer en la lista de activos.
          </Text>

          <View className="gap-3">
            <Button
              title="Sí, Desactivar"
              onPress={handleDeactivate}
              variant="primary"
              disabled={deactivateMutation.isPending}
            />
            <Button
              title="Cancelar"
              onPress={() => setShowDeactivateModal(false)}
              variant="ghost"
            />
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar Medicamento"
      >
        <View className="p-4">
          <Text className="text-gray-700 mb-4">
            ¿Estás seguro de que deseas eliminar este medicamento?
          </Text>
          <Text className="text-red-600 text-sm mb-6">
            Esta acción no se puede deshacer y el medicamento será eliminado permanentemente.
          </Text>

          <View className="gap-3">
            <Button
              title="Sí, Eliminar"
              onPress={handleDelete}
              variant="primary"
              disabled={deleteMutation.isPending}
            />
            <Button
              title="Cancelar"
              onPress={() => setShowDeleteModal(false)}
              variant="ghost"
            />
          </View>
        </View>
      </Modal>
    </>
  );
}
