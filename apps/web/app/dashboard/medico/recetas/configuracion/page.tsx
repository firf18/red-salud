
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Input,
    Label,
    Switch,
    Separator,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Slider,
} from "@red-salud/ui";
import {
    Loader2,
    Save,
    FilePenLine,
    Upload,
    LayoutTemplate,
    ChevronRight,
    CircleCheckBig,
    Crop,
    Square,
    RectangleHorizontal,
    RectangleVertical,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import {
    getDoctorRecipeSettings,
    updateDoctorRecipeSettings,
    uploadRecipeAsset,
    DoctorRecipeSettings,
} from "@/lib/supabase/services/recipe-settings";
import { SignatureCanvas, SignatureCanvasRef } from "@/components/dashboard/medico/recetas/signature-canvas";
import { VisualRecipePreview, VisualRecipeData, VisualRecipeSettings } from "@/components/dashboard/recetas/visual-recipe-preview";

export default function RecipeSettingsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const sigCanvasRef = useRef<SignatureCanvasRef>(null);

    // User Profile Data
    const [userId, setUserId] = useState<string | null>(null);
    const [profileData, setProfileData] = useState({
        nombre_completo: "",
        titulo: "",
        cedula: "",
        especialidad: "",
    });
    const [genderTitle, setGenderTitle] = useState("Dr.");

    // Recipe Settings Data
    // Recipe Settings Data
    const [settings, setSettings] = useState<DoctorRecipeSettings | null>(null);

    // Local state for forms
    const [formData, setFormData] = useState({
        clinic_name: "",
        clinic_address: "",
        clinic_phone: "",
        clinic_email: "",
        use_digital_signature: false,
        use_logo: false,
        template_id: "plantilla-3", // Default updated to match visual preview default
    });

    // Logo Adjustment Modal State
    const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
    const [tempLogoUrl, setTempLogoUrl] = useState<string | null>(null);
    const [tempLogoFile, setTempLogoFile] = useState<File | null>(null);
    const [logoCropShape, setLogoCropShape] = useState<'square' | 'rect-h' | 'rect-c' | 'rect-v'>('square');
    const [logoZoom, setLogoZoom] = useState([1]);

    // Load initial data
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push("/login/medico");
                    return;
                }
                setUserId(user.id);

                // Fetch Profile
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("nombre_completo, especialidad, cedula") // Removed titulo as it doesn't exist
                    .eq("id", user.id)
                    .single();

                if (profile) {
                    setProfileData({
                        nombre_completo: profile.nombre_completo || "",
                        cedula: profile.cedula || "",
                        especialidad: profile.especialidad || "",
                        titulo: (profile as any).titulo || "Médico", // Cast if typescript complains about missing col
                    });
                }

                // Fetch Settings
                const { success, data: settingsData } = await getDoctorRecipeSettings(user.id);
                if (success && settingsData) {
                    setSettings(settingsData);
                    setFormData({
                        clinic_name: settingsData.clinic_name || "",
                        clinic_address: settingsData.clinic_address || "",
                        clinic_phone: settingsData.clinic_phone || "",
                        clinic_email: settingsData.clinic_email || "",
                        use_digital_signature: settingsData.use_digital_signature,
                        use_logo: settingsData.use_logo,
                        template_id: settingsData.template_id || "plantilla-3",
                    });
                }
            } catch (error) {
                console.error("Error loading settings:", error);
                toast.error("Error cargando la configuración");
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [router]);

    const handleProfileChange = (field: string, value: string) => {
        setProfileData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSettingsChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSaveSignature = async () => {
        if (!userId || !sigCanvasRef.current) return;

        if (sigCanvasRef.current.isEmpty()) {
            toast.error("Por favor dibuje una firma antes de guardar");
            return;
        }

        try {
            const dataUrl = sigCanvasRef.current.toDataURL();
            // Convert DataURL to File
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], "signature.png", { type: "image/png" });

            const { success, url, error } = await uploadRecipeAsset(userId, file, "signature");

            if (success && url) {
                await updateDoctorRecipeSettings(userId, { digital_signature_url: url });
                setSettings((prev) => prev ? ({ ...prev, digital_signature_url: url }) : null);
                toast.success("Firma guardada exitosamente");
                sigCanvasRef.current.clear();
            } else {
                throw error;
            }
        } catch (error) {
            console.error("Error saving signature:", error);
            toast.error("Error al guardar la firma");
        }
    };

    const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        setTempLogoUrl(objectUrl);
        setTempLogoFile(file);
        setIsLogoModalOpen(true);

        // Reset file input
        e.target.value = "";
    };

    const handleSaveLogoFromModal = async () => {
        if (!userId || !tempLogoFile) return;

        try {
            // In a real implementation, we would crop here using a canvas based on cropShape and zoom
            // For now, we proceed with the original file upload but mimicking the UX
            const { success, url, error } = await uploadRecipeAsset(userId, tempLogoFile, "logo");

            if (success && url) {
                await updateDoctorRecipeSettings(userId, { logo_url: url });
                setSettings((prev) => prev ? ({ ...prev, logo_url: url }) : null);
                toast.success("Logo guardado exitosamente");
                setIsLogoModalOpen(false);
                setTempLogoUrl(null);
                setTempLogoFile(null);
            } else {
                throw error;
            }
        } catch (error) {
            console.error("Error uploading logo:", error);
            toast.error("Error al guardar el logo");
        }
    };

    const handleSaveAll = async () => {
        if (!userId) return;
        setIsSaving(true);
        try {
            // Update Profile (Partial) - Only fields that are editable here and sync back to profiles
            // Note: Updating core profile data here might require separate service call
            const { error: profileError } = await supabase
                .from("profiles")
                .update({
                    nombre_completo: profileData.nombre_completo,
                    especialidad: profileData.especialidad,
                    cedula: profileData.cedula,
                    // titulo might need a column or separate metadata table if not in profiles
                })
                .eq("id", userId);

            if (profileError) throw profileError;

            // Update Settings
            const { success, error } = await updateDoctorRecipeSettings(userId, {
                clinic_name: formData.clinic_name,
                clinic_address: formData.clinic_address,
                clinic_phone: formData.clinic_phone,
                clinic_email: formData.clinic_email,
                use_digital_signature: formData.use_digital_signature,
                use_logo: formData.use_logo,
                template_id: formData.template_id,
            });

            if (!success) throw error;

            toast.success("Configuración guardada correctamente");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Error al guardar los cambios");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:px-6 sm:py-0 space-y-8 pb-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Configuración</h1>
                    <p className="text-muted-foreground">
                        Gestiona la información de tu perfil y la apariencia de las recetas.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">

                    {/* Personal Info */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <div className="text-2xl font-semibold leading-none tracking-tight">
                                Información Personal del Médico
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Datos personales y profesionales del médico que aparecerán en la receta.
                            </div>
                        </div>
                        <div className="p-6 pt-0 grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="doctor_name">Nombre Completo</Label>
                                    <Input
                                        id="doctor_name"
                                        value={profileData.nombre_completo}
                                        onChange={(e) => handleProfileChange("nombre_completo", e.target.value)}
                                        placeholder="Dr. Juan Pérez"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="doctor_gender">Trato</Label>
                                    <Select value={genderTitle} onValueChange={setGenderTitle}>
                                        <SelectTrigger id="doctor_gender">
                                            <SelectValue placeholder="Selecciona" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Dr.">Dr.</SelectItem>
                                            <SelectItem value="Dra.">Dra.</SelectItem>
                                            <SelectItem value="Lic.">Lic.</SelectItem>
                                            <SelectItem value="Mtro.">Mtro.</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="titulo">Título</Label>
                                    <Input
                                        id="titulo"
                                        value={profileData.titulo}
                                        onChange={(e) => handleProfileChange("titulo", e.target.value)}
                                        placeholder="Médico, Dentista, etc."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="professional_id">Cédula Profesional</Label>
                                    <Input
                                        id="professional_id"
                                        value={profileData.cedula}
                                        onChange={(e) => handleProfileChange("cedula", e.target.value)}
                                        placeholder="12345678"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="specialty">Especialidad Médica</Label>
                                    <Input
                                        id="specialty"
                                        value={profileData.especialidad}
                                        onChange={(e) => handleProfileChange("especialidad", e.target.value)}
                                        placeholder="Cardiología"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Clinic Info */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <div className="text-2xl font-semibold leading-none tracking-tight">
                                Información del Consultorio
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Datos del consultorio, clínica o lugar de práctica profesional.
                            </div>
                        </div>
                        <div className="p-6 pt-0 grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="clinic_name">Nombre de la Clínica/Hospital</Label>
                                    <Input
                                        id="clinic_name"
                                        value={formData.clinic_name}
                                        onChange={(e) => handleSettingsChange("clinic_name", e.target.value)}
                                        placeholder="Clínica del Sol"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Domicilio del Consultorio</Label>
                                    <Input
                                        id="address"
                                        value={formData.clinic_address}
                                        onChange={(e) => handleSettingsChange("clinic_address", e.target.value)}
                                        placeholder="Av. Siempre Viva 742"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Número de Teléfono</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.clinic_phone}
                                        onChange={(e) => handleSettingsChange("clinic_phone", e.target.value)}
                                        placeholder="55 1234 5678"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.clinic_email}
                                        onChange={(e) => handleSettingsChange("clinic_email", e.target.value)}
                                        placeholder="dr.juan@ejemplo.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recipe Customization (Signature & Logo) */}
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <div className="text-2xl font-semibold leading-none tracking-tight">
                                Personalización de Receta
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Personalice el aspecto de sus recetas con logos, firmas y plantillas.
                            </div>
                        </div>
                        <div className="p-6 pt-0 grid gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                                {/* Digital Signature */}
                                <div className="grid gap-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-semibold">Firma Digital</Label>
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor="use-digital-signature" className="cursor-pointer">
                                                Usar en recetas
                                            </Label>
                                            <Switch
                                                id="use-digital-signature"
                                                checked={formData.use_digital_signature}
                                                onCheckedChange={(c) => handleSettingsChange("use_digital_signature", c)}
                                            />
                                        </div>
                                    </div>

                                    {formData.use_digital_signature && (
                                        <div className="p-3 rounded-lg border-2 border-primary/20 bg-primary/5 fade-in slide-in-from-top-2 animate-in duration-300">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FilePenLine className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium text-primary">
                                                    Firma Digital Activa
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Tu firma digital aparecerá automáticamente en todas las recetas.
                                            </p>
                                        </div>
                                    )}

                                    <div className="w-full aspect-video border rounded-md bg-white dark:bg-slate-100 overflow-hidden relative">
                                        <SignatureCanvas
                                            ref={sigCanvasRef}
                                            className="w-full h-full"
                                        />
                                    </div>

                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => sigCanvasRef.current?.clear()}
                                            >
                                                Limpiar
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveSignature}
                                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                            >
                                                Guardar Firma
                                            </Button>
                                        </div>
                                        {settings?.digital_signature_url && (
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                                    Firma actual:
                                                </p>
                                                <div className="bg-slate-200 rounded p-1 inline-block">
                                                    <Image
                                                        src={settings.digital_signature_url}
                                                        alt="Firma Guardada"
                                                        width={80}
                                                        height={40}
                                                        className="object-contain"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Dibuje en el recuadro y presione 'Guardar Firma' para actualizar.
                                    </p>
                                </div>

                                {/* Logo */}
                                <div className="grid gap-6">
                                    <div className="grid gap-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-semibold">Logotipo</Label>
                                            <div className="flex items-center space-x-2">
                                                <Label htmlFor="use-logo" className="cursor-pointer">
                                                    Mostrar en recetas
                                                </Label>
                                                <Switch
                                                    id="use-logo"
                                                    checked={formData.use_logo}
                                                    onCheckedChange={(c) => handleSettingsChange("use_logo", c)}
                                                />
                                            </div>
                                        </div>

                                        {formData.use_logo && (
                                            <div className="p-3 rounded-lg border-2 border-primary/20 bg-primary/5 fade-in slide-in-from-top-2 animate-in duration-300">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <FilePenLine className="h-4 w-4 text-primary" />
                                                    <span className="text-sm font-medium text-primary">
                                                        Logo Visible
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Sube un logo para que aparezca automáticamente en las recetas.
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <Input
                                                id="logo-upload"
                                                type="file"
                                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                                className="hidden"
                                                onChange={handleLogoFileSelect}
                                            />
                                            <Button
                                                variant="outline"
                                                className="w-full flex gap-2"
                                                onClick={() => document.getElementById('logo-upload')?.click()}
                                            >
                                                <Upload className="h-4 w-4" />
                                                Seleccionar Archivo
                                            </Button>
                                        </div>
                                        <div className="flex justify-center h-24 items-center border rounded-md border-dashed bg-muted/30">
                                            {settings?.logo_url ? (
                                                <div className="relative w-full h-full p-2">
                                                    <Image
                                                        src={settings.logo_url}
                                                        alt="Logo Actual"
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Ningún archivo seleccionado</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Selecciona una imagen y ajústala para obtener el mejor resultado. Se recomienda usar PNG con transparencias.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Templates */}
                <div className="space-y-6">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm sticky top-6">
                        <div className="flex flex-col space-y-1.5 p-6">
                            <div className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2">
                                <LayoutTemplate className="h-5 w-5 text-primary" />
                                Plantilla de Receta
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Selecciona y personaliza el diseño de tus recetas médicas
                            </div>
                        </div>
                        <div className="p-6 pt-0 space-y-6">
                            <div className="space-y-4">
                                <div className="text-center">
                                    {/* Placeholder for template preview - static for now as per design */}
                                    <div className="mx-auto rounded-lg overflow-hidden bg-gray-100 shadow-lg relative w-full flex justify-center">
                                        <div className="transform scale-[0.4] origin-top h-[450px]">
                                            <VisualRecipePreview
                                                data={{
                                                    doctorName: profileData.nombre_completo || "Juan Pérez",
                                                    doctorTitle: genderTitle || "Dr.",
                                                    doctorSpecialty: profileData.especialidad || "Cardiología",
                                                    doctorProfessionalId: profileData.cedula || "12345678",
                                                    clinicName: formData.clinic_name || "Clínica del Sol",
                                                    clinicAddress: formData.clinic_address || "Av. Siempre Viva 742",
                                                    clinicPhone: formData.clinic_phone || "55 1234 5678",
                                                    clinicEmail: formData.clinic_email || "dr.juan@example.com",
                                                    patientName: "Paciente Ejemplo",
                                                    patientAge: "30 años",
                                                    patientWeight: "70 kg",
                                                    patientSex: "M",
                                                    date: new Date().toLocaleDateString(),
                                                    medications: [
                                                        { name: "Paracetamol", frequency: "Cada 8 horas", duration: "3 días", presentation: "500mg" },
                                                        { name: "Ibuprofeno", frequency: "Cada 12 horas", duration: "5 días", presentation: "400mg" }
                                                    ],
                                                    diagnosis: "Fiebre y dolor general"
                                                }}
                                                settings={{
                                                    templateId: formData.template_id,
                                                    frameColor: settings?.frame_color || "#0da9f7",
                                                    watermarkUrl: settings?.selected_watermark_url,
                                                    logoUrl: settings?.logo_url,
                                                    signatureUrl: settings?.digital_signature_url,
                                                    showLogo: formData.use_logo,
                                                    showSignature: formData.use_digital_signature
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <h4 className="font-semibold text-primary">Plantilla Selecciónada</h4>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>Cambiar Plantilla</Label>
                                    <Select
                                        value={formData.template_id}
                                        onValueChange={(v) => handleSettingsChange("template_id", v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione una plantilla" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="plantilla-3">Plantilla 3 (Moderna)</SelectItem>
                                            <SelectItem value="plantilla-1">Plantilla 1 (Clásica)</SelectItem>
                                            <SelectItem value="plantilla-2">Plantilla 2 (Con Marco)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator />

                                <Link href="/dashboard/medico/recetas/plantillas" className="w-full">
                                    <Button className="w-full">
                                        Editor de Plantillas de Receta <ChevronRight className="ml-auto h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logo Adjustment Modal */}
            <Dialog open={isLogoModalOpen} onOpenChange={setIsLogoModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Crop className="h-5 w-5" /> Ajustar Logo
                        </DialogTitle>
                        <CardDescription>
                            Ajusta tu logo para que se vea perfecto en todas las recetas. El logo se redimensionará automáticamente.
                        </CardDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-3">
                            <Label>Formato del Logo</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setLogoCropShape('square')}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${logoCropShape === 'square' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Square className="h-4 w-4" />
                                        <span className="text-sm font-medium">Cuadrado</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Perfecto para logos simples</p>
                                    <p className="text-xs text-muted-foreground mt-1">Máx: 200×200px</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLogoCropShape('rect-h')}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${logoCropShape === 'rect-h' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <RectangleHorizontal className="h-4 w-4" />
                                        <span className="text-sm font-medium">Horizontal</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Ideal para logos con texto</p>
                                    <p className="text-xs text-muted-foreground mt-1">Máx: 280×158px</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLogoCropShape('rect-c')}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${logoCropShape === 'rect-c' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <RectangleHorizontal className="h-4 w-4" />
                                        <span className="text-sm font-medium">H. Compacto</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Balance entre ancho y alto</p>
                                    <p className="text-xs text-muted-foreground mt-1">Máx: 240×180px</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLogoCropShape('rect-v')}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${logoCropShape === 'rect-v' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <RectangleVertical className="h-4 w-4" />
                                        <span className="text-sm font-medium">Vertical</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Para logos altos/texto vertical</p>
                                    <p className="text-xs text-muted-foreground mt-1">Máx: 158×280px</p>
                                </button>
                            </div>
                        </div>

                        <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {/* Mock Crop Area */}
                            {tempLogoUrl && (
                                <img
                                    src={tempLogoUrl}
                                    className="max-h-full max-w-full object-contain"
                                    style={{ transform: `scale(${logoZoom[0]})` }}
                                    alt="Logo preview"
                                />
                            )}
                            <div className="absolute inset-0 pointer-events-none border-2 border-primary/50 opacity-50"></div>
                        </div>

                        <div className="space-y-2">
                            <Label>Zoom</Label>
                            <Slider
                                value={logoZoom}
                                onValueChange={setLogoZoom}
                                min={1}
                                max={3}
                                step={0.1}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsLogoModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveLogoFromModal}>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Logo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    size="lg"
                    className="shadow-lg gap-2"
                    onClick={handleSaveAll}
                    disabled={isSaving}
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CircleCheckBig className="h-4 w-4" />}
                    Guardar Cambios
                </Button>
            </div>
        </div>
    );
}
