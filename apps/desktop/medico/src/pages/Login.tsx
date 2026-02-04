import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Stethoscope, Loader2, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

type ViewMode = 'login' | 'recovery' | 'success';

export default function LoginPage() {
    const navigate = useNavigate();
    const { signIn, loading } = useAuth();

    const [view, setView] = useState<ViewMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [resetLoading, setResetLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError('Por favor ingresa tu email y contraseña');
            return;
        }

        try {
            await signIn(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError('Por favor ingresa tu correo electrónico');
            return;
        }

        setResetLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'http://localhost:5173/reset-password',
            });

            if (error) throw error;
            setView('success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al enviar el correo');
        } finally {
            setResetLoading(false);
        }
    };

    const premiumEasing = [0.16, 1, 0.3, 1];

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: {
            opacity: 1,
            scale: 1,
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
        <div className="min-h-screen max-h-screen flex items-center justify-center bg-[#0a1120] relative overflow-hidden font-sans selection:bg-teal-500/30 selection:text-white">
            {/* Premium Medical Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 40, -30, 0],
                        y: [0, -60, 40, 0],
                        scale: [1, 1.1, 0.9, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-5%] left-[-5%] w-[80%] h-[80%] bg-teal-600/10 rounded-full blur-[140px] opacity-40 mix-blend-screen"
                />
                <motion.div
                    animate={{
                        x: [0, -30, 40, 0],
                        y: [0, 70, -50, 0],
                        scale: [1, 0.85, 1.15, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-15%] right-[-10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[140px] opacity-30 mix-blend-screen"
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay z-[2]" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-[440px] z-10 px-6 py-4"
            >
                <div className="bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] border border-white/[0.05] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] p-8 md:p-10 relative overflow-hidden">
                    {/* Subtle Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-teal-500/40 to-transparent" />

                    {/* Header Section */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center mb-8 text-center">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative mb-6 group cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-teal-500/30 rounded-2xl blur-2xl opacity-40 group-hover:opacity-100 transition-opacity animate-pulse" />
                            <div className="relative bg-gradient-to-br from-teal-600 to-blue-700 p-5 rounded-2xl shadow-xl ring-1 ring-white/30">
                                <Stethoscope className="h-8 w-8 text-white" />
                            </div>
                        </motion.div>

                        <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                            Red-Salud <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-blue-400">Professional</span>
                        </h1>
                        <p className="text-slate-500 mt-3 font-bold tracking-[0.25em] text-[9px] uppercase bg-slate-800/40 px-4 py-1.5 rounded-full border border-white/[0.03]">
                            Portal Médico Avanzado
                        </p>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        {view === 'login' && (
                            <motion.div
                                key="login-view"
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 15 }}
                                transition={{ duration: 0.4, ease: premiumEasing }}
                            >
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-6 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-start gap-3"
                                    >
                                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-red-200/80 font-medium leading-relaxed">{error}</p>
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="space-y-2.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                                            ID de Profesional
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-800/20 border border-slate-700/30 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/40 text-white placeholder:text-slate-600 outline-none transition-all duration-300 font-medium text-sm"
                                            placeholder="medico@red-salud.pro"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center mb-1 px-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                                Clave de Acceso
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setView('recovery')}
                                                className="text-[8px] font-bold text-teal-500/60 hover:text-teal-400 transition-colors uppercase tracking-[0.1em]"
                                            >
                                                Recuperar clave
                                            </button>
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-800/20 border border-slate-700/30 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/40 text-white placeholder:text-slate-600 outline-none transition-all duration-300 font-medium text-sm"
                                            placeholder="••••••••••••••••"
                                            disabled={loading}
                                        />
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        whileHover={{ scale: 1.01, boxShadow: "0 20px 40px -12px rgba(20, 184, 166, 0.3)" }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4.5 px-6 rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-6 relative overflow-hidden group shadow-lg shadow-teal-900/20"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span className="tracking-[0.15em] text-[11px] uppercase">Autenticando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="tracking-[0.15em] text-[11px] uppercase font-black">Ingresar al Portal</span>
                                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>
                            </motion.div>
                        )}

                        {view === 'recovery' && (
                            <motion.div
                                key="recovery-view"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                transition={{ duration: 0.4, ease: premiumEasing }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <h2 className="text-xl font-bold text-white">Recuperar Acceso</h2>
                                    <p className="text-xs text-slate-500 mt-2">Introduce tu correo para restablecer tu clave</p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    <div className="space-y-2.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-6 py-4 bg-slate-800/20 border border-slate-700/30 rounded-2xl text-white outline-none focus:border-teal-500/40 transition-all text-sm"
                                            placeholder="tu-correo@ejemplo.com"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <motion.button
                                            type="submit"
                                            disabled={resetLoading}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4.5 rounded-2xl flex items-center justify-center gap-3 shadow-xl"
                                        >
                                            {resetLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="text-[11px] tracking-widest uppercase">Enviar Instrucciones</span>}
                                        </motion.button>

                                        <button
                                            type="button"
                                            onClick={() => setView('login')}
                                            className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                            VOLVER AL INICIO
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {view === 'success' && (
                            <motion.div
                                key="success-view"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-4 space-y-6"
                            >
                                <div className="flex justify-center">
                                    <div className="p-5 bg-teal-500/10 rounded-full">
                                        <CheckCircle2 className="h-12 w-12 text-teal-400" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-2xl font-bold text-white">¡Enlace Enviado!</h2>
                                    <p className="text-xs text-slate-400 px-4 leading-relaxed">
                                        Hemos enviado las instrucciones de recuperación a su correo institucional. Revisa tu bandeja de entrada.
                                    </p>
                                </div>
                                <motion.button
                                    onClick={() => setView('login')}
                                    whileHover={{ scale: 1.02 }}
                                    className="text-teal-400 font-bold text-[11px] tracking-widest uppercase flex items-center justify-center gap-2 w-full pt-4"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Ir al Login
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Security Badge */}
                <motion.div variants={itemVariants} className="mt-8 flex justify-center">
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-900/30 rounded-full border border-white/[0.03] backdrop-blur-sm shadow-sm group">
                        <ShieldCheck className="h-3.5 w-3.5 text-teal-500/60 group-hover:text-teal-400 transition-colors" />
                        <p className="text-slate-500 text-[9px] font-bold tracking-widest uppercase group-hover:text-slate-300 transition-colors">
                            Conexión Encriptada AES-256
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
