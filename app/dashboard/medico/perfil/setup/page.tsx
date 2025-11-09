"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Shield, AlertCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { getSpecialties } from "@/lib/supabase/services/doctors-service";

import type { MedicalSpecialty } from "@/lib/supabase/types/doctors";
import { fadeInUp, staggerContainer } from "@/lib/animations";

// Schema para verificación SACS
const verificationSchema = z.object({
  tipo_documento: z.string().min(1, "Selecciona el tipo de documento"),
  cedula: z.string()
    .min(6, "Cédula debe tener entre 6 y 10 dígitos")
    .max(10, "Cédula debe tener entre 6 y 10 dígitos")
    .regex(/^\d+$/, "Solo números, sin puntos ni guiones"),
});

// Schema para información adicional
const profileSchema = z.object({
  specialty_id: z.string().min(1, "Selecciona una especialidad"),
  professional_phone: z.string().optional(),
  professional_email: z.string().email("Email inválido").optional().or(z.literal("")),
  bio: z.string().max(500, "Máximo 500 caracteres").optional(),
});

type VerificationFormData = z.infer<typeof verificationSchema>;
type ProfileFormData = z.infer<typeof profileSchema>;

export default function DoctorSetupPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'verification' | 'profile'>('verification');
  const [verifiedData, setVerifiedData] = useState<any>(null);

  // Form para verificación
  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  });

  // Form para perfil
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Verificar si ya completó el setup
        const { data: profile } = await supabase
          .from('profiles')
          .select('cedula_verificada, sacs_verificado')
          .eq('id', user.id)
          .single();
        
        if (profile?.cedula_verificada && profile?.sacs_verificado) {
          // Ya completó el setup, redirigir al dashboard
          router.push("/dashboard/medico");
          return;
        }
      } else {
        router.push("/login/medico");
      }
    };
    getUser();
    loadSpecialties();
  }, [router]);

  const loadSpecialties = async () => {
    const result = await getSpecialties();
    if (result.success && result.data) {
      setSpecialties(result.data);
    }
  };

  // Verificar con SACS
  const onVerify = async (data: VerificationFormData) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Verificando:', data);
      
      // Llamar al servicio de verificación
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
        'verify-doctor-sacs',
        { 
          body: { 
            cedula: data.cedula,
            tipo_documento: data.tipo_documento,
            user_id: userId
          } 
        }
      );

      console.log('Respuesta:', verifyData, verifyError);

      if (verifyError) {
        setError(verifyError.message || 'Error al conectar con el servicio de verificación');
        setIsLoading(false);
        return;
      }

      if (!verifyData?.success || !verifyData?.verified) {
        setError(verifyData?.message || verifyData?.error || 'No se encontró registro en SACS. Verifica el número de cédula.');
        setIsLoading(false);
        return;
      }

      // Guardar datos verificados y pasar al siguiente paso
      setVerifiedData(verifyData.data);
      setStep('profile');
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al verificar con SACS');
    }

    setIsLoading(false);
  };

  // Completar perfil
  const onCompleteProfile = async (data: ProfileFormData) => {
    if (!userId || !verifiedData) return;

    setIsLoading(true);
    setError(null);

    try {
      // Crear o actualizar el perfil del médico
      const { error: upsertError } = await supabase
        .from('doctor_details')
        .upsert({
          profile_id: userId,
          especialidad_id: data.specialty_id,
          licencia_medica: verifiedData.matricula_principal,
          biografia: data.bio,
          verified: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'profile_id'
        });

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      // Actualizar el perfil principal con el nombre completo y datos SACS
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nombre_completo: verifiedData.nombre_completo,
          licencia_medica: verifiedData.matricula_principal,
          especialidad: verifiedData.especialidad_display,
          cedula: verifiedData.cedula,
          cedula_verificada: true,
          sacs_verificado: true,
          sacs_nombre: verifiedData.nombre_completo,
          sacs_matricula: verifiedData.matricula_principal,
          sacs_especialidad: verifiedData.especialidad_display,
          sacs_fecha_verificacion: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Error actualizando profile:', profileError);
      }

      console.log('Perfil completado exitosamente');
      router.push("/dashboard/medico");
      
    } catch (err: any) {
      console.error('Error completando perfil:', err);
      setError(err.message || 'Error al completar perfil');
    }

    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Verificación Profesional
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 'verification' 
              ? 'Verifica tu identidad con el SACS de Venezuela'
              : 'Completa tu perfil profesional'}
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div variants={fadeInUp} className="flex justify-center gap-4">
          <div className={`flex items-center gap-2 ${
            step === 'verification' ? 'text-blue-600' : 'text-green-600'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'verification' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              {step === 'profile' ? <CheckCircle2 className="h-6 w-6" /> : '1'}
            </div>
            <span className="text-sm font-medium">Verificación SACS</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300 self-center" />
          <div className={`flex items-center gap-2 ${
            step === 'profile' ? 'text-blue-600' : 'text-gray-400'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Perfil</span>
          </div>
        </motion.div>

        {/* Verification Step */}
        {step === 'verification' && (
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle>Verificación con SACS</CardTitle>
                <CardDescription>
                  Ingresa tu cédula para verificar tu registro profesional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={verificationForm.handleSubmit(onVerify)} className="space-y-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Verificaremos tu registro en el Servicio Autónomo de Contraloría Sanitaria (SACS) de Venezuela.
                      Este proceso es automático y puede tardar unos segundos.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="tipo_documento">Tipo *</Label>
                      <Select
                        onValueChange={(value: 'V' | 'E') => 
                          verificationForm.setValue("tipo_documento", value)
                        }
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="V">V - Venezolano</SelectItem>
                          <SelectItem value="E">E - Extranjero</SelectItem>
                        </SelectContent>
                      </Select>
                      {verificationForm.formState.errors.tipo_documento && (
                        <p className="text-sm text-red-600 mt-1">
                          {verificationForm.formState.errors.tipo_documento.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="cedula">Número de Cédula *</Label>
                      <Input
                        id="cedula"
                        placeholder="12345678"
                        {...verificationForm.register("cedula")}
                        disabled={isLoading}
                      />
                      {verificationForm.formState.errors.cedula && (
                        <p className="text-sm text-red-600 mt-1">
                          {verificationForm.formState.errors.cedula.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Solo números, sin puntos ni guiones
                      </p>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando con SACS...
                      </>
                    ) : (
                      'Verificar Identidad'
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    Al continuar, aceptas que verifiquemos tu información con datos públicos del SACS
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Profile Step */}
        {step === 'profile' && verifiedData && (
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle>Datos Verificados</CardTitle>
                <CardDescription>
                  Información obtenida del SACS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Datos verificados */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-green-800 font-semibold">
                    <CheckCircle2 className="h-5 w-5" />
                    Verificación Exitosa con SACS
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="md:col-span-2 pb-2 border-b">
                        <span className="text-gray-600 text-xs uppercase tracking-wide">Nombre Completo</span>
                        <p className="font-semibold text-gray-900 text-lg mt-1">{verifiedData.nombre_completo}</p>
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Este nombre no se puede modificar (dato oficial del SACS)
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs uppercase tracking-wide">Documento de Identidad</span>
                        <p className="font-medium text-gray-900 mt-1">{verifiedData.tipo_documento}-{verifiedData.cedula}</p>
                        <p className="text-xs text-gray-500">No modificable</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-xs uppercase tracking-wide">Matrícula Profesional</span>
                        <p className="font-medium text-gray-900 mt-1">{verifiedData.matricula_principal}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600 text-xs uppercase tracking-wide">Profesión Principal</span>
                        <p className="font-medium text-gray-900 mt-1">{verifiedData.profesion_principal}</p>
                      </div>
                      {verifiedData.tiene_postgrados && (
                        <div className="md:col-span-2 pt-2 border-t">
                          <span className="text-gray-600 text-xs uppercase tracking-wide">Especialidad Sugerida</span>
                          <p className="font-medium text-blue-600 mt-1">{verifiedData.especialidad_display}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Basada en tus postgrados registrados en el SACS
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {verifiedData.postgrados && verifiedData.postgrados.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">Postgrados Registrados:</h4>
                      <ul className="space-y-1">
                        {verifiedData.postgrados.map((postgrado: any, index: number) => (
                          <li key={index} className="text-sm text-blue-800">
                            • {postgrado.postgrado} ({postgrado.fecha_registro})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Formulario de perfil */}
                <form onSubmit={profileForm.handleSubmit(onCompleteProfile)} className="space-y-4">
                  <div>
                    <Label htmlFor="specialty">Especialidad en Red-Salud *</Label>
                    <Select
                      onValueChange={(value) => profileForm.setValue("specialty_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tu especialidad" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty.id} value={specialty.id}>
                            {specialty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {profileForm.formState.errors.specialty_id && (
                      <p className="text-sm text-red-600 mt-1">
                        {profileForm.formState.errors.specialty_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="professional_phone">Teléfono Profesional</Label>
                    <Input
                      id="professional_phone"
                      type="tel"
                      placeholder="+58 412 1234567"
                      {...profileForm.register("professional_phone")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="professional_email">Email Profesional</Label>
                    <Input
                      id="professional_email"
                      type="email"
                      placeholder="doctor@clinica.com"
                      {...profileForm.register("professional_email")}
                    />
                    {profileForm.formState.errors.professional_email && (
                      <p className="text-sm text-red-600 mt-1">
                        {profileForm.formState.errors.professional_email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bio">Biografía Profesional</Label>
                    <Textarea
                      id="bio"
                      placeholder="Cuéntanos sobre tu experiencia y enfoque..."
                      rows={4}
                      {...profileForm.register("bio")}
                    />
                    {profileForm.formState.errors.bio && (
                      <p className="text-sm text-red-600 mt-1">
                        {profileForm.formState.errors.bio.message}
                      </p>
                    )}
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setStep('verification');
                        setVerifiedData(null);
                        setError(null);
                      }}
                      disabled={isLoading}
                    >
                      Volver
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creando perfil...
                        </>
                      ) : (
                        'Completar Registro'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
