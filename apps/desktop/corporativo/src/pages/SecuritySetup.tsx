import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    ShieldCheck,
    Key,
    AlertTriangle,
    Copy,
    ArrowRight,
    RefreshCw,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import { generateSeedPhrase, hashSeedPhrase } from '@/lib/crypto-vault';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const premiumEasing = [0.16, 1, 0.3, 1];

export default function SecuritySetup() {
    const navigate = useNavigate();
    const [step, setStep] = useState<'intro' | 'generate' | 'verify' | 'success'>('intro');
    const [seed, setSeed] = useState<string[]>([]);
    const [verificationWords, setVerificationWords] = useState<string[]>([]);
    const [indicesToVerify, setIndicesToVerify] = useState<number[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSeed, setShowSeed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        checkIfInitialized();
    }, []);

    const checkIfInitialized = async () => {
        const { data, error } = await supabase
            .from('master_vault')
            .select('is_initialized')
            .single();

        if (data?.is_initialized) {
            toast.error('El sistema de seguridad ya está inicializado.');
            navigate('/login');
        }
    };

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            const newSeed = generateSeedPhrase();
            setSeed(newSeed);
            setIsGenerating(false);
            setStep('generate');
        }, 1500);
    };

    const prepareVerification = () => {
        // Pick 3 random indices to verify
        const indices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .sort((a, b) => a - b);

        setIndicesToVerify(indices);
        setVerificationWords(new Array(3).fill(''));
        setStep('verify');
    };

    const handleFinalize = async () => {
        // Validate verification words
        const isValid = indicesToVerify.every((idx, i) =>
            verificationWords[i].toLowerCase().trim() === seed[idx].toLowerCase().trim()
        );

        if (!isValid) {
            toast.error('Validación fallida. Por favor verifica las palabras ingresadas.');
            return;
        }

        setIsLoading(true);
        try {
            const phraseString = seed.join(' ');
            const hash = await hashSeedPhrase(phraseString);

            const { data, error } = await supabase.rpc('initialize_master_vault', {
                new_seed_hash: hash
            });

            if (error) throw error;

            if (data === true) {
                setStep('success');
            } else {
                toast.error('El baúl ya ha sido inicializado.');
                navigate('/login');
            }
        } catch (error: any) {
            toast.error('Error al inicializar: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden font-['Inter']">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,102,255,0.05),transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full relative z-10"
            >
                <div className="bg-[#0A0A0A]/80 backdrop-blur-2xl border border-blue-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">

                    <AnimatePresence mode="wait">
                        {step === 'intro' && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 text-center"
                            >
                                <div className="flex justify-center">
                                    <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center relative">
                                        <Shield className="w-10 h-10 text-blue-400" />
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight mb-2 italic">CONFIGURACIÓN DEL VAULT</h1>
                                    <p className="text-gray-400">Iniciando protocolo de seguridad nivel corporativo</p>
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-left">
                                    <div className="flex gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-amber-200/80 leading-relaxed">
                                            Generarás una <span className="text-amber-400 font-bold">Frase Semilla de 12 palabras</span>.
                                            Este es el único método para recuperar el acceso Maestro si olvidas tu clave.
                                            <span className="block mt-2 font-bold italic underline">Si pierdes estas palabras, el acceso será irrecuperable.</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all group"
                                >
                                    {isGenerating ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            GENERAR LLAVES MAESTRAS
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {step === 'generate' && (
                            <motion.div
                                key="generate"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-1 italic">TU FRASE SEMILLA</h2>
                                    <p className="text-sm text-gray-400">Escribe estas palabras en papel y guárdalas en un lugar seguro.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 bg-black/40 p-4 rounded-2xl border border-white/5">
                                    {seed.map((word, i) => (
                                        <div key={i} className="flex gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                            <span className="text-blue-500/50 font-mono text-xs w-4">{(i + 1).toString().padStart(2, '0')}</span>
                                            <span className={`font-mono font-medium ${showSeed ? 'text-white' : 'blur-md select-none'}`}>
                                                {word}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowSeed(!showSeed)}
                                        className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 flex items-center justify-center gap-2 transition-colors text-sm font-semibold"
                                    >
                                        {showSeed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        {showSeed ? 'OCULTAR' : 'REVELAR'} FRASÉ
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(seed.join(' '));
                                            toast.success('Frase copiada al portapapeles (No recomendado para seguridad)');
                                        }}
                                        className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 flex items-center justify-center transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={prepareVerification}
                                    className="w-full h-14 bg-white text-black hover:bg-gray-200 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                                >
                                    HE GUARDADO LAS PALABRAS
                                </button>
                            </motion.div>
                        )}

                        {step === 'verify' && (
                            <motion.div
                                key="verify"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-1 italic">VERIFICAR RESPALDO</h2>
                                    <p className="text-sm text-gray-400">Ingresa las palabras correspondientes para confirmar el respaldo.</p>
                                </div>

                                <div className="space-y-4">
                                    {indicesToVerify.map((seedIdx, i) => (
                                        <div key={i} className="space-y-2">
                                            <label className="text-xs font-bold text-blue-400">PALABRA #{seedIdx + 1}</label>
                                            <input
                                                type="text"
                                                autoFocus={i === 0}
                                                value={verificationWords[i]}
                                                onChange={(e) => {
                                                    const newWords = [...verificationWords];
                                                    newWords[i] = e.target.value;
                                                    setVerificationWords(newWords);
                                                }}
                                                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 font-mono focus:border-blue-500/50 focus:outline-none transition-colors"
                                                placeholder="Ingresa la palabra..."
                                            />
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleFinalize}
                                    disabled={isLoading || verificationWords.some(w => !w)}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                                >
                                    {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'FINALIZAR CONFIGURACIÓN'}
                                </button>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6 text-center"
                            >
                                <div className="flex justify-center">
                                    <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center relative">
                                        <ShieldCheck className="w-10 h-10 text-green-400" />
                                        <motion.div
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute inset-0 bg-green-500/20 rounded-full"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold italic mb-2">VAULT ASEGURADO</h2>
                                    <p className="text-gray-400">Protocolo de seguridad activo. Acceso Maestro habilitado.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-gray-500">
                                    Tu baúl ha sido encriptado y las llaves maestras han sido distribuidas.
                                </div>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full h-14 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                                >
                                    IR AL LOGIN
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Info */}
                <div className="mt-8 flex justify-center items-center gap-4 text-[10px] font-bold tracking-widest text-white/30 uppercase">
                    <div className="flex items-center gap-1.5 italic">
                        <Lock className="w-3 h-3" />
                        AES-256 ENCRYPTION
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <div className="flex items-center gap-1.5 italic">
                        <Shield className="w-3 h-3" />
                        MILITARY GRADE
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <div className="flex items-center gap-1.5 italic">
                        <Key className="w-3 h-3" />
                        BIP39 COMPLIANT
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
