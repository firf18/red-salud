import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Pill, Loader2, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
      navigate('/');
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
        redirectTo: 'http://localhost:1420/reset-password',
      });

      if (error) throw error;
      setView('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el correo');
    } finally {
      setResetLoading(false);
    }
  };


  const premiumEasing: any = [0.16, 1, 0.3, 1];

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: premiumEasing,
        staggerChildren: 0.08,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: premiumEasing }
    }
  };

  return (
    <div className="min-h-screen max-h-screen flex items-center justify-center bg-[#070b14] relative overflow-hidden font-sans selection:bg-primary/30 selection:text-white">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -80, 50, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[160px] opacity-40 mix-blend-screen"
        />
        <motion.div
          animate={{
            x: [0, -50, 70, 0],
            y: [0, 90, -60, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-blue-500/15 rounded-full blur-[160px] opacity-30 mix-blend-screen"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#070b14] to-transparent z-[1]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay z-[2]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[420px] z-10 px-4 py-2"
      >
        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] border border-white/[0.08] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] p-6 md:p-8 relative overflow-hidden group">
          {/* Internal Reflections */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-transparent to-white/[0.05] pointer-events-none" />

          {/* Header Section */}
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-6 text-center">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative mb-4 group cursor-pointer"
            >
              <div className="absolute inset-0 bg-primary/40 rounded-2xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary via-primary to-[#ff4d4f] p-4 rounded-2xl shadow-2xl ring-1 ring-white/40 transform transition-all duration-300">
                <Pill className="h-7 w-7 text-white" />
              </div>
            </motion.div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tighter leading-tight">
              Red-Salud <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">Enterprise</span>
            </h1>
            <p className="text-slate-500 mt-2 font-bold tracking-[0.2em] text-[8px] uppercase bg-slate-800/30 px-3 py-1 rounded-full border border-white/[0.03]">
              Gestión Farmacéutica Inteligente
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {view === 'login' && (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: premiumEasing }}
              >
                {/* Error Section */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                  >
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-200 font-bold leading-relaxed">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">
                      Credencial de Acceso
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary/40 text-white placeholder:text-slate-600 outline-none transition-all duration-500 font-bold text-xs ring-1 ring-white/[0.02]"
                      placeholder="usuario@red-salud.cloud"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1 px-2">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.25em]">
                        Clave de Seguridad
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setView('recovery');
                          setError(null);
                        }}
                        className="text-[7px] font-black text-slate-500 hover:text-primary transition-colors uppercase tracking-[0.1em]"
                      >
                        ¿Olvido su clave?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary/40 text-white placeholder:text-slate-600 outline-none transition-all duration-500 font-bold text-xs ring-1 ring-white/[0.02]"
                      placeholder="••••••••••••••••"
                      disabled={loading}
                      autoComplete="current-password"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.01, backgroundColor: '#f43f5e' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-primary text-white font-black py-4 px-6 rounded-xl shadow-[0_16px_32px_-12px_rgba(244,63,94,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4 overflow-hidden relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="tracking-[0.2em] text-[10px]">VERIFICANDO...</span>
                      </>
                    ) : (
                      <>
                        <span className="tracking-[0.2em] text-[10px]">INICIAR SESIÓN</span>
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: premiumEasing }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h2 className="text-lg font-bold text-white tracking-tight">Recuperar Acceso</h2>
                  <p className="text-[10px] text-slate-500 font-medium">Enviaremos instrucciones a tu correo</p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                  >
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-200 font-bold leading-relaxed">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.25em] ml-2">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-3.5 bg-slate-800/30 border border-slate-700/40 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary/40 text-white placeholder:text-slate-600 outline-none transition-all duration-500 font-bold text-xs ring-1 ring-white/[0.02]"
                      placeholder="tu@email.com"
                      disabled={resetLoading}
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <motion.button
                      type="submit"
                      disabled={resetLoading}
                      whileHover={{ scale: 1.01, backgroundColor: '#f43f5e' }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-primary text-white font-black py-4 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {resetLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="tracking-[0.15em] text-[10px]">ENVIAR ENLACE</span>
                      )}
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => {
                        setView('login');
                        setError(null);
                      }}
                      className="text-[9px] font-bold text-slate-500 hover:text-white flex items-center justify-center gap-2 transition-colors py-2"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      VOLVER AL INICIO
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {view === 'success' && (
              <motion.div
                key="success-view"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-6"
              >
                <div className="flex justify-center">
                  <div className="p-4 bg-emerald-500/20 rounded-full animate-bounce">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">¡Correo Enviado!</h2>
                  <p className="text-xs text-slate-400 font-medium px-4">
                    Hemos enviado un enlace de recuperación a: <br />
                    <span className="text-primary font-bold">{email}</span>
                  </p>
                </div>

                <div className="bg-slate-800/40 p-3 rounded-xl border border-white/[0.03]">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                    Revisa tu bandeja de entrada o spam para continuar
                  </p>
                </div>

                <motion.button
                  onClick={() => setView('login')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 text-primary font-black text-[10px] tracking-widest hover:text-rose-400 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  VOLVER AL LOGIN
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Accessors (Only show on login view) */}
          {view === 'login' && (
            <motion.div
              variants={itemVariants}
              className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col items-center gap-3"
            >
              <p className="text-slate-600 text-[8px] font-black uppercase tracking-[0.3em]">Acceso de Socios</p>
              <motion.button
                whileHover={{ y: -1 }}
                onClick={() => navigate('/register')}
                className="flex items-center gap-3 text-slate-400 hover:text-white font-black transition-all group px-6 py-2.5 bg-slate-800/20 rounded-xl border border-white/[0.02] hover:bg-slate-800/40"
              >
                <span className="text-[9px] tracking-widest">REGISTRAR FARMACIA</span>
                <ArrowRight className="h-3 w-3" />
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* System Metadata */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-6 space-y-3"
        >
          <div className="inline-flex items-center justify-center gap-2.5 px-4 py-2 bg-slate-900/40 rounded-full border border-white/[0.03] backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <p className="text-slate-400 text-[8px] font-black tracking-[0.2em] uppercase flex items-center gap-2">
              Estado: Operativo <span className="w-px h-2 bg-slate-700" /> v1.0.4
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
