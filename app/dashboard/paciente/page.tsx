"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Activity,
  FileText,
  Pill,
  TrendingUp,
  Clock,
  Video,
  MessageSquare,
  Beaker,
  Heart,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Bell,
  User,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DashboardStats {
  upcomingAppointments: number;
  totalConsultations: number;
  activeMedications: number;
  pendingLabResults: number;
  unreadMessages: number;
  activeTelemed: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  date: string;
  status: string;
}

export default function DashboardPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();
  const [userName, setUserName] = useState<string>("");
  const [stats, setStats] = useState<DashboardStats>({
    upcomingAppointments: 0,
    totalConsultations: 0,
    activeMedications: 0,
    pendingLabResults: 0,
    unreadMessages: 0,
    activeTelemed: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [latestMetrics, setLatestMetrics] = useState<any[]>([]);
  const [activeMedications, setActiveMedications] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserId(user.id);

      // Obtener nombre del usuario
      const { data: profile } = await supabase
        .from("profiles")
        .select("nombre_completo")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserName(profile.nombre_completo);
      }

      // Cargar estadísticas en paralelo
      await Promise.all([
        loadAppointmentsStats(user.id),
        loadMedicationsStats(user.id),
        loadLabStats(user.id),
        loadMessagesStats(user.id),
        loadTelemedicineStats(user.id),
        loadRecentActivities(user.id),
        loadUpcomingAppointments(user.id),
        loadLatestMetrics(user.id),
        loadActiveMedications(user.id),
      ]);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAppointmentsStats = async (userId: string) => {
    const { data, error } = await supabase
      .from("appointments")
      .select("id, status")
      .eq("paciente_id", userId);

    if (!error && data) {
      const upcoming = data.filter(
        (apt) => apt.status === "pendiente" || apt.status === "confirmada"
      ).length;
      const total = data.length;
      
      setStats((prev) => ({
        ...prev,
        upcomingAppointments: upcoming,
        totalConsultations: total,
      }));
    }
  };

  const loadMedicationsStats = async (userId: string) => {
    const { data, error } = await supabase
      .from("medication_reminders")
      .select("id")
      .eq("paciente_id", userId)
      .eq("activo", true);

    if (!error && data) {
      setStats((prev) => ({ ...prev, activeMedications: data.length }));
    }
  };

  const loadLabStats = async (userId: string) => {
    const { data, error } = await supabase
      .from("lab_orders")
      .select("id")
      .eq("paciente_id", userId)
      .in("status", ["en_proceso", "muestra_tomada"]);

    if (!error && data) {
      setStats((prev) => ({ ...prev, pendingLabResults: data.length }));
    }
  };

  const loadMessagesStats = async (userId: string) => {
    const { data, error } = await supabase
      .from("messages_new")
      .select("id")
      .neq("sender_id", userId)
      .eq("is_read", false);

    if (!error && data) {
      setStats((prev) => ({ ...prev, unreadMessages: data.length }));
    }
  };

  const loadTelemedicineStats = async (userId: string) => {
    const { data, error } = await supabase
      .from("telemedicine_sessions")
      .select("id")
      .eq("patient_id", userId)
      .in("status", ["waiting", "active"]);

    if (!error && data) {
      setStats((prev) => ({ ...prev, activeTelemed: data.length }));
    }
  };

  const loadRecentActivities = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_activity_log")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setRecentActivities(data);
    }
  };

  const loadUpcomingAppointments = async (userId: string) => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        doctor:profiles!appointments_medico_id_fkey(
          id,
          nombre_completo,
          avatar_url
        )
      `)
      .eq("paciente_id", userId)
      .in("status", ["pendiente", "confirmada"])
      .order("fecha_hora", { ascending: true })
      .limit(3);

    if (!error && data) {
      setUpcomingAppointments(data);
    }
  };

  const loadLatestMetrics = async (userId: string) => {
    const { data, error } = await supabase
      .from("health_metrics")
      .select(`
        *,
        metric_type:health_metric_types(nombre, unidad_medida, icono)
      `)
      .eq("paciente_id", userId)
      .order("fecha_medicion", { ascending: false })
      .limit(4);

    if (!error && data) {
      setLatestMetrics(data);
    }
  };

  const loadActiveMedications = async (userId: string) => {
    const { data, error } = await supabase
      .from("medication_reminders")
      .select("*")
      .eq("paciente_id", userId)
      .eq("activo", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!error && data) {
      setActiveMedications(data);
    }
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      appointment_created: Calendar,
      appointment_cancelled: Calendar,
      prescription_created: Pill,
      lab_order_created: Beaker,
      message_sent: MessageSquare,
      telemedicine_session_created: Video,
      profile_updated: User,
      metric_recorded: Activity,
    };
    return icons[type] || Activity;
  };

  const getActivityColor = (status: string) => {
    const colors: Record<string, string> = {
      success: "text-green-600 bg-green-50",
      error: "text-red-600 bg-red-50",
      warning: "text-yellow-600 bg-yellow-50",
      info: "text-blue-600 bg-blue-50",
    };
    return colors[status] || colors.info;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 pb-20 lg:pb-8 space-y-6">
      {/* Header con Bienvenida */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, {userName.split(" ")[0] || "Paciente"}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/paciente/citas/nueva")}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Cita
        </Button>
      </div>

      {/* Alertas Importantes */}
      {stats.activeTelemed > 0 && (
        <Card className="border-blue-500 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-semibold text-blue-900">
                  Tienes {stats.activeTelemed} sesión(es) de telemedicina activa(s)
                </p>
                <p className="text-sm text-blue-700">
                  Haz clic para unirte a la videoconsulta
                </p>
              </div>
              <Button
                onClick={() => router.push("/dashboard/paciente/telemedicina")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Unirse Ahora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/dashboard/paciente/citas")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.upcomingAppointments}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Próximas Citas</h3>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalConsultations} consultas totales
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/dashboard/paciente/medicamentos")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Pill className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.activeMedications}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Medicamentos Activos
            </h3>
            <p className="text-xs text-gray-500 mt-1">Recordatorios configurados</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/dashboard/paciente/laboratorio")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Beaker className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.pendingLabResults}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Resultados Pendientes
            </h3>
            <p className="text-xs text-gray-500 mt-1">Órdenes de laboratorio</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push("/dashboard/paciente/mensajeria")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {stats.unreadMessages}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              Mensajes Sin Leer
            </h3>
            <p className="text-xs text-gray-500 mt-1">Conversaciones activas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Próximas Citas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Próximas Citas</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard/paciente/citas")}
                >
                  Ver todas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <CardDescription>
                Tus próximas consultas médicas programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((apt) => {
                    const fechaHora = new Date(apt.fecha_hora);
                    return (
                      <div
                        key={apt.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => router.push(`/dashboard/paciente/citas`)}
                      >
                        <div className="h-12 w-12 bg-blue-600 text-white rounded-lg flex items-center justify-center shrink-0">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {apt.motivo || "Consulta Médica"}
                            </h3>
                            <Badge variant={apt.status === "confirmada" ? "default" : "secondary"}>
                              {apt.status === "confirmada" ? "Confirmada" : "Pendiente"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Dr. {apt.doctor?.nombre_completo || "Por asignar"}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(fechaHora, "EEEE, d 'de' MMMM 'a las' HH:mm", {
                                locale: es,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No tienes citas programadas</p>
                  <Button
                    onClick={() => router.push("/dashboard/paciente/citas/nueva")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar Cita
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actividad Reciente */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Últimas acciones en tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.activity_type);
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50"
                      >
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${getActivityColor(
                            activity.status
                          )}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(activity.created_at), "PPp", {
                              locale: es,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No hay actividad reciente
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna Lateral */}
        <div className="space-y-6">
          {/* Métricas de Salud */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Métricas de Salud</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard/paciente/metricas")}
                >
                  Ver más
                </Button>
              </div>
              <CardDescription>Últimas mediciones registradas</CardDescription>
            </CardHeader>
            <CardContent>
              {latestMetrics.length > 0 ? (
                <div className="space-y-4">
                  {latestMetrics.map((metric) => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {metric.metric_type?.nombre}
                        </span>
                        <Badge variant="outline">
                          {format(new Date(metric.fecha_medicion), "dd/MM")}
                        </Badge>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {metric.valor}
                          {metric.valor_secundario && `/${metric.valor_secundario}`}
                        </span>
                        <span className="text-sm text-gray-500">
                          {metric.metric_type?.unidad_medida}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-3">
                    No hay métricas registradas
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push("/dashboard/paciente/metricas/registrar")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Métrica
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medicamentos Activos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Medicamentos</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard/paciente/medicamentos")}
                >
                  Ver más
                </Button>
              </div>
              <CardDescription>Recordatorios activos</CardDescription>
            </CardHeader>
            <CardContent>
              {activeMedications.length > 0 ? (
                <div className="space-y-3">
                  {activeMedications.map((med) => (
                    <div
                      key={med.id}
                      className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg"
                    >
                      <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                        <Pill className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {med.nombre_medicamento}
                        </p>
                        <p className="text-xs text-gray-600">{med.dosis}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {med.horarios?.slice(0, 3).map((hora: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {hora}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Pill className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-3">
                    No hay medicamentos activos
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push("/dashboard/paciente/medicamentos/recordatorios/nuevo")
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Recordatorio
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Accesos Rápidos */}
          <Card>
            <CardHeader>
              <CardTitle>Accesos Rápidos</CardTitle>
              <CardDescription>Servicios disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => router.push("/dashboard/paciente/telemedicina")}
                >
                  <Video className="h-6 w-6 text-blue-600" />
                  <span className="text-xs">Telemedicina</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => router.push("/dashboard/paciente/laboratorio")}
                >
                  <Beaker className="h-6 w-6 text-purple-600" />
                  <span className="text-xs">Laboratorio</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => router.push("/dashboard/paciente/historial")}
                >
                  <FileText className="h-6 w-6 text-green-600" />
                  <span className="text-xs">Historial</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={() => router.push("/dashboard/paciente/mensajeria")}
                >
                  <MessageSquare className="h-6 w-6 text-orange-600" />
                  <span className="text-xs">Mensajes</span>
                </Button>
              </div>

              <Button
                className="w-full mt-4"
                variant="outline"
                onClick={() => router.push("/dashboard/paciente/configuracion")}
              >
                <User className="h-4 w-4 mr-2" />
                Configuración
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
