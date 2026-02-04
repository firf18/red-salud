"use client";

import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { Eye, Printer, Download } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { MedicationItemData } from "./medication-input";
import { supabase } from "@/lib/supabase/client";
import { getDoctorRecipeSettings, DoctorRecipeSettings } from "@/lib/supabase/services/recipe-settings";
import { VisualRecipePreview } from "./visual-recipe-preview";

interface PatientData {
    nombre: string;
    cedula?: string;
    edad?: number;
    unidadEdad?: string;
    peso?: number;
    sexo?: string;
}

interface DoctorInfo {
    nombre: string;
    titulo?: string;
    especialidad?: string;
    cedulaProfesional: string;
    clinica?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
}

interface RecipePreviewProps {
    patient: PatientData | null;
    medications: MedicationItemData[];
    diagnosis?: string;
    notes?: string;
    doctorInfo?: DoctorInfo;
    fecha?: Date;
}

export function RecipePreview({
    patient,
    medications,
    diagnosis,
    notes,
    doctorInfo: initialDoctorInfo,
    fecha = new Date(),
}: RecipePreviewProps) {
    const [settings, setSettings] = useState<DoctorRecipeSettings | null>(null);
    const [doctorProfile, setDoctorProfile] = useState<DoctorInfo | null>(initialDoctorInfo || null);
    const [loading, setLoading] = useState(true);

    // Fetch settings and profile on mount
    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Fetch Settings
                const { success, data } = await getDoctorRecipeSettings(user.id);
                if (success && data) {
                    setSettings(data);
                }

                // Fetch Profile if not provided
                if (!initialDoctorInfo) {
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", user.id)
                        .single();

                    if (profile) {
                        setDoctorProfile({
                            nombre: `${profile.first_name} ${profile.last_name}`,
                            titulo: "Dr.",
                            especialidad: profile.specialty || "",
                            cedulaProfesional: profile.professional_license || "",
                            clinica: data?.clinic_name || "",
                            direccion: data?.clinic_address || ""
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching preview data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [initialDoctorInfo]);

    // Construct Preview Data
    const previewData = useMemo(() => {
        return {
            doctorName: doctorProfile?.nombre || "Dr. ...",
            doctorTitle: doctorProfile?.titulo || "Dr.",
            doctorSpecialty: doctorProfile?.especialidad || "",
            doctorProfessionalId: doctorProfile?.cedulaProfesional || "",
            clinicName: settings?.clinic_name || doctorProfile?.clinica || "",
            clinicAddress: settings?.clinic_address || doctorProfile?.direccion || "",
            clinicPhone: settings?.clinic_phone || "",
            clinicEmail: settings?.clinic_email || "",
            patientName: patient?.nombre || "Nombre del Paciente",
            patientAge: patient?.edad ? `${patient.edad} ${patient.unidadEdad || "años"}` : "",
            patientWeight: patient?.peso ? `${patient.peso} kg` : "",
            patientSex: patient?.sexo || "",
            date: format(fecha, "dd/MM/yyyy"),
            medications: medications
                .filter(m => m.medicamento)
                .map(m => ({
                    name: m.medicamento + (m.presentacion ? ` (${m.presentacion})` : ""),
                    frequency: m.frecuencia,
                    duration: m.duracion,
                    instructions: m.instrucciones
                })),
            diagnosis: diagnosis || "Diagnóstico..."
        };
    }, [doctorProfile, settings, patient, medications, diagnosis, fecha]);

    // Check if we have enough content to "print" (enable buttons)
    const hasContent = useMemo(() => {
        return (
            patient?.nombre ||
            medications.some((m) => m.medicamento) ||
            diagnosis
        );
    }, [patient, medications, diagnosis]);

    return (
        <Card className="sticky top-6 shadow-lg border-primary/20 overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/40">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="h-5 w-5 text-primary" />
                    Vista Previa
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0 bg-gray-100 flex flex-col items-center gap-4 relative">
                {/* Visual Preview Scaled Down */}
                <div className="w-full overflow-hidden relative flex justify-center py-4 bg-gray-100/50">
                    <div className="transform scale-[0.45] origin-top h-[500px]">
                        <VisualRecipePreview
                            data={previewData}
                            settings={{
                                templateId: settings?.template_id || "plantilla-3",
                                frameColor: settings?.frame_color || "#0da9f7",
                                watermarkUrl: settings?.selected_watermark_url || null,
                                showLogo: true,
                                showSignature: true,
                                logoUrl: settings?.logo_url || null,
                                signatureUrl: settings?.digital_signature_url || null
                            }}
                        />
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="w-full p-4 bg-white border-t space-y-3 z-10">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={!hasContent}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 shadow-sm"
                        >
                            <Printer className="h-4 w-4" />
                            Imprimir
                        </button>
                        <button
                            type="button"
                            disabled={!hasContent}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 shadow-sm"
                        >
                            <Download className="h-4 w-4" />
                            PDF
                        </button>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
