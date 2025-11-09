"use client";

import { useEffect, useState } from "react";
import { sessionManager } from "@/lib/security/session-manager";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, AlertTriangle } from "lucide-react";

/**
 * Componente que muestra advertencia cuando la sesión está por expirar
 */
export function SessionTimeoutWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    // Verificar cada 30 segundos
    const interval = setInterval(() => {
      const remaining = sessionManager.getRemainingTime();
      setRemainingTime(remaining);

      // Mostrar advertencia 5 minutos antes de expirar
      if (remaining > 0 && remaining < 5 * 60 * 1000 && !showWarning) {
        setShowWarning(true);
      }

      // Si ya expiró, cerrar sesión
      if (remaining === 0) {
        sessionManager.logout("timeout");
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [showWarning]);

  const handleExtend = async () => {
    await sessionManager.extendSession();
    setShowWarning(false);
  };

  const handleLogout = async () => {
    await sessionManager.logout("manual");
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle>Tu sesión está por expirar</DialogTitle>
              <DialogDescription>
                Por seguridad, tu sesión se cerrará por inactividad
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center justify-center py-6">
          <div className="text-center">
            <Clock className="h-16 w-16 text-orange-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-900">
              {formatTime(remainingTime)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Tiempo restante
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            Cerrar Sesión
          </Button>
          <Button
            onClick={handleExtend}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            Continuar Sesión
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
