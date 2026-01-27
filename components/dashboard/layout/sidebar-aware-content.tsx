"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarAwareContentProps {
  children: React.ReactNode;
  className?: string;
  userRole?: string;
}

export function SidebarAwareContent({ 
  children, 
  className,
  userRole 
}: SidebarAwareContentProps) {
  const [sidebarWidth, setSidebarWidth] = useState(0); // Default 0 para modo hover
  const [currentMode, setCurrentMode] = useState<string>("hover");

  useEffect(() => {
    // Leer el estado inicial del localStorage
    const savedMode = localStorage.getItem("sidebar-mode");
    const mode = savedMode || "hover";
    setCurrentMode(mode);
    
    // Calcular el ancho inicial según el modo
    let initialWidth = 0;
    if (mode === "expanded") {
      initialWidth = 256;
    } else if (mode === "collapsed") {
      initialWidth = 48;
    } else {
      initialWidth = 0; // hover no ocupa espacio
    }
    setSidebarWidth(initialWidth);

    // Escuchar cambios en el sidebar
    const handleSidebarModeChange = (event: CustomEvent) => {
      const { mode: newMode, isExpanded } = event.detail;
      setCurrentMode(newMode);
      
      // Ajustar el ancho según el modo
      if (newMode === "hover") {
        setSidebarWidth(0); // En modo hover no ocupa espacio
      } else if (newMode === "expanded") {
        setSidebarWidth(256); // Expandido
      } else if (newMode === "collapsed") {
        setSidebarWidth(48); // Colapsado
      }
    };

    window.addEventListener("sidebar-mode-change", handleSidebarModeChange as EventListener);

    return () => {
      window.removeEventListener("sidebar-mode-change", handleSidebarModeChange as EventListener);
    };
  }, []);

  return (
    <main 
      className={cn(
        "flex-1 min-h-full transition-all duration-200 ease-out",
        className
      )}
      style={{ 
        marginLeft: currentMode === "hover" ? "0px" : `${sidebarWidth}px`,
        width: currentMode === "hover" ? "100%" : `calc(100% - ${sidebarWidth}px)`
      }}
    >
      <div className={userRole === "medico" ? "" : "pt-14 md:pt-0"}>
        {children}
      </div>
    </main>
  );
}