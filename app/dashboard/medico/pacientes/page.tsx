"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CalendarClock, UserPlus } from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { FiltersBar } from "@/components/dashboard/medico/patients/filters-bar";
import { PatientsTable } from "@/components/dashboard/medico/patients/patients-table";
import { PatientsGrid } from "@/components/dashboard/medico/patients/patients-grid";
import { usePatientsList } from "@/components/dashboard/medico/patients/hooks/usePatientsList";
import type { RegisteredPatient, OfflinePatient } from "@/components/dashboard/medico/patients/utils";

interface Patient {
  id: string;
  patient_id: string;
  first_consultation_date: string | null;
  last_consultation_date: string | null;
  total_consultations: number;
  status: string;
  patient: {
    id: string;
    nombre_completo: string;
    email: string;
    avatar_url: string | null;
    fecha_nacimiento: string | null;
    genero: string | null;
    telefono: string | null;
  };
}

interface OfflinePatientLocal {
  id: string;
  cedula: string;
  nombre_completo: string;
  fecha_nacimiento: string | null;
  genero: string | null;
  telefono: string | null;
  email: string | null;
  status: string;
  created_at: string;
  total_consultations?: number;
}

export default function DoctorPatientsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const { state, actions } = usePatientsList(userId);

  const handleView = (p: RegisteredPatient | OfflinePatient) => {
    const isRegistered = "patient" in p;
    if (isRegistered) {
      const rp = p as RegisteredPatient;
      router.push(`/dashboard/medico/pacientes/${rp.patient_id}`);
    } else {
      const op = p as OfflinePatient;
      router.push(`/dashboard/medico/pacientes/offline/${op.id}`);
    }
  };

  const handleMessage = (p: RegisteredPatient) => {
    router.push(`/dashboard/medico/mensajeria?patient=${p.patient_id}`);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }
      setUserId(user.id);
    };
    init();
  }, [router]);

  

  

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <VerificationGuard>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Pacientes</h1>
          <p className="text-gray-600 mt-1">
            {state.patients.length + state.offlinePatients.length} paciente{(state.patients.length + state.offlinePatients.length) !== 1 ? "s" : ""} total{(state.patients.length + state.offlinePatients.length) !== 1 ? "es" : ""}
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/medico/pacientes/nuevo")}>
          <UserPlus className="h-4 w-4 mr-2" />
          Registrar Paciente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {state.patients.length + state.offlinePatients.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {state.patients.length} registrados • {state.offlinePatients.length} sin registrar
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pacientes de Hoy</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{state.todayAppointments}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Citas programadas para hoy
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <CalendarClock className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <FiltersBar
            searchQuery={state.searchQuery}
            onSearchChange={actions.setSearchQuery}
            filterType={state.filterType}
            onFilterTypeChange={actions.setFilterType}
            filterGender={state.filterGender}
            onFilterGenderChange={actions.setFilterGender}
            sortBy={state.sortBy}
            onSortByChange={actions.setSortBy}
            viewMode={state.viewMode}
            onViewModeChange={actions.setViewMode}
          />
        </CardContent>
      </Card>

      {/* Patients List */}
      <div className="space-y-4">
        {state.filteredPatients.length > 0 ? (
          <>
            {state.viewMode === "table" ? (
              <PatientsTable patients={state.filteredPatients} onView={handleView} onMessage={handleMessage} />
            ) : (
              <PatientsGrid patients={state.filteredPatients} onView={handleView} onMessage={handleMessage} />
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {state.searchQuery ? "No se encontraron pacientes" : "Aún no tienes pacientes"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {state.searchQuery
                    ? "Intenta con otro término de búsqueda o ajusta los filtros"
                    : "Los pacientes aparecerán aquí cuando agenden su primera consulta o los registres manualmente"}
                </p>
                {!state.searchQuery && (
                  <Button onClick={() => router.push("/dashboard/medico/pacientes/nuevo")}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Registrar Paciente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </VerificationGuard>
  );
}
