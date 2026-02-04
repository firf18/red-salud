import {
    Loader2,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    Lock,
    Fingerprint,
    ShieldAlert,
    Key,
    User,
    Shield
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { hashSeedPhrase } from '@/lib/crypto-vault';
import { useAuthStore } from '@/store/authStore';

type ViewMode = 'login' | 'master' | 'recovery' | 'success';

export default function LoginPage() {
    const navigate = useNavigate();
    const { signIn, loading } = useAuth();

    const [view, setView] = useState<ViewMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [masterCode, setMasterCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isVaultInitialized, setIsVaultInitialized] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        const checkVault = async () => {
            const { data } = await supabase
                .from('master_vault')
                .select('is_initialized')
                .single();

            if (data && !data.is_initialized) {
                setIsVaultInitialized(false);
            }
        };
        checkVault();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError('CREDENCIALES REQUERIDAS PARA ACCESO');
            return;
        }

        try {
            await signIn(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message.toUpperCase() : 'ERROR DE AUTENTICACIÓN CRÍTICO');
        }
    };

    const handleMasterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsVerifying(true);

        try {
            // Hash the provided seed phrase
            const hash = await hashSeedPhrase(masterCode);

            // Verify via RPC
            const { data, error: rpcError } = await supabase.rpc('verify_master_seed', {
                provided_hash: hash
            });

            if (rpcError) throw rpcError;

            if (data === true) {
                // For master access, grant full Root permissions
                const { setProfile, setUser, setToken } = useAuthStore.getState();

                const rootProfile = {
                    id: '00000000-0000-0000-0000-000000000000',
                    email: 'master@seed.vault',
                    nombre_completo: 'MASTER ACCESS',
                    role: 'admin',
                    access_level: 5,
                    permissions: {
                        can_manage_users: true,
                        can_view_analytics: true,
                        can_manage_system: true,
                        can_access_master_keys: true
                    }
                };

                setProfile(rootProfile);
                setUser({ id: rootProfile.id, email: rootProfile.email });
                setToken('master-token'); // Dummy token for session state

                navigate('/dashboard');
            } else {
                setError('FRASÉ MAESTRA INVÁLIDA - ACCESO RECHAZADO POR SECURITY_PROTOCOL');
            }
        } catch (err: any) {
            setError('FALLO EN PROTOCOLO DE VERIFICACIÓN: ' + err.message.toUpperCase());
        } finally {
            setIsVerifying(false);
        }
    };

    const premiumEasing = [0.16, 1, 0.3, 1] as any;

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: premiumEasing,
                staggerChildren: 0.1,
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: premiumEasing }
        }
    };

    return (
        <div className="min-h-screen max-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans selection:bg-blue-500/30 selection:text-white">
            {/* Cyberpunk Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.1),transparent_70%)]" />

                {/* Random Glows */}
                <motion.div
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -80, 60, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[10%] left-[20%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"
                />

                <motion.div
                    animate={{
                        x: [0, -60, 80, 0],
                        y: [0, 90, -40, 0],
                        opacity: [0.15, 0.3, 0.15]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[10%] right-[20%] w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px]"
                />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[480px] z-10 px-6"
            >
                <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/[0.05] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8)] p-10 relative overflow-hidden group">
                    {/* Security Scan Line Simulation */}
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500/20 blur-sm group-hover:bg-blue-500/40 transition-all duration-700" />

                    {/* Header */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center mb-10 text-center">
                        <div className="relative mb-6">
                            <div className="absolute -inset-4 bg-blue-600/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <div className="relative h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/50 border border-white/20 transform hover:rotate-6 transition-transform cursor-pointer">
                                {view === 'master' ? (
                                    <Fingerprint className="h-10 w-10 text-white animate-pulse" />
                                ) : (
                                    <ShieldCheck className="h-10 w-10 text-white" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                                RED SALUD <span className="text-blue-500 not-italic">CORP</span>
                            </h1>
                            <div className="flex items-center gap-2 justify-center">
                                <div className="h-px w-8 bg-slate-800" />
                                <span className="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase">Security Terminal</span>
                                <div className="h-px w-8 bg-slate-800" />
                            </div>
                        </div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {view === 'login' && (
                            <motion.div
                                key="login-view"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.4, ease: premiumEasing }}
                            >
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-8 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-4"
                                    >
                                        <ShieldAlert className="h-5 w-5 text-red-500 shrink-0" />
                                        <p className="text-[10px] text-red-400 font-black tracking-widest">{error}</p>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                                            <User className="h-3 w-3" /> ID Operador
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl focus:border-blue-500/40 focus:bg-white/[0.04] text-white placeholder:text-slate-700 outline-none transition-all duration-300 font-bold text-xs tracking-wider uppercase disabled:opacity-50"
                                            placeholder="CORP-ADMIN-01"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center px-2">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                                <Lock className="h-3 w-3" /> Auth Sequence
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setView('master')}
                                                className="text-[9px] font-black text-blue-500/60 hover:text-blue-400 transition-colors uppercase tracking-widest"
                                            >
                                                Acceso Maestro
                                            </button>
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-6 py-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl focus:border-blue-500/40 focus:bg-white/[0.04] text-white placeholder:text-slate-700 outline-none transition-all duration-500 font-bold text-xs tracking-widest disabled:opacity-50"
                                            placeholder="••••••••••••"
                                            disabled={loading}
                                        />
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(37,99,235,0.2)] group"
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span className="font-black text-[11px] uppercase tracking-[0.2em]">Ejecutar Protocolo</span>
                                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                            </motion.div>
                        )}

                        {view === 'master' && (
                            <motion.div
                                key="master-view"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: premiumEasing }}
                                className="space-y-8"
                            >
                                <div className="text-center p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                                    <h2 className="text-xl font-black text-blue-400 uppercase tracking-tighter italic">Bypass Maestro</h2>
                                    <p className="text-[10px] text-slate-500 mt-2 font-bold leading-relaxed uppercase tracking-widest">Procedimiento de Recuperación: Ingrese la Frase Semilla de 12 Palabras</p>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-4">
                                        <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
                                        <p className="text-[9px] text-red-400 font-black tracking-widest">{error}</p>
                                    </div>
                                )}

                                {!isVaultInitialized && (
                                    <button
                                        onClick={() => navigate('/security-setup')}
                                        className="w-full p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 group hover:bg-amber-500/20 transition-all"
                                    >
                                        <Shield className="h-5 w-5 text-amber-500" />
                                        <div className="text-left">
                                            <p className="text-[10px] text-amber-500 font-black tracking-widest uppercase">Vault no inicializado</p>
                                            <p className="text-[8px] text-amber-200/50 font-bold uppercase tracking-widest leading-none mt-1">Click para configurar protocolo de seguridad</p>
                                        </div>
                                    </button>
                                )}

                                <form onSubmit={handleMasterSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <textarea
                                            value={masterCode}
                                            onChange={(e) => setMasterCode(e.target.value)}
                                            className="w-full px-6 py-6 bg-slate-950/60 border border-blue-500/20 rounded-[2rem] text-blue-100 placeholder:text-slate-800 outline-none focus:border-blue-500/40 transition-all font-mono text-xs leading-relaxed resize-none shadow-inner"
                                            rows={3}
                                            placeholder="WORD1 WORD2 WORD3..."
                                        />
                                        <p className="text-center text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">AES-512 ENCRYPTION ACTIVE</p>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <motion.button
                                            type="submit"
                                            disabled={isVerifying}
                                            whileHover={{ scale: 1.01 }}
                                            className="w-full h-16 bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-2xl flex items-center justify-center gap-4 group disabled:opacity-50"
                                        >
                                            {isVerifying ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                            ) : (
                                                <>
                                                    <Key className="h-4 w-4 text-blue-500 transition-transform group-hover:rotate-45" />
                                                    <span className="text-[11px] font-black tracking-[0.2em] text-white uppercase">Validar Bóveda</span>
                                                </>
                                            )}
                                        </motion.button>

                                        <button
                                            type="button"
                                            onClick={() => setView('login')}
                                            className="text-[9px] font-black text-slate-600 hover:text-slate-400 flex items-center justify-center gap-3 transition-colors uppercase tracking-[0.4em]"
                                        >
                                            <ArrowLeft className="h-4 w-4" /> Volver
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-12 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="h-px w-12 bg-white/5" />
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em]">System Status: Stable</p>
                        <div className="h-px w-12 bg-white/5" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
