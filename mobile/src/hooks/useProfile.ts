import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@mobile/services/api';
import type { Profile } from '@mobile/types';

export function useProfile(userId?: string) {
  const queryClient = useQueryClient();

  // Obtener perfil básico
  const profile = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileService.getBasic(userId!),
    enabled: !!userId,
  });

  // Mutación para actualizar perfil
  const updateMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<Profile> }) =>
      profileService.update(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Mutación para actualizar avatar
  const updateAvatarMutation = useMutation({
    mutationFn: ({ userId, avatarUrl }: { userId: string; avatarUrl: string }) =>
      profileService.updateAvatar(userId, avatarUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    // Datos
    data: profile.data,

    // Estados de carga
    isLoading: profile.isLoading,
    isError: profile.isError,
    error: profile.error,

    // Mutaciones
    update: updateMutation.mutate,
    updateAvatar: updateAvatarMutation.mutate,

    // Estados de mutaciones
    isUpdating: updateMutation.isPending,
    isUpdatingAvatar: updateAvatarMutation.isPending,

    // Refetch manual
    refetch: profile.refetch,
  };
}

/**
 * Hook para obtener perfil completo
 */
export function useFullProfile(userId?: string) {
  return useQuery({
    queryKey: ['profile', 'full', userId],
    queryFn: () => profileService.getFull(userId!),
    enabled: !!userId,
  });
}
