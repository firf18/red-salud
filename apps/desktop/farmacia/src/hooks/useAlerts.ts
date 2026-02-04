import { useQuery } from '@tanstack/react-query';
import { AlertsService } from '@/services/alerts.service';
import type { AlertType, AlertPriority } from '@/services/alerts.service';

export function useAlerts() {
  // Get all active alerts
  const {
    data: alerts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => AlertsService.getActive(),
    staleTime: 1 * 60 * 1000, // 1 minute (alerts should be fresh)
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Get alert counts
  const {
    data: counts,
    isLoading: isLoadingCounts,
  } = useQuery({
    queryKey: ['alerts', 'counts'],
    queryFn: () => AlertsService.getCounts(),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  return {
    // Data
    alerts: alerts || [],
    counts: counts || {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      by_type: {
        low_stock: 0,
        out_of_stock: 0,
        expiring_soon: 0,
        expired: 0,
      },
    },
    
    // Loading states
    isLoading,
    isLoadingCounts,
    
    // Error
    error,
    
    // Actions
    refetch,
  };
}

/**
 * Hook for getting alerts by type
 */
export function useAlertsByType(type: AlertType) {
  return useQuery({
    queryKey: ['alerts', 'type', type],
    queryFn: () => AlertsService.getByType(type),
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook for getting alerts by priority
 */
export function useAlertsByPriority(priority: AlertPriority) {
  return useQuery({
    queryKey: ['alerts', 'priority', priority],
    queryFn: () => AlertsService.getByPriority(priority),
    staleTime: 1 * 60 * 1000,
  });
}
