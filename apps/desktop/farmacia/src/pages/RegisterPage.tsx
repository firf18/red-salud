import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    FileText,
    MapPin,
    User,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Upload,
    CheckCircle2,
    AlertCircle,
    Pill,
    Camera
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type Step = 1 | 2 | 3 | 4 | 5;

export default function RegisterPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [verifyingRif, setVerifyingRif] = useState(false);
    const [captchaData, setCaptchaData] = useState<{ url: string; session: string } | null>(null);
    const [captchaInput, setCaptchaInput] = useState('');
    const [showCaptcha, setShowCaptcha] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        rif: '',
        businessName: '',
        mercantileNumber: '',
        sanitaryLicense: '',
        address: '',
        city: '',
        state: '',
        legalRepName: '',
        legalRepCi: '',
        legalRepPhone: '',
        legalRepEmail: '',
    });

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        mercantileDoc: null,
        sanitaryDoc: null,
        zoningDoc: null,
    });

    const updateFormData = (data: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
        }
    };

    const nextStep = () => setStep(prev => (prev < 5 ? (prev + 1) as Step : prev));
    const prevStep = () => setStep(prev => (prev > 1 ? (prev - 1) as Step : prev));

    const fetchCaptcha = async () => {
        setVerifyingRif(true);
        try {
            const { data, error } = await supabase.functions.invoke('verify-rif', {
                body: { action: 'get-captcha' }
            });
            if (error) throw error;
            setCaptchaData({ url: data.captchaUrl, session: data.session });
            setShowCaptcha(true);
        } catch (error) {
            console.error(error);
            toast.error('Error al conectar con el SENIAT');
        } finally {
            setVerifyingRif(false);
        }
    };

    const verifyRif = async () => {
        if (!formData.rif || !captchaInput) {
            toast.error('Ingresa el RIF y el código de seguridad');
            return;
        }
        setVerifyingRif(true);
        try {
            const { data, error } = await supabase.functions.invoke('verify-rif', {
                body: {
                    action: 'validate',
                    rif: formData.rif,
                    captcha: captchaInput,
                    session: captchaData?.session
                }
            });
            if (error) throw error;
            if (data.success) {
                updateFormData({ businessName: data.businessName });
                setShowCaptcha(false);
                toast.success('Razón Social validada');
            } else {
                toast.error('RIF o Código incorrectos');
                fetchCaptcha(); // Refresh captcha
            }
        } catch (error) {
            toast.error('Error en la validación');
        } finally {
            setVerifyingRif(false);
        }
    };

    const uploadFile = async (file: File, bucket: string, path: string) => {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file);
        if (error) throw error;
        return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // 1. Get current profile ID (assuming user is logged in or we create one)
            // For registration flow, usually we do this AFTER auth.
            // But if this is a "pre-registration", we might want to collect it first.

            const { data: { user } } = await supabase.auth.getUser();

            let mercUrl = '', sanUrl = '', zonUrl = '';

            if (files.mercantileDoc)
                mercUrl = await uploadFile(files.mercantileDoc, 'documents', `pharmacy/${formData.rif}/mercantile_${Date.now()}`);
            if (files.sanitaryDoc)
                sanUrl = await uploadFile(files.sanitaryDoc, 'documents', `pharmacy/${formData.rif}/sanitary_${Date.now()}`);
            if (files.zoningDoc)
                zonUrl = await uploadFile(files.zoningDoc, 'documents', `pharmacy/${formData.rif}/zoning_${Date.now()}`);

            const { error } = await supabase.from('pharmacy_details').insert({
                profile_id: user?.id,
                rif: formData.rif,
                business_name: formData.businessName,
                mercantile_register_number: formData.mercantileNumber,
                mercantile_register_doc_url: mercUrl,
                sanitary_license_number: formData.sanitaryLicense,
                sanitary_license_doc_url: sanUrl,
                zoning_permit_doc_url: zonUrl,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                legal_representative_name: formData.legalRepName,
                legal_representative_ci: formData.legalRepCi,
                legal_representative_phone: formData.legalRepPhone,
                legal_representative_email: formData.legalRepEmail,
                verification_status: 'pending'
            });

            if (error) throw error;

            toast.success('Registro enviado para validación');
            setTimeout(() => navigate('/'), 3000);
        } catch (error: any) {
            toast.error(error.message || 'Error al procesar el registro');
        } finally {
            setLoading(false);
        }
    };

    const premiumEasing = [0.16, 1, 0.3, 1];

    const stepVariants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.6, ease: premiumEasing } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.4, ease: premiumEasing } }
    };

    return (
        <div className="min-h-screen bg-[#070b14] text-white font-sans overflow-hidden relative flex flex-col justify-center items-center py-12 px-4">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="w-full max-w-2xl z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex p-3 bg-primary/20 rounded-2xl mb-4 border border-primary/30"
                    >
                        <Pill className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Registro de Farmacia</h1>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto">
                        Únete a la red farmacéutica más grande de Venezuela. Proceso de validación profesional.
                    </p>
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-3 mb-12">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all duration-500 ${step === s ? 'w-8 bg-primary shadow-[0_0_15px_rgba(244,63,94,0.5)]' :
                                step > s ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-800'
                                }`}
                        />
                    ))}
                </div>

                {/* Form Container */}
                <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/[0.08] shadow-2xl p-8 md:p-12 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" {...stepVariants} className="space-y-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-slate-800/50 rounded-xl">
                                        <ShieldCheck className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Identificación Fiscal</h2>
                                        <p className="text-xs text-slate-500">Validación oficial ante el SENIAT</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">RIF de la Empresa</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={formData.rif}
                                                onChange={(e) => updateFormData({ rif: e.target.value.toUpperCase() })}
                                                placeholder="J-12345678-9"
                                                className="flex-1 bg-slate-800/30 border border-slate-700/50 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-bold"
                                            />
                                            <button
                                                onClick={showCaptcha ? verifyRif : fetchCaptcha}
                                                disabled={verifyingRif}
                                                className="bg-slate-800 hover:bg-slate-700 text-white px-6 rounded-xl transition-all flex items-center justify-center min-w-[140px]"
                                            >
                                                {verifyingRif ? <Loader2 className="w-5 h-5 animate-spin" /> : showCaptcha ? "Confirmar" : "Validar RIF"}
                                            </button>
                                        </div>
                                    </div>

                                    {showCaptcha && captchaData && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-4 pt-2"
                                        >
                                            <div className="flex flex-col items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <img
                                                    src={captchaData.url}
                                                    alt="Captcha SENIAT"
                                                    className="h-12 rounded filter invert"
                                                />
                                                <input
                                                    type="text"
                                                    value={captchaInput}
                                                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                                                    placeholder="Introduce el código"
                                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2 text-center font-black tracking-widest focus:ring-2 focus:ring-primary/40 outline-none"
                                                />
                                                <button
                                                    onClick={fetchCaptcha}
                                                    className="text-[8px] font-black text-slate-500 hover:text-primary uppercase"
                                                >
                                                    Recargar imagen
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {formData.businessName && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
                                        >
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            <div>
                                                <p className="text-[8px] font-black text-emerald-500/60 uppercase">Razón Social Encontrada</p>
                                                <p className="text-sm font-bold text-emerald-100">{formData.businessName}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" {...stepVariants} className="space-y-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-slate-800/50 rounded-xl">
                                        <Building2 className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Registro Mercantil</h2>
                                        <p className="text-xs text-slate-500">Documentación legal de la entidad</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Número de Registro</label>
                                        <input
                                            type="text"
                                            value={formData.mercantileNumber}
                                            onChange={(e) => updateFormData({ mercantileNumber: e.target.value })}
                                            placeholder="Ej: Tomo 45-A, Folio 123"
                                            className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type="file"
                                            id="mercantile"
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(e, 'mercantileDoc')}
                                        />
                                        <label
                                            htmlFor="mercantile"
                                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-700/50 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                                        >
                                            {files.mercantileDoc ? (
                                                <div className="flex items-center gap-3 text-emerald-400 font-bold">
                                                    <CheckCircle2 /> {files.mercantileDoc.name}
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 text-slate-500 mb-2 group-hover:text-primary transition-colors" />
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subir Acta Constitutiva (PDF/JPG)</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" {...stepVariants} className="space-y-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-slate-800/50 rounded-xl">
                                        <FileText className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Permisos Sanitarios</h2>
                                        <p className="text-xs text-slate-500">Licencia otorgada por el Ministerio de Salud / SACS</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">N° de Licencia Sanitaria</label>
                                        <input
                                            type="text"
                                            value={formData.sanitaryLicense}
                                            onChange={(e) => updateFormData({ sanitaryLicense: e.target.value })}
                                            placeholder="Ej: SACS-F-2024-XXXX"
                                            className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type="file"
                                            id="sanitary"
                                            className="hidden"
                                            onChange={(e) => handleFileUpload(e, 'sanitaryDoc')}
                                        />
                                        <label
                                            htmlFor="sanitary"
                                            className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-700/50 rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                                        >
                                            {files.sanitaryDoc ? (
                                                <div className="flex items-center gap-3 text-emerald-400 font-bold">
                                                    <CheckCircle2 /> {files.sanitaryDoc.name}
                                                </div>
                                            ) : (
                                                <>
                                                    <Camera className="w-8 h-8 text-slate-500 mb-2 group-hover:text-primary transition-colors" />
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Foto del Permiso Sanitario</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" {...stepVariants} className="space-y-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-slate-800/50 rounded-xl">
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Ubicación y Sede</h2>
                                        <p className="text-xs text-slate-500">Dirección física del establecimiento</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Estado</label>
                                            <input
                                                type="text"
                                                value={formData.state}
                                                onChange={(e) => updateFormData({ state: e.target.value })}
                                                placeholder="Ej: Miranda"
                                                className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl px-5 py-4 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Ciudad</label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => updateFormData({ city: e.target.value })}
                                                placeholder="Ej: Caracas"
                                                className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl px-5 py-4 font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Dirección Completa</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => updateFormData({ address: e.target.value })}
                                            rows={3}
                                            placeholder="Calle, Av, Edificio..."
                                            className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl px-5 py-4 font-bold resize-none"
                                        />
                                    </div>

                                    <div className="p-4 bg-slate-800/20 rounded-2xl border border-white/[0.03] text-center">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Conformidad de Uso</p>
                                        <input type="file" id="zoning" className="hidden" onChange={(e) => handleFileUpload(e, 'zoningDoc')} />
                                        <label htmlFor="zoning" className="text-[10px] font-black text-primary hover:text-rose-400 cursor-pointer transition-colors">
                                            {files.zoningDoc ? `ARCHIVO: ${files.zoningDoc.name}` : "SUBIR CERTIFICADO DE ZONIFICACIÓN"}
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && (
                            <motion.div key="step5" {...stepVariants} className="space-y-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-slate-800/50 rounded-xl">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Representante Legal</h2>
                                        <p className="text-xs text-slate-500">Datos de la persona responsable</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nombre Completo</label>
                                        <input
                                            type="text"
                                            value={formData.legalRepName}
                                            onChange={(e) => updateFormData({ legalRepName: e.target.value })}
                                            placeholder="Nombre del apoderado"
                                            className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl px-5 py-4 font-bold"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Cédula</label>
                                            <input
                                                type="text"
                                                value={formData.legalRepCi}
                                                onChange={(e) => updateFormData({ legalRepCi: e.target.value })}
                                                placeholder="V-12345678"
                                                className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl px-5 py-4 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Teléfono</label>
                                            <input
                                                type="text"
                                                value={formData.legalRepPhone}
                                                onChange={(e) => updateFormData({ legalRepPhone: e.target.value })}
                                                placeholder="+58-XXX-XXXXXX"
                                                className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl px-5 py-4 font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Email de Contacto</label>
                                        <input
                                            type="email"
                                            value={formData.legalRepEmail}
                                            onChange={(e) => updateFormData({ legalRepEmail: e.target.value })}
                                            placeholder="legal@empresa.com"
                                            className="w-full bg-slate-800/30 border border-slate-700/40 rounded-xl px-5 py-4 font-bold"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex gap-4 mt-12 border-t border-white/[0.05] pt-8">
                        {step > 1 && (
                            <button
                                onClick={prevStep}
                                className="flex items-center gap-2 px-6 py-4 bg-slate-800/50 hover:bg-slate-800 rounded-2xl transition-all font-bold text-slate-300"
                            >
                                <ArrowLeft className="w-4 h-4" /> Anterior
                            </button>
                        )}

                        <button
                            onClick={step === 5 ? handleSubmit : nextStep}
                            disabled={loading || (step === 1 && !formData.businessName)}
                            className="flex-1 flex items-center justify-center gap-3 bg-primary hover:bg-rose-600 text-white font-black rounded-2xl py-4 shadow-xl transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : step === 5 ? (
                                <>Finalizar Registro <CheckCircle2 className="w-5 h-5" /></>
                            ) : (
                                <>Siguiente <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer info */}
                <div className="mt-8 text-center">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">
                        Red-Salud Enterprise v1.0.4
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:text-rose-400 transition-colors"
                    >
                        ¿Ya tienes cuenta? Inicia sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
