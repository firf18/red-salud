"use client";

import { useState } from "react";
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PATIENT_MODULE_CONFIG } from "@/lib/constants";
import { signOut } from "@/lib/supabase/auth";
import { UserProfileModal } from "../profile";
import { DiditSidebar } from "./didit-sidebar";
import { DiditMobileSidebar } from "./didit-mobile-sidebar";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  userId?: string;
  userRole?: "paciente" | "medico";
}

export function DashboardLayoutClient({
  children,
  userName = "Usuario",
  userEmail = "usuario@email.com",
  userId,
  userRole = "paciente",
}: DashboardLayoutClientProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Configurar menú según el rol
  const menuGroups = userRole === "medico" 
    ? [
        {
          label: "Principal",
          items: [
            { key: "dashboard", label: "Dashboard", icon: "LayoutDashboard", route: "/dashboard/medico" },
            { key: "citas", label: "Agenda", icon: "Calendar", route: "/dashboard/medico/citas" },
            { key: "pacientes", label: "Pacientes", icon: "User", route: "/dashboard/medico/pacientes" },
          ],
        },
        {
          label: "Servicios",
          items: [
            { key: "mensajeria", label: "Mensajes", icon: "MessageSquare", route: "/dashboard/medico/mensajeria" },
            { key: "telemedicina", label: "Telemedicina", icon: "Video", route: "/dashboard/medico/telemedicina" },
            { key: "recetas", label: "Recetas", icon: "Pill", route: "/dashboard/medico/recetas" },
          ],
        },
        {
          label: "Otros",
          items: [
            { key: "estadisticas", label: "Estadísticas", icon: "Activity", route: "/dashboard/medico/estadisticas" },
            { key: "configuracion", label: "Configuración", icon: "Settings", route: "/dashboard/medico/configuracion" },
          ],
        },
      ]
    : [
        {
          label: "Principal",
          items: Object.entries(PATIENT_MODULE_CONFIG)
            .slice(0, 3)
            .map(([key, config]) => ({
              key,
              ...config,
            })),
        },
        {
          label: "Servicios",
          items: Object.entries(PATIENT_MODULE_CONFIG)
            .slice(3, 7)
            .map(([key, config]) => ({
              key,
              ...config,
            })),
        },
        {
          label: "Otros",
          items: [
            ...Object.entries(PATIENT_MODULE_CONFIG)
              .slice(7)
              .map(([key, config]) => ({
                key,
                ...config,
              })),
            { 
              key: "configuracion", 
              label: "Configuración", 
              icon: "Settings", 
              route: "/dashboard/paciente/configuracion" 
            },
          ],
        },
      ];

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30">
        <div className="h-full px-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-teal-600 text-white px-2 py-1 rounded font-bold text-sm">
              RS
            </div>
            <span className="font-bold text-lg">Red-Salud</span>
          </div>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Layout con Sidebar y Contenido */}
      <div className="flex min-h-screen">
        {/* Desktop Sidebar - Estilo Didit */}
        <DiditSidebar
          userName={userName}
          userEmail={userEmail}
          menuGroups={menuGroups}
          onProfileClick={() => setProfileModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Mobile Sidebar - Estilo Didit */}
        <DiditMobileSidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          userName={userName}
          userEmail={userEmail}
          menuGroups={menuGroups}
          onProfileClick={() => {
            setProfileModalOpen(true);
            setMobileSidebarOpen(false);
          }}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="pt-16 md:pt-0">{children}</div>
        </main>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userName={userName}
        userEmail={userEmail}
        userId={userId}
      />
    </div>
  );
}
