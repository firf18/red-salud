"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Página para completar perfil después de OAuth
 * Si el usuario no tiene un registro en la tabla profiles, lo creamos aquí
 */

const ROLES = [
  { value: "paciente", label: "Paciente" },
  { value: "medico", label: "Médico" },
  { value: "clinica", label: "Clínica" },
  { value: "farmacia", label: "Farmacia" },
  { value: "laboratorio", label: "Laboratorio" },
  { value: "ambulancia", label: "Ambulancia" },
  { value: "seguro", label: "Seguro Médico" },
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("paciente");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUser(user);

      // Verificar si ya tiene perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role) {
        // Ya tiene perfil, redirigir a dashboard
        router.push(`/dashboard/${profile.role}`);
      }
    }

    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!user) {
      setError("No hay usuario autenticado");
      setIsLoading(false);
      return;
    }

    try {
      // Crear perfil en la tabla profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          nombre_completo: user.user_metadata?.full_name || user.email?.split("@")[0],
          role: selectedRole,
          avatar_url: user.user_metadata?.avatar_url || null,
        });

      if (profileError) {
        throw profileError;
      }

      // Crear registro en la tabla específica del rol si es paciente
      if (selectedRole === "paciente") {
        const { error: patientError } = await supabase
          .from("patient_details")
          .upsert({
            profile_id: user.id,
          });

        if (patientError) {
          console.error("Error al crear patient_details:", patientError);
          // No bloqueamos, el perfil ya está creado
        }
      }

      // Redirigir al dashboard
      router.push(`/dashboard/${selectedRole}`);
      router.refresh();
    } catch (err: any) {
      console.error("Error al completar perfil:", err);
      setError(err.message || "Error al completar perfil");
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-blue-50/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Completa tu Perfil
          </h1>
          <p className="text-gray-600">
            Selecciona tu tipo de cuenta para continuar
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="mb-3 block">Tipo de Cuenta</Label>
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedRole === role.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="font-semibold text-gray-900">{role.label}</div>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Completando perfil...
              </>
            ) : (
              "Continuar"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
