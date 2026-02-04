/**
 * Hooks de React Query para Recetas Médicas
 * Gestiona el estado y caché de recetas con auto-refresh
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriptionsService, Prescription, PrescriptionFilters } from '@/services/prescriptions.service';
import { toast } from 'sonner';

/**
 * Hook para obtener todas las recetas con filtros
 */
export function usePrescriptions(filters?: PrescriptionFilters) {
  return useQuery({
    queryKey: ['prescriptions', filters],
    queryFn: () => prescriptionsService.getAll(filters),
    refetchInterval: 30000, // Refetch cada 30 segundos
    staleTime: 10000, // Considerar datos frescos por 10 segundos
  });
}

/**
 * Hook para obtener una receta específica por ID
 */
export function usePrescription(id: string) {
  return useQuery({
    queryKey: ['prescription', id],
    queryFn: () => prescriptionsService.getById(id),
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 5000,
  });
}

/**
 * Hook para obtener estadísticas de recetas
 */
export function usePrescriptionStats() {
  return useQuery({
    queryKey: ['prescription-stats'],
    queryFn: () => prescriptionsService.getStats(),
    refetchInterval: 60000, // Refetch cada minuto
    staleTime: 30000,
  });
}

/**
 * Hook para crear una nueva receta
 */
export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>) =>
      prescriptionsService.create(prescription),
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['prescription-stats'] });
      toast.success('Receta creada exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error creating prescription:', error);
      toast.error(`Error al crear receta: ${error.message}`);
    },
  });
}

/**
 * Hook para dispensar una receta
 */
export function useDispensePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      items,
    }: {
      id: string;
      items: Array<{ id: string; dispensed_quantity: number }>;
    }) => prescriptionsService.dispense(id, items),
    onSuccess: (data) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['prescription', data.id] });
      queryClient.invalidateQueries({ queryKey: ['prescription-stats'] });
      toast.success('Receta dispensada exitosamente');
    },
    onError: (error: Error) => {
      console.error('Error dispensing prescription:', error);
      toast.error(`Error al dispensar receta: ${error.message}`);
    },
  });
}

/**
 * Hook para cancelar una receta
 */
export function useCancelPrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      prescriptionsService.cancel(id, reason),
    onSuccess: (data) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['prescription', data.id] });
      queryClient.invalidateQueries({ queryKey: ['prescription-stats'] });
      toast.success('Receta cancelada');
    },
    onError: (error: Error) => {
      console.error('Error cancelling prescription:', error);
      toast.error(`Error al cancelar receta: ${error.message}`);
    },
  });
}
