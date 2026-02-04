import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BatchesService } from '@/services/batches.service';
import type { Batch } from '@/types/batch.types';

export function useBatches() {
  const queryClient = useQueryClient();

  // Get all batches
  const {
    data: batches,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['batches'],
    queryFn: () => BatchesService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get expiring batches
  const {
    data: expiringBatches,
    isLoading: isLoadingExpiring,
  } = useQuery({
    queryKey: ['batches', 'expiring'],
    queryFn: () => BatchesService.getExpiringSoon(30),
    staleTime: 5 * 60 * 1000,
  });

  // Get expired batches
  const {
    data: expiredBatches,
    isLoading: isLoadingExpired,
  } = useQuery({
    queryKey: ['batches', 'expired'],
    queryFn: () => BatchesService.getExpired(),
    staleTime: 5 * 60 * 1000,
  });

  // Create batch mutation
  const createBatch = useMutation({
    mutationFn: (batch: Partial<Batch>) => BatchesService.create(batch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Update batch mutation
  const updateBatch = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Batch> }) =>
      BatchesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Delete batch mutation
  const deleteBatch = useMutation({
    mutationFn: (id: string) => BatchesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    // Data
    batches: batches || [],
    expiringBatches: expiringBatches || [],
    expiredBatches: expiredBatches || [],
    
    // Loading states
    isLoading,
    isLoadingExpiring,
    isLoadingExpired,
    
    // Error
    error,
    
    // Actions
    refetch,
    createBatch,
    updateBatch,
    deleteBatch,
    
    // Mutation states
    isCreating: createBatch.isPending,
    isUpdating: updateBatch.isPending,
    isDeleting: deleteBatch.isPending,
  };
}

/**
 * Hook for getting batches by product ID
 */
export function useBatchesByProduct(productId: string) {
  return useQuery({
    queryKey: ['batches', 'product', productId],
    queryFn: () => BatchesService.getByProductId(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for getting a single batch
 */
export function useBatch(id: string) {
  return useQuery({
    queryKey: ['batches', id],
    queryFn: () => BatchesService.getById(id),
    enabled: !!id,
  });
}
