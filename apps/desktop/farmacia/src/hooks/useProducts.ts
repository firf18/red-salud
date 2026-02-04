import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductsService } from '@/services/products.service';
import type { Product } from '@/types/product.types';

export function useProducts() {
  const queryClient = useQueryClient();

  // Get all products
  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: () => ProductsService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get products with low stock
  const {
    data: lowStockProducts,
    isLoading: isLoadingLowStock,
  } = useQuery({
    queryKey: ['products', 'low-stock'],
    queryFn: () => ProductsService.getLowStock(),
    staleTime: 5 * 60 * 1000,
  });

  // Get products expiring soon
  const {
    data: expiringProducts,
    isLoading: isLoadingExpiring,
  } = useQuery({
    queryKey: ['products', 'expiring'],
    queryFn: () => ProductsService.getExpiringSoon(30),
    staleTime: 5 * 60 * 1000,
  });

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: (product: Partial<Product>) => ProductsService.create(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      ProductsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Delete product mutation
  const deleteProduct = useMutation({
    mutationFn: (id: string) => ProductsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    // Data
    products: products || [],
    lowStockProducts: lowStockProducts || [],
    expiringProducts: expiringProducts || [],
    
    // Loading states
    isLoading,
    isLoadingLowStock,
    isLoadingExpiring,
    
    // Error
    error,
    
    // Actions
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Mutation states
    isCreating: createProduct.isPending,
    isUpdating: updateProduct.isPending,
    isDeleting: deleteProduct.isPending,
  };
}

/**
 * Hook for searching products
 */
export function useProductSearch(query: string) {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => ProductsService.search(query),
    enabled: query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook for getting a single product
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => ProductsService.getById(id),
    enabled: !!id,
  });
}
