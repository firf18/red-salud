"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, LogIn, UserPlus, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/constants";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { DashboardStats } from "./dashboard-stats";
import { useAuth } from "@/hooks/use-auth";

const features = [
  "Atención médica 24/7",
  "Profesionales certificados",
  "Tecnología de vanguardia",
  "Resultados inmediatos",
];

export function HeroSection() {
  const { user } = useAuth();
  const handleScrollDown = () => {
    const nextSection = document.querySelector('#next-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section data-testid="hero-section" className="relative h-[calc(100svh-64px)] sm:h-[calc(100svh-80px)] xl:h-[calc(100svh-80px)] mt-[64px] sm:mt-[80px] xl:mt-[80px] flex items-center justify-center overflow-hidden pt-[env(safe-area-inset-top)]">
      {/* Fondo dinámico animado con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950" />
      
      {/* Animación de fondo sutil y profesional */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-transparent to-teal-600/20 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Badge con identidad local */}
          <motion.div variants={fadeInUp} className="inline-flex mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-blue-400/30 text-white text-sm font-medium shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
              </span>
              Hecha en Venezuela para venezolanos
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeInUp}
            className="font-bold text-5xl sm:text-6xl lg:text-7xl text-white mb-8 leading-tight tracking-tight"
          >
            Tu salud, en un solo lugar
          </motion.h1>

          {/* Subtítulos con mejor jerarquía */}
          <motion.div variants={fadeInUp} className="space-y-4 mb-10 max-w-3xl mx-auto">
            <p className="text-xl sm:text-2xl lg:text-3xl text-white/95 font-medium leading-relaxed">
              Agenda, atiéndete y continúa tu cuidado.
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/80 leading-relaxed">
              Simple para pacientes, potente para profesionales.
            </p>
          </motion.div>

          {/* CTAs con diseño minimalista */}
          <motion.div
            variants={fadeInUp}
            className="flex justify-center mb-16"
          >
            <div className="inline-flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-xl shadow-blue-900/50 transition-all duration-300 hover:scale-105">
                <a data-testid="cta-primary" href={user ? "/dashboard/paciente/citas/nueva" : AUTH_ROUTES.REGISTER} aria-label={user ? "Agendar cita" : "Crear cuenta"}>
                  {user ? (
                    <span className="inline-flex items-center gap-2"><CalendarDays className="h-5 w-5" /> Agendar cita</span>
                  ) : (
                    <span className="inline-flex items-center gap-2"><UserPlus className="h-5 w-5" /> Crear cuenta</span>
                  )}
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-blue-400/50 text-white hover:bg-blue-600/20 hover:border-blue-400 bg-transparent backdrop-blur-sm transition-all duration-300 hover:scale-105">
                <a data-testid="cta-secondary" href={AUTH_ROUTES.LOGIN} aria-label="Iniciar sesión">
                  <span className="inline-flex items-center gap-2"><LogIn className="h-5 w-5" /> Iniciar sesión</span>
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Features List con diseño minimalista */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center justify-center gap-3 mb-16"
            data-testid="hero-features"
          >
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-white bg-white/5 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2.5 transition-all duration-300 hover:bg-white/10 hover:border-white/30"
              >
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                <span className="text-sm font-medium">
                  {feature}
                </span>
              </div>
            ))}
          </motion.div>

          

          {/* Stats - se ocultan automáticamente si no hay datos */}
          <motion.div variants={fadeInUp}>
            <DashboardStats />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={handleScrollDown}
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span className="text-sm">Descubre más</span>
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
