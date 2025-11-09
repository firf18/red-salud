"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  User,
  Calendar,
  FileText,
  Pill,
  Activity,
  MessageSquare,
  FlaskConical,
  Video,
  Star,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  User,
  Calendar,
  FileText,
  Pill,
  Activity,
  MessageSquare,
  FlaskConical,
  Video,
  Star,
  Settings,
};

export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  route: string;
  color?: string;
}

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export interface DiditMobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
  menuGroups: MenuGroup[];
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export function DiditMobileSidebar({
  isOpen,
  onClose,
  userName = "Usuario",
  userEmail = "usuario@email.com",
  menuGroups,
  onProfileClick,
  onLogout,
}: DiditMobileSidebarProps) {
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (pathname === route) return true;
    if (route !== "/" && pathname.startsWith(route)) return true;
    return false;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl md:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <button
                  onClick={onProfileClick}
                  className="flex items-center gap-3 flex-1 min-w-0 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-gray-900 text-white text-sm">
                      {userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-medium truncate">{userName}</div>
                    <div className="text-xs text-gray-500 truncate">{userEmail}</div>
                  </div>
                  <ChevronRight className="size-4 text-gray-600 shrink-0" />
                </button>
                <button
                  onClick={onClose}
                  className="ml-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="size-5 text-gray-600" />
                </button>
              </div>

              {/* Content - Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                {menuGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-6">
                    {/* Group Label */}
                    <div className="text-xs font-medium text-gray-500 uppercase px-3 mb-2">
                      {group.label}
                    </div>

                    {/* Group Items */}
                    <ul className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = iconMap[item.icon];
                        const active = isActive(item.route);

                        return (
                          <li key={item.key}>
                            <Link href={item.route} onClick={onClose}>
                              <button
                                className={cn(
                                  "flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                                  "hover:bg-gray-50",
                                  active && "bg-gray-50 text-blue-600 ring-1 ring-gray-100"
                                )}
                              >
                                {Icon && (
                                  <Icon
                                    className={cn(
                                      "size-5 shrink-0",
                                      active ? "text-blue-600" : "text-gray-700"
                                    )}
                                  />
                                )}
                                <span className={active ? "text-blue-600" : "text-gray-700"}>
                                  {item.label}
                                </span>
                              </button>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4">
                <button
                  onClick={() => {
                    onLogout?.();
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600 text-sm font-medium"
                >
                  <LogOut className="size-5" />
                  Cerrar Sesión
                </button>
                <div className="text-xs text-gray-500 text-center mt-4">
                  © 2025 Red-Salud
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
