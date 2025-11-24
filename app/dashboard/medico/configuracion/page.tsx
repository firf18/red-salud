"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Clock,
  Users,
  Bell,
  Shield,
  Settings,
} from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { ProfileSection } from "@/components/dashboard/medico/configuracion/profile-section";
import { ScheduleSection } from "@/components/dashboard/medico/configuracion/schedule-section";
import { SecretariesSection } from "@/components/dashboard/medico/configuracion/secretaries-section";
import { NotificationsSection } from "@/components/dashboard/medico/configuracion/notifications-section";
import { SecuritySection } from "@/components/dashboard/medico/configuracion/security-section";

type TabType = "perfil" | "horarios" | "secretarias" | "notificaciones" | "seguridad";

interface TabConfig {
  id: TabType;
  label: string;
  icon: any;
  description: string;
}

const TABS: TabConfig[] = [
  { 
    id: "perfil", 
    label: "Perfil Profesional", 
    icon: User,
    description: "Información personal y profesional"
  },
  { 
    id: "horarios", 
    label: "Horarios", 
    icon: Clock,
    description: "Días y horarios de atención"
  },
  { 
    id: "secretarias", 
    label: "Secretarias", 
    icon: Users,
    description: "Gestión de equipo de trabajo"
  },
  { 
    id: "notificaciones", 
    label: "Notificaciones", 
    icon: Bell,
    description: "Preferencias de notificaciones"
  },
  { 
    id: "seguridad", 
    label: "Seguridad", 
    icon: Shield,
    description: "Contraseña y privacidad"
  },
];

export default function ConfiguracionMedicoPage() {
  const [activeTab, setActiveTab] = useState<TabType>("perfil");

  const renderTabContent = () => {
    switch (activeTab) {
      case "perfil":
        return <ProfileSection />;
      case "horarios":
        return <ScheduleSection />;
      case "secretarias":
        return <SecretariesSection />;
      case "notificaciones":
        return <NotificationsSection />;
      case "seguridad":
        return <SecuritySection />;
      default:
        return null;
    }
  };

  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Configuración
            </h1>
          </div>
          <p className="text-gray-600 ml-14">
            Administra tu perfil profesional, horarios y preferencias del sistema
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 bg-white rounded-lg border p-2 sticky top-4">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-700 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                    <div className="text-left">
                      <div className={`font-medium ${isActive ? "text-blue-700" : "text-gray-900"}`}>
                        {tab.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {tab.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg border p-6 min-h-[600px]"
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </VerificationGuard>
  );
}
