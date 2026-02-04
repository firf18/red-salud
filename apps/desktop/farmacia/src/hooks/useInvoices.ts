import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InvoicesService } from '@/services/invoices.service';
import type { CreateInvoiceInput } from '@/types/invoice.types';

export function useInvoices(filters?: {
  startDate?: string;
  endDate?: string;
  status?: string;
  warehouseId?: string;
}) {
  const queryClient = useQueryClient();

  // Get all invoices
  const {
    data: invoices,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => InvoicesService.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get today's sales
  const {
    data: todaySales,
    isLoading: isLoadingTodaySales,
  } = useQuery({
    queryKey: ['invoices', 'today'],
    queryFn: () => InvoicesService.getTodaySales(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Create invoice mutation
  const createInvoice = useMutation({
    mutationFn: (input: CreateInvoiceInput) => InvoicesService.create(input),
    onSuccess: () => {
      // Invalidate all invoice queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      // Invalidate products to update stock
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    // Data
    invoices: invoices || [],
    todaySales: todaySales || { count: 0, usd: 0, ves: 0 },
    
    // Loading states
    isLoading,
    isLoadingTodaySales,
    
    // Error
    error,
    
    // Actions
    createInvoice: createInvoice.mutateAsync,
    
    // Mutation states
    isCreating: createInvoice.isPending,
    createError: createInvoice.error,
  };
}

/**
 * Hook for getting a single invoice
 */
export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => InvoicesService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook for getting sales by date range
 */
export function useSalesByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['invoices', 'range', startDate, endDate],
    queryFn: () => InvoicesService.getSalesByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}
