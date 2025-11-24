"use client";

import { useRouter } from "next/navigation";
import { User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select";

interface PatientSelectorProps {
  patients: any[];
  loadingPatients: boolean;
  selectedPatientId: string;
  onPatientSelect: (value: string) => void;
}

export function PatientSelector({
  patients,
  loadingPatients,
  selectedPatientId,
  onPatientSelect,
}: PatientSelectorProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          Información Básica
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paciente_id" className="text-sm font-medium">
              Paciente <span className="text-red-500">*</span>
            </Label>
            {loadingPatients ? (
              <div className="flex items-center gap-2 text-gray-500 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando pacientes...</span>
              </div>
            ) : (
              <SearchableSelect
                options={patients.map((patient): SearchableSelectOption => ({
                  value: patient.id,
                  label: patient.nombre_completo,
                  badge: patient.type === "offline" ? patient.cedula : undefined,
                  subtitle: patient.email || undefined,
                }))}
                value={selectedPatientId}
                onValueChange={onPatientSelect}
                placeholder="Selecciona un paciente"
                searchPlaceholder="Buscar por nombre..."
                emptyMessage="No se encontró ningún paciente"
              />
            )}
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-gray-700 mb-2">
              ¿No encuentras al paciente?
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-sm"
              onClick={() => router.push("/dashboard/medico/pacientes/nuevo/simple?from=cita")}
            >
              <User className="h-4 w-4 mr-2" />
              Registrar Nuevo Paciente
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
