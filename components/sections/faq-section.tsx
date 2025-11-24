"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "¿Cómo funciona Red-Salud?",
    answer: "Red-Salud es una plataforma integral que conecta pacientes con profesionales de la salud, farmacias, laboratorios, aseguradoras y más. Puedes agendar citas, realizar teleconsultas, gestionar tu historial médico, comprar medicamentos y acceder a resultados de laboratorio, todo en un solo lugar.",
  },
  {
    question: "¿Es segura mi información médica?",
    answer: "Absolutamente. Usamos encriptación de extremo a extremo y cumplimos con los estándares internacionales de protección de datos médicos. Tu información está protegida con tecnología de nivel bancario y solo tú decides quién puede acceder a ella.",
  },
  {
    question: "¿Cuánto cuesta usar Red-Salud?",
    answer: "Registrarte y usar las funciones básicas de la plataforma es completamente gratis. Los costos están asociados a los servicios específicos que contrates (consultas, medicamentos, exámenes), que son establecidos por cada profesional o proveedor.",
  },
  {
    question: "¿Qué roles puedo tener en la plataforma?",
    answer: "Ofrecemos 8 roles diferentes: Paciente, Médico, Farmacia, Laboratorio, Aseguradora, Secretaria, Clínica y Turismo Médico. Cada rol tiene funcionalidades específicas diseñadas para optimizar el flujo de trabajo de ese sector.",
  },
  {
    question: "¿Puedo acceder desde cualquier dispositivo?",
    answer: "Sí, Red-Salud funciona en computadoras, tablets y smartphones. Tu información se sincroniza automáticamente entre todos tus dispositivos para que siempre tengas acceso cuando lo necesites.",
  },
  {
    question: "¿Cómo se verifican los profesionales?",
    answer: "Todos los médicos y profesionales de la salud pasan por un proceso riguroso de verificación que incluye validación de credenciales, licencias profesionales y antecedentes. Solo profesionales certificados pueden ofrecer servicios en nuestra plataforma.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6 border border-blue-200 dark:border-blue-800"
          >
            Preguntas frecuentes
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-foreground mb-6 leading-tight"
          >
            ¿Tienes dudas?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-600 dark:text-muted-foreground leading-relaxed"
          >
            Encuentra respuestas a las preguntas más comunes sobre nuestra plataforma
          </motion.p>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto space-y-4"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 flex items-center justify-between gap-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-card/80"
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-foreground pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="h-6 w-6 text-blue-600 dark:text-blue-400 transition-transform" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-400 dark:text-gray-600 transition-transform" />
                  )}
                </div>
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-8 pb-6 pt-2">
                  <p className="text-gray-600 dark:text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 dark:text-muted-foreground mb-4">
            ¿No encuentras la respuesta que buscas?
          </p>
          <a
            href="mailto:soporte@red-salud.com"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-all"
          >
            Contáctanos directamente
            <span aria-hidden="true">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
