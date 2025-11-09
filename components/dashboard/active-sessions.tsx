"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";
import { sessionManager } from "@/lib/security/session-manager";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  MapPin, 
  Clock, 
  Shield,
  LogOut,
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  location?: string;
  lastActivity: Date;
  current: boolean;
}

export function ActiveSessions() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Obtener logs de sesión de los últimos 7 días
      const { data: logs } = await supabase
        .from("user_activity_log")
        .select("*")
        .eq("user_id", user.id)
        .eq("activity_type", "session_login")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false });

      if (logs) {
        // Agrupar por dispositivo único
        const uniqueSessions = new Map<string, SessionInfo>();
        
        logs.forEach((log) => {
          const userAgent = log.metadata?.userAgent || "";
          const deviceKey = btoa(userAgent); // Usar como ID único
          
          if (!uniqueSessions.has(deviceKey)) {
            uniqueSessions.set(deviceKey, {
              id: deviceKey,
              device: detectDevice(userAgent),
              browser: detectBrowser(userAgent),
              location: log.metadata?.location,
              lastActivity: new Date(log.created_at),
              current: userAgent === navigator.userAgent,
            });
          }
        });

        setSessions(Array.from(uniqueSessions.values()));
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const detectDevice = (userAgent: string): string => {
    if (/mobile/i.test(userAgent)) return "Móvil";
    if (/tablet|ipad/i.test(userAgent)) return "Tablet";
    return "Computadora";
  };

  const detectBrowser = (userAgent: string): string => {
    if (/chrome/i.test(userAgent)) return "Chrome";
    if (/firefox/i.test(userAgent)) return "Firefox";
    if (/safari/i.test(userAgent)) return "Safari";
    if (/edge/i.test(userAgent)) return "Edge";
    return "Otro";
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "Móvil":
        return Smartphone;
      case "Tablet":
        return Tablet;
      default:
        return Monitor;
    }
  };

  const handleLogoutSession = async (sessionId: string) => {
    // En una implementación real, aquí cerrarías la sesión específica
    // Por ahora, solo cerramos la sesión actual si es la seleccionada
    const session = sessions.find(s => s.id === sessionId);
    if (session?.current) {
      await sessionManager.logout("manual");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sesiones Activas</CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Sesiones Activas
            </CardTitle>
            <CardDescription>
              Dispositivos que han accedido a tu cuenta recientemente
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {sessions.length} {sessions.length === 1 ? "sesión" : "sesiones"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.device);
            
            return (
              <div
                key={session.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  session.current
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="h-12 w-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shrink-0">
                  <DeviceIcon className="h-6 w-6 text-gray-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {session.device} - {session.browser}
                    </h4>
                    {session.current && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Sesión Actual
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Última actividad:{" "}
                        {format(session.lastActivity, "PPp", { locale: es })}
                      </span>
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{session.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {!session.current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLogoutSession(session.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            );
          })}

          {sessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No hay sesiones activas</p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Consejo de Seguridad</p>
              <p className="text-blue-700">
                Si ves una sesión que no reconoces, ciérrala inmediatamente y
                cambia tu contraseña. Considera activar la autenticación de dos
                factores para mayor seguridad.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
