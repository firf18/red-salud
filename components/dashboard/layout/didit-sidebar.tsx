"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
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
  LogOut,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Mapa de iconos
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
  Stethoscope,
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

export interface DiditSidebarProps {
  userName?: string;
  userEmail?: string;
  menuGroups: MenuGroup[];
  onProfileClick?: () => void;
  onLogout?: () => void;
}

export function DiditSidebar({
  userName = "Usuario",
  menuGroups,
  onProfileClick,
  onLogout,
}: DiditSidebarProps) {
  // Estado de colapso persistente (preferencia del usuario)
  const [collapsed, setCollapsed] = useState(() => {
    // Cargar estado inicial del localStorage
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem("sidebar-collapsed-state");
      return savedState !== null ? JSON.parse(savedState) : false;
    }
    return false;
  });
  // Estado de hover temporal
  const [isHovered, setIsHovered] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  // Guardar estado en localStorage cuando cambia
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed-state", JSON.stringify(collapsed));
  }, [collapsed]);

  // Determinar si el sidebar se muestra expandido (ya sea por preferencia o hover)
  const isExpanded = !collapsed || isHovered;

  const isActive = (route: string) => {
    // Comparación exacta para evitar que múltiples rutas estén activas
    return pathname === route;
  };

  // Aplanar todos los items de todos los grupos
  const allItems = menuGroups.flatMap(group => group.items);

  // Navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Solo activar si el sidebar tiene el foco
      if (!navRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % allItems.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0) {
            window.location.href = allItems[focusedIndex].route;
          }
          break;
        case "Escape":
          e.preventDefault();
          setFocusedIndex(-1);
          break;
        // Atajo para colapsar/expandir: Ctrl/Cmd + B
        case "b":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setCollapsed(!collapsed);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, allItems, collapsed]);

  return (
    <motion.div
      data-state={isExpanded ? "expanded" : "collapsed"}
      data-collapsible="icon"
      className="group peer hidden md:block h-screen sticky top-0 z-40"
      animate={{ width: isExpanded ? 200 : 80 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sidebar Container */}
      <div className="h-full shadow-xl">
        <div
          data-sidebar="sidebar"
          className="bg-sidebar border-r border-sidebar-border flex h-full w-full flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]"
        >
          {/* Header - User Info */}
          <div
            data-sidebar="header"
            data-tour="sidebar-profile"
            className={cn(
              "flex items-center border-b border-sidebar-border p-4 transition-all h-[72px]",
              !isExpanded ? "justify-center" : "justify-start"
            )}
          >
            <button
              onClick={onProfileClick}
              className={cn(
                "inline-flex items-center gap-3 rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 p-2 w-full group/profile",
                !isExpanded && "justify-center"
              )}
            >
              <Avatar className="size-9 shrink-0 ring-2 ring-sidebar-border group-hover/profile:ring-sidebar-accent transition-all">
                <AvatarFallback className="bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground font-bold">
                  {userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isExpanded && (
                <div className="flex-1 text-left overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm font-semibold text-sidebar-foreground truncate"
                  >
                    {userName}
                  </motion.div>
                </div>
              )}
            </button>
          </div>

          {/* Content - Navigation */}
          <div
            ref={navRef}
            data-sidebar="content"
            className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 custom-scrollbar"
          >
            <nav className="space-y-10">
              {allItems.map((item, index) => {
                const Icon = iconMap[item.icon];
                const active = isActive(item.route);
                const focused = focusedIndex === index;

                return (
                  <Link key={item.key} href={item.route}>
                    <button
                      data-tour={`sidebar-item-${item.key}`}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(-1)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg transition-all duration-200 relative",
                        !isExpanded ? "justify-center p-3" : "justify-start px-3 py-3",
                        active && "bg-sidebar-accent text-sidebar-primary font-semibold shadow-sm",
                        !active && "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        focused && !active && "ring-2 ring-sidebar-ring"
                      )}
                      title={!isExpanded ? item.label : undefined}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 w-1 h-6 bg-sidebar-primary rounded-r-full"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}

                      {Icon && (
                        <Icon
                          className={cn(
                            "shrink-0 transition-all duration-300",
                            !isExpanded ? "size-5" : "size-4",
                            active ? "text-sidebar-primary" : "text-sidebar-foreground/60"
                          )}
                        />
                      )}
                      {isExpanded && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "text-sm truncate",
                            active ? "text-sidebar-primary" : "text-sidebar-foreground/70"
                          )}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </button>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className={cn(
            "border-t border-sidebar-border p-3",
            !isExpanded ? "flex flex-col items-center gap-2" : "space-y-2"
          )}>
            <button
              data-tour="sidebar-logout"
              onClick={onLogout}
              className={cn(
                "flex items-center gap-3 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all duration-200 text-sidebar-foreground/70 text-sm font-medium",
                !isExpanded ? "justify-center p-3 w-full" : "justify-start px-4 py-3 w-full"
              )}
              title={!isExpanded ? "Cerrar Sesión" : undefined}
            >
              <LogOut className={cn("shrink-0", !isExpanded ? "size-6" : "size-5")} />
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Cerrar Sesión
                </motion.span>
              )}
            </button>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-sidebar-foreground/40 text-center px-2 py-1"
              >
                © 2025 Red-Salud
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Button - Centrado verticalmente */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Fijar sidebar" : "Colapsar sidebar"}
        title={collapsed ? "Fijar sidebar (Ctrl+B)" : "Colapsar sidebar (Ctrl+B)"}
        className={cn(
          "absolute -right-3 top-1/2 -translate-y-1/2 z-50 size-6 flex items-center justify-center rounded-full border border-sidebar-border bg-sidebar shadow-md hover:bg-sidebar-accent transition-all duration-300 opacity-0 group-hover:opacity-100",
          collapsed && "opacity-100 bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary"
        )}
      >
        {collapsed ? (
          <ChevronRight className="size-3.5" />
        ) : (
          <ChevronLeft className="size-3.5" />
        )}
      </button>
    </motion.div>
  );
}
