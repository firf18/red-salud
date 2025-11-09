import { Card } from "@/components/ui/card";
import { ROLE_CONFIG, USER_ROLES, type UserRole } from "@/lib/constants";
import Link from "next/link";
import {
  UserCircle,
  Stethoscope,
  Pill,
  FlaskConical,
  Hospital,
  Shield,
  Ambulance,
} from "lucide-react";

/**
 * Página de selección de rol para Login
 * Similar a /auth/register pero para iniciar sesión
 */

// Mapa de iconos
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UserCircle,
  Stethoscope,
  Pill,
  FlaskConical,
  Hospital,
  Shield,
  Ambulance,
};

export default function LoginPage() {
  const roles = Object.values(USER_ROLES);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50/30 via-white to-blue-50/50 relative">
      {/* Botón de regresar - Posición absoluta */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:-translate-x-1 transition-transform"
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        <span className="text-sm font-medium">Inicio</span>
      </Link>

      {/* Contenido centrado */}
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-6xl py-12">
          {/* Header */}
          <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Iniciar Sesión
          </h1>
          <p className="text-lg text-gray-600">
            Selecciona tu tipo de cuenta para continuar
          </p>
        </div>

        {/* Grid de roles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-8">
          {roles.map((role) => {
            const config = ROLE_CONFIG[role as UserRole];
            const Icon = iconMap[config.icon];

            return (
              <Link key={role} href={`/login/${role}`}>
                <Card className="p-4 sm:p-5 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border-2 hover:border-blue-500 bg-white group">
                  <div className="flex flex-col items-center text-center space-y-3">
                    {/* Icono */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      {Icon && (
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                      )}
                    </div>

                    {/* Nombre del rol */}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {config.label}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        {config.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Footer - Link a registro */}
        <div className="text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
