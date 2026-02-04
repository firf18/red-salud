"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { Label } from "@red-salud/ui";
import { Input } from "@red-salud/ui";
import { Textarea } from "@red-salud/ui";
import { Pill, Save, ArrowLeft, Loader2, Plus, FileText, Sparkles, Camera, Zap } from "lucide-react";
import { VerificationGuard } from "@/components/dashboard/medico/features/verification-guard";
import { PatientSelector } from "@/components/dashboard/recetas/patient-selector";
import { usePatientsList } from "@/components/dashboard/medico/patients/hooks/usePatientsList";
import { createPrescription } from "@/lib/supabase/services/medications-service";
import { MedicationInput, RecipePreview, type MedicationItemData } from "@/components/dashboard/recetas";
import { toast } from "sonner";

// Use the enhanced MedicationItemData type from components

export default function NewPrescriptionPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const { state: patientsState } = usePatientsList(userId);

    // Estado para el selector de métodos
    const [showMethodSelector, setShowMethodSelector] = useState(true);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    const [selectedPatientId, setSelectedPatientId] = useState<string>("");
    const [diagnosis, setDiagnosis] = useState("");
    const [notes, setNotes] = useState("");
    const [medications, setMedications] = useState<MedicationItemData[]>([
        {
            medicamento: "",
            presentacion: "",
            dosis: "",
            frecuencia: "",
            duracion: "",
            viaAdministracion: "Oral",
            instrucciones: ""
        }
    ]);
    const [submitting, setSubmitting] = useState(false);

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

    const handleSelectMethod = (method: string) => {
        setSelectedMethod(method);
        setShowMethodSelector(false);

        // Manejar cada método
        switch (method) {
            case 'template':
                // Proceed to recipe creation using the configured template
                toast.success("Usando plantilla configurada");
                break;
            case 'personalizada':
                // Continuar con la receta personalizada (quedarse en esta página)
                break;
            case 'escanear':
                // TODO: Navegar a escaneo (funcionalidad futura)
                toast.info("La funcionalidad de escaneo estará disponible pronto");
                setShowMethodSelector(true);
                setSelectedMethod(null);
                break;
            case 'rapida':
                // Receta rápida sin template
                break;
        }
    };

    const handleBackToSelector = () => {
        setShowMethodSelector(true);
        setSelectedMethod(null);
    };

    const handleAddMedication = () => {
        setMedications([...medications, {
            medicamento: "",
            presentacion: "",
            dosis: "",
            frecuencia: "",
            duracion: "",
            viaAdministracion: "Oral",
            instrucciones: ""
        }]);
    };

    const handleRemoveMedication = (index: number) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const handleMedicationChange = (index: number, field: keyof MedicationItemData, value: string) => {
        const newMedications = [...medications];
        newMedications[index] = { ...newMedications[index], [field]: value };
        setMedications(newMedications);
    };

    const handleSubmit = async () => {
        if (!userId || !selectedPatientId || !diagnosis || medications.some(m => !m.medicamento)) {
            toast.error("Por favor complete los campos requeridos");
            return;
        }

        setSubmitting(true);
        try {
            const result = await createPrescription({
                paciente_id: selectedPatientId,
                medico_id: userId,
                diagnostico: diagnosis,
                notas: notes,
                medications: medications.map(m => ({
                    medication_id: m.medicationId,
                    nombre_medicamento: m.medicamento,
                    dosis: m.dosis,
                    frecuencia: m.frecuencia,
                    via_administracion: m.viaAdministracion,
                    duracion_dias: m.duracion ? parseInt(m.duracion) || undefined : undefined,
                    instrucciones_especiales: m.instrucciones || undefined,
                }))
            });

            if (result.success) {
                toast.success("Receta creada exitosamente");
                router.push("/dashboard/medico/recetas");
            } else {
                throw new Error((result.error as Error)?.message || "Error al crear la receta");
            }
        } catch (error: unknown) {
            console.error("Error creating prescription:", error);
            const errorMessage = error instanceof Error ? error.message : "Error al crear la recipe";
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // Combine registered and offline patients for the selector
    const allPatients = [
        ...patientsState.patients.map(p => ({
            id: p.patient_id,
            nombre_completo: p.patient.nombre_completo,
            email: p.patient.email,
            type: 'registered'
        })),
        ...patientsState.offlinePatients.map(p => ({
            id: p.id,
            nombre_completo: p.nombre_completo,
            cedula: p.cedula,
            type: 'offline'
        }))
    ];

    return (
        <VerificationGuard>
            <div className="container mx-auto px-4 py-8 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={showMethodSelector ? () => router.back() : handleBackToSelector}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {showMethodSelector ? 'Volver' : 'Cambiar Método'}
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nueva Recipe Médica</h1>
                        <p className="text-gray-600 mt-1">
                            {showMethodSelector ? 'Selecciona el método para crear la recipe' : 'Emite una nueva recipe para tus pacientes'}
                        </p>
                    </div>
                </div>

                {/* Selector de Métodos */}
                {showMethodSelector && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {/* Template del Sistema */}
                        <Card
                            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-500 group"
                            onClick={() => handleSelectMethod('template')}
                        >
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Sparkles className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-xl">Template del Sistema</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-sm text-gray-600 mb-4">
                                    Usa un formato predeterminado profesional con logo Esculapio
                                </p>
                                <div className="flex flex-wrap gap-1 justify-center">
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">General</span>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Pediatria</span>
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Cardiología</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Template Personalizado */}
                        <Card
                            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-purple-500 group"
                            onClick={() => handleSelectMethod('personalizada')}
                        >
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <FileText className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-xl">Personalizada</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-sm text-gray-600 mb-4">
                                    Crea tu propio formato o edita uno existente con el editor visual
                                </p>
                                <div className="flex flex-wrap gap-1 justify-center">
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Editor WYSIWYG</span>
                                    <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">Drag & Drop</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Escanear Recipe */}
                        <Card
                            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-500 group"
                            onClick={() => handleSelectMethod('escanear')}
                        >
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-xl">Escanear Recipe</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-sm text-gray-600 mb-4">
                                    Escanea una recipe física y el sistema extraerá los datos con OCR
                                </p>
                                <div className="flex flex-wrap gap-1 justify-center">
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Cámara</span>
                                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded">OCR</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recipe Rápida */}
                        <Card
                            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-amber-500 group"
                            onClick={() => handleSelectMethod('rapida')}
                        >
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Zap className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-xl">Recipe Rápida</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <p className="text-sm text-gray-600 mb-4">
                                    Crea una recipe rápidamente sin template, solo lo esencial
                                </p>
                                <div className="flex flex-wrap gap-1 justify-center">
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Rápido</span>
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Simple</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Formulario de Receta (solo se muestra si NO está en el selector) */}
                {!showMethodSelector && (

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <PatientSelector
                                patients={allPatients}
                                loadingPatients={patientsState.loading}
                                selectedPatientId={selectedPatientId}
                                onPatientSelect={setSelectedPatientId}
                            />

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Pill className="h-5 w-5" />
                                        Medicamentos
                                    </CardTitle>
                                    <Button variant="outline" size="sm" onClick={handleAddMedication}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Agregar Medicamento
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {medications.map((medication, index) => (
                                        <MedicationInput
                                            key={index}
                                            index={index}
                                            data={medication}
                                            onChange={handleMedicationChange}
                                            onRemove={handleRemoveMedication}
                                            canRemove={medications.length > 1}
                                        />
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Diagnosis and Notes Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Detalles de la Receta</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Diagnóstico <span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="Diagnóstico principal"
                                            value={diagnosis}
                                            onChange={(e) => setDiagnosis(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Notas Adicionales</Label>
                                        <Textarea
                                            placeholder="Observaciones o recomendaciones..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={4}
                                        />
                                    </div>

                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={handleSubmit}
                                        disabled={submitting || !selectedPatientId || !diagnosis || medications.some(m => !m.medicamento)}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Creando Receta...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Emitir Receta
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Preview Column */}
                        <div className="space-y-6">
                            <RecipePreview
                                patient={selectedPatientId ? {
                                    nombre: allPatients.find(p => p.id === selectedPatientId)?.nombre_completo || '',
                                    cedula: allPatients.find(p => p.id === selectedPatientId && 'cedula' in p)?.cedula as string | undefined,
                                } : null}
                                medications={medications}
                                diagnosis={diagnosis}
                                notes={notes}
                            />
                        </div>
                    </div>
                )}
            </div>
        </VerificationGuard>
    );
}
