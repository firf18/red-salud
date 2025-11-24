"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { Users, Building2, TrendingUp, Heart } from "lucide-react";

const testimonials = [
  {
    name: "Dra. María González",
    role: "Cardióloga",
    location: "Caracas",
    avatar: "MG",
    quote: "Red-Salud me ha permitido llegar a más pacientes en todo el país. La plataforma es intuitiva y mis pacientes están muy satisfechos con la atención digital.",
    rating: 5,
  },
  {
    name: "Carlos Ramírez",
    role: "Paciente",
    location: "Valencia",
    avatar: "CR",
    quote: "Conseguí un especialista en menos de 24 horas. El proceso fue súper fácil y la consulta por videollamada fue excelente. Ya he usado el servicio 3 veces.",
    rating: 5,
  },
  {
    name: "Farmacia San Rafael",
    role: "Farmacia",
    location: "Maracaibo",
    avatar: "FS",
    quote: "Hemos duplicado nuestros pedidos desde que nos unimos a Red-Salud. La integración con las recetas digitales es perfecta.",
    rating: 5,
  },
];

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Usuarios activos",
    description: "Confiando en nuestra plataforma",
    color: "from-blue-600 to-blue-700",
  },
  {
    icon: Building2,
    value: "500+",
    label: "Profesionales",
    description: "Médicos y especialistas verificados",
    color: "from-teal-600 to-teal-700",
  },
  {
    icon: TrendingUp,
    value: "95%",
    label: "Satisfacción",
    description: "De nuestros usuarios",
    color: "from-indigo-600 to-indigo-700",
  },
  {
    icon: Heart,
    value: "24/7",
    label: "Soporte",
    description: "Siempre disponibles para ti",
    color: "from-purple-600 to-purple-700",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32 bg-white dark:bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
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
            Lo que dicen nuestros usuarios
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-foreground mb-6 leading-tight"
          >
            Historias de{" "}
            <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
              éxito reales
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-gray-600 dark:text-muted-foreground leading-relaxed"
          >
            Miles de personas ya están transformando su experiencia de salud con Red-Salud
          </motion.p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="group"
            >
              <div className="bg-white dark:bg-card border-2 border-gray-200 dark:border-border rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:border-blue-400 dark:hover:border-blue-600 h-full flex flex-col">
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 flex-1 italic">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-border">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground">
                      {testimonial.role} • {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="text-center group"
              >
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-card border border-gray-200 dark:border-border rounded-2xl p-8 transition-all duration-500 hover:shadow-xl hover:scale-105">
                  <div className="mb-4 inline-flex">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className={`text-4xl font-bold mb-2 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-foreground mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-muted-foreground">
                    {stat.description}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
