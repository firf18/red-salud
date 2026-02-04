import { useQuery } from '@tanstack/react-query';
import { ReportsService } from '@/services/reports.service';

export function useReports() {
  // Get daily sales for last 30 days
  const {
    data: dailySales,
    isLoading: isLoadingDailySales,
  } = useQuery({
    queryKey: ['reports', 'daily-sales'],
    queryFn: () => ReportsService.getDailySales(30),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get top selling products
  const {
    data: topProducts,
    isLoading: isLoadingTopProducts,
  } = useQuery({
    queryKey: ['reports', 'top-products'],
    queryFn: () => ReportsService.getTopSellingProducts(10),
    staleTime: 5 * 60 * 1000,
  });

  // Get inventory valuation
  const {
    data: inventoryValuation,
    isLoading: isLoadingValuation,
  } = useQuery({
    queryKey: ['reports', 'inventory-valuation'],
    queryFn: () => ReportsService.getInventoryValuation(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    // Data
    dailySales: dailySales || [],
    topProducts: topProducts || [],
    inventoryValuation: inventoryValuation || {
      total_units: 0,
      total_cost_usd: 0,
      total_cost_ves: 0,
      total_sale_usd: 0,
      total_sale_ves: 0,
      potential_profit_usd: 0,
      potential_profit_ves: 0,
    },
    
    // Loading states
    isLoadingDailySales,
    isLoadingTopProducts,
    isLoadingValuation,
  };
}

/**
 * Hook for sales summary by date range
 */
export function useSalesSummary(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['reports', 'sales-summary', startDate, endDate],
    queryFn: () => ReportsService.getSalesSummary(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for sales by date range
 */
export function useSalesByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['reports', 'sales-by-date', startDate, endDate],
    queryFn: () => ReportsService.getSalesByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000,
  });
}
