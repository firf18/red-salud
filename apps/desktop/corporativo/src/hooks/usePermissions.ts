import { useAuthStore } from '@/store/authStore';
import type { Profile, Permissions } from '@/types';

export function usePermissions() {
    const profile = useAuthStore(state => state.profile) as Profile | null;

    /**
     * Checks if the user has a specific power level.
     * @param level Minimum power level required (1-5)
     */
    const hasAccessLevel = (level: number) => {
        if (!profile) return false;
        // Super Admin Bypass: role 'admin' or level 5 access everything
        if (profile.role === 'admin' || profile.access_level === 5) return true;
        return (profile.access_level || 1) >= level;
    };

    /**
     * Checks if the user has a specific tactical permission.
     * @param permission Key of the permission to check
     */
    const hasPermission = (permission: keyof Permissions) => {
        if (!profile) return false;
        // Level 5 Root or admin access has all permissions
        if (profile.role === 'admin' || profile.access_level === 5) return true;
        return !!profile.permissions?.[permission];
    };

    /**
     * Checks if the user can perform an action based on role or permissions.
     */
    const canPerformAction = (action: keyof Permissions, minLevel: number = 2) => {
        return hasPermission(action) || hasAccessLevel(minLevel);
    };

    return {
        profile,
        hasAccessLevel,
        hasPermission,
        canPerformAction,
        isRoot: profile?.access_level === 5,
        accessLevel: profile?.access_level || 1
    };
}
