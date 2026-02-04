import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types/user.types';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

export function PrivateRoute({ children, requiredRoles }: PrivateRouteProps) {
  const { isAuthenticated, hasRole } = useAuthStore();

  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">
            Acceso Denegado
          </h1>
          <p className="text-muted-foreground mb-4">
            No tienes permisos para acceder a esta página
          </p>
          <button
            onClick={() => window.history.back()}
            className="text-primary hover:underline"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
