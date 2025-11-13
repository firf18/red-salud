import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsService } from '@mobile/services/api';
import type { Appointment } from '@mobile/types';

export function useAppointments(userId: string) {
  const queryClient = useQueryClient();

  // Obtener todas las citas
  const appointments = useQuery({
    queryKey: ['appointments', userId],
    queryFn: () => appointmentsService.getAll(userId),
    enabled: !!userId,
  });

  // Obtener próximas citas
  const upcoming = useQuery({
    queryKey: ['appointments', 'upcoming', userId],
    queryFn: () => appointmentsService.getUpcoming(userId),
    enabled: !!userId,
  });

  // Obtener estadísticas
  const stats = useQuery({
    queryKey: ['appointments', 'stats', userId],
    queryFn: () => appointmentsService.getStats(userId),
    enabled: !!userId,
  });

  // Mutación para crear cita
  const createMutation = useMutation({
    mutationFn: appointmentsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  // Mutación para cancelar cita
  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentsService.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  // Mutación para actualizar cita
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Appointment> }) =>
      appointmentsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  return {
    // Datos
    appointments: appointments.data,
    upcoming: upcoming.data,
    stats: stats.data,

    // Estados de carga
    isLoading: appointments.isLoading || upcoming.isLoading || stats.isLoading,
    isError: appointments.isError || upcoming.isError || stats.isError,
    error: appointments.error || upcoming.error || stats.error,

    // Mutaciones
    create: createMutation.mutate,
    cancel: cancelMutation.mutate,
    update: updateMutation.mutate,

    // Estados de mutaciones
    isCreating: createMutation.isPending,
    isCanceling: cancelMutation.isPending,
    isUpdating: updateMutation.isPending,

    // Refetch manual
    refetch: () => {
      appointments.refetch();
      upcoming.refetch();
      stats.refetch();
    },
  };
}

/**
 * Hook para obtener una cita específica por ID
 */
export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => appointmentsService.getById(id),
    enabled: !!id,
  });
}
