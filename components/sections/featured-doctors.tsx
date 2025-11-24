"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Profile = { id: string; nombre_completo?: string; avatar_url?: string };
type Specialty = { id: string; name: string };
type Doctor = {
  id: string;
  profile?: Profile;
  specialty?: Specialty;
  tarifa_consulta?: number;
  consultation_duration?: number;
};

function formatUSD(value?: number) {
  if (!value && value !== 0) return undefined;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  } catch {
    return `$${value}`;
  }
}

export function FeaturedDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/public/doctors?featured=true&limit=6", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (mounted && json?.success) setDoctors(json.data || []);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (!loading && doctors.length === 0) return null; // Ocultar cuando no haya destacados configurados

  return (
    <section className="py-20 bg-background dark:bg-background relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeInUp} className="text-center sm:text-left">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-4 border border-blue-200 dark:border-blue-800">
              Médicos destacados
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground">Profesionales verificados</h3>
            <p className="text-muted-foreground mt-2">Atención de calidad con médicos recomendados</p>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Link 
              href="/auth/register?role=medico" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg"
            >
              ¿Eres médico? Únete
              <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {(doctors.length ? doctors : Array.from({ length: 3 })).map((d, i) => (
            <motion.div key={(d as any)?.id ?? i} variants={fadeInUp}>
              <Card className="h-full border shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-400/50 dark:hover:border-blue-600/50 group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900/40 dark:to-teal-900/40 flex-shrink-0 ring-2 ring-blue-200 dark:ring-blue-800 transition-transform duration-300 group-hover:scale-110">
                    {d?.profile?.avatar_url ? (
                      <Image src={d.profile.avatar_url} alt={d?.profile?.nombre_completo || "Médico"} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">MD</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground truncate text-lg">{d?.profile?.nombre_completo || "Cargando..."}</div>
                    <div className="text-sm text-muted-foreground truncate">{d?.specialty?.name || ""}</div>
                    {typeof d?.tarifa_consulta !== "undefined" && (
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold mt-2">
                        {formatUSD(d.tarifa_consulta)} · {d?.consultation_duration || 30} min
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
