"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus, CheckCircle, Loader2, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { validateCedulaWithCNE, isValidVenezuelanCedula, calculateAge } from "@/lib/services/cedula-validation";

export default function NuevoPacienteSimplePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCita = searchParams.get("from") === "cita";
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatingCedula, setValidatingCedula] = useState(false);
  const [cedulaFound, setCedulaFound] = useState(false);
  
  const [formData, setFormData] = useState({
    cedula: "",
    nombre_completo: "",
    fecha_nacimiento: "",
    genero: "",
    telefono: "",
    email: "",
  });
  const [edad, setEdad] = useState<number | null>(null);

  // Calcular edad
  useEffect(() => {
    if (formData.fecha_nacimiento) {
      const calculatedAge = calculateAge(formData.fecha_nacimiento);
      setEdad(calculatedAge);
    } else {
      setEdad(null);
    }
  }, [formData.fecha_nacimiento]);

  // Validar cédula
  useEffect(() => {
    const validateCedulaDebounced = async () => {
      const cleanCedula = formData.cedula.trim();
      
      if (cleanCedula.length >= 6 && isValidVenezuelanCedula(cleanCedula)) {
        setValidatingCedula(true);
        setCedulaFound(false);
        
        try {
          const result = await validateCedulaWithCNE(cleanCedula);
          
          if (result.found && result.nombre_completo) {
            setCedulaFound(true);
            setFormData((prev) => ({
              ...prev,
              nombre_completo: result.nombre_completo!,
            }));
          } else {
            setCedulaFound(false);
          }
        } catch (err) {
          console.error("Error validating cedula:", err);
          setCedulaFound(false);
        } finally {
          setValidatingCedula(false);
        }
      } else {
        setValidatingCedula(false);
        setCedulaFound(false);
      }
    };

    const debounce = setTimeout(validateCedulaDebounced, 400);
    return () => clearTimeout(debounce);
  }, [formData.cedula]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/medico");
        return;
      }

      if (!formData.cedula || formData.cedula.length < 6) {
        setError("La cédula es requerida y debe tener al menos 6 dígitos");
        setLoading(false);
        return;
      }

      if (!formData.nombre_completo) {
        setError("El nombre completo es requerido");
        setLoading(false);
        return;
      }

      // Verificar si el paciente ya existe
      const { data: existingPatient } = await supabase
        .from("profiles")
        .select("id")
        .eq("cedula", formData.cedula)
        .single();

      if (existingPatient) {
        // Crear relación si no existe
        const { error: relationError } = await supabase
          .from("doctor_patients")
          .insert({
            doctor_id: user.id,
            patient_id: existingPatient.id,
            first_consultation_date: new Date().toISOString(),
            last_consultation_date: new Date().toISOString(),
            total_consultations: 0,
          });

        if (relationError && relationError.code !== "23505") {
          throw relationError;
        }

        // Redirigir según de dónde viene
        if (fromCita) {
          router.push(`/dashboard/medico/citas/nueva?paciente=${existingPatient.id}`);
        } else {
          router.push(`/dashboard/medico/pacientes/${existingPatient.id}`);
        }
        return;
      }

      // Crear paciente offline (sin historial clínico)
      const { data: offlinePatient, error: insertError } = await supabase
        .from("offline_patients")
        .insert({
          doctor_id: user.id,
          cedula: formData.cedula,
          nombre_completo: formData.nombre_completo,
          fecha_nacimiento: formData.fecha_nacimiento || null,
          genero: formData.genero || null,
          telefono: formData.telefono || null,
          email: formData.email || null,
          status: "offline",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase.from("user_activity_log").insert({
        user_id: user.id,
        activity_type: "offline_patient_created",
        description: `Paciente registrado: ${formData.nombre_completo} (${formData.cedula})`,
        status: "success",
      });

      // Redirigir según de dónde viene
      if (fromCita) {
        router.push(`/dashboard/medico/citas/nueva?paciente=${offlinePatient.id}`);
      } else {
        router.push(`/dashboard/medico/pacientes/offline/${offlinePatient.id}`);
      }
    } catch (err: any) {
      console.error("Error creating patient:", err);
      setError(err.message || "Error al registrar el paciente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VerificationGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Registrar Paciente</h1>
              <p className="text-gray-600 mt-1">Complete la información básica del paciente</p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="max-w-4xl mx-auto mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Información del Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cédula y Nombre */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cedula" className="text-base font-medium">
                    Cédula <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="cedula"
                      type="text"
                      placeholder="Ej: 12345678"
                      value={formData.cedula}
                      onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                      required
                      className="h-12 text-lg"
                    />
                    {validatingCedula && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      </div>
                    )}
                    {!validatingCedula && cedulaFound && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                  </div>
                  {cedulaFound && !validatingCedula && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Verificado en CNE
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre_completo" className="text-base font-medium">
                    Nombre Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre_completo"
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={formData.nombre_completo}
                    onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                    required
                    disabled={validatingCedula}
                    className={`h-12 text-lg ${cedulaFound ? "bg-green-50 border-green-300" : ""}`}
                  />
                </div>
              </div>

              {/* Género */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Género</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={formData.genero === "M" ? "default" : "outline"}
                    size="lg"
                    className="h-14 text-base"
                    onClick={() => setFormData({ ...formData, genero: "M" })}
                  >
                    Masculino
                  </Button>
                  <Button
                    type="button"
                    variant={formData.genero === "F" ? "default" : "outline"}
                    size="lg"
                    className="h-14 text-base"
                    onClick={() => setFormData({ ...formData, genero: "F" })}
                  >
                    Femenino
                  </Button>
                </div>
              </div>

              {/* Fecha de Nacimiento y Edad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento" className="text-base font-medium">
                    Fecha de Nacimiento
                  </Label>
                  <Input
                    id="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                    className="h-12 text-lg"
                  />
                </div>

                {edad !== null && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Edad</Label>
                    <div className="h-12 px-4 rounded-md border bg-gray-50 flex items-center text-lg font-semibold text-gray-700">
                      {edad} años
                    </div>
                  </div>
                )}
              </div>

              {/* Teléfono y Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="text-base font-medium">
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+58 412 1234567"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="h-12 text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="paciente@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 text-lg"
                  />
                </div>
              </div>

              {/* Nota informativa */}
              <Alert className="bg-blue-50 border-blue-200">
                <Calendar className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Nota:</strong> El historial clínico del paciente será completado por el médico durante la consulta.
                </AlertDescription>
              </Alert>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !formData.cedula || !formData.nombre_completo}
                  size="lg"
                  className="flex-1 h-14 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Guardar Paciente
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  size="lg"
                  className="h-14 text-lg px-8"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VerificationGuard>
  );
}
