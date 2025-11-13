import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationsService } from '@mobile/services/api';
import type { Medication } from '@mobile/types';

export function useMedications(userId: string) {
  const queryClient = useQueryClient();

  // Obtener todos los medicamentos
  const medications = useQuery({
    queryKey: ['medications', userId],
    queryFn: () => medicationsService.getAll(userId),
    enabled: !!userId,
  });

  // Obtener medicamentos activos
  const active = useQuery({
    queryKey: ['medications', 'active', userId],
    queryFn: () => medicationsService.getActive(userId, 3),
    enabled: !!userId,
  });

  // Obtener estadísticas
  const stats = useQuery({
    queryKey: ['medications', 'stats', userId],
    queryFn: () => medicationsService.getStats(userId),
    enabled: !!userId,
  });

  // Mutación para crear medicamento
  const createMutation = useMutation({
    mutationFn: medicationsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  // Mutación para actualizar medicamento
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Medication> }) =>
      medicationsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  // Mutación para desactivar medicamento
  const deactivateMutation = useMutation({
    mutationFn: medicationsService.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  // Mutación para eliminar medicamento
  const deleteMutation = useMutation({
    mutationFn: medicationsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  return {
    // Datos
    medications: medications.data,
    active: active.data,
    stats: stats.data,

    // Estados de carga
    isLoading: medications.isLoading || active.isLoading || stats.isLoading,
    isError: medications.isError || active.isError || stats.isError,
    error: medications.error || active.error || stats.error,

    // Mutaciones
    create: createMutation.mutate,
    update: updateMutation.mutate,
    deactivate: deactivateMutation.mutate,
    delete: deleteMutation.mutate,

    // Estados de mutaciones
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Refetch manual
    refetch: () => {
      medications.refetch();
      active.refetch();
      stats.refetch();
    },
  };
}

/**
 * Hook para obtener un medicamento específico por ID
 */
export function useMedication(id: string) {
  return useQuery({
    queryKey: ['medication', id],
    queryFn: () => medicationsService.getById(id),
    enabled: !!id,
  });
}
