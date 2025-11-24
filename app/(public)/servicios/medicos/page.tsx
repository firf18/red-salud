import type { Metadata } from "next";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Video, 
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Star,
  UserCheck,
  Clock,
  Settings,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Servicios para Médicos - Red-Salud Venezuela",
  description: "Plataforma integral para profesionales de la salud. Gestiona consultas, pacientes y aumenta tus ingresos con telemedicina",
  keywords: "telemedicina, médicos venezuela, consultorio virtual, videoconsultas, agenda médica digital",
};

const features = [
  {
    icon: Calendar,
    title: "Agenda Digital Inteligente",
    description: "Sistema de citas automatizado con recordatorios SMS/WhatsApp y sincronización en tiempo real"
  },
  {
    icon: Users,
    title: "Gestión Completa de Pacientes",
    description: "Historial médico electrónico, expedientes digitales y seguimiento personalizado"
  },
  {
    icon: Video,
    title: "Videoconsultas HD",
    description: "Plataforma de telemedicina profesional con grabación opcional y sala de espera virtual"
  },
  {
    icon: FileText,
    title: "Recetas Digitales Certificadas",
    description: "Prescripciones médicas con firma electrónica válida en toda Venezuela"
  },
  {
    icon: CreditCard,
    title: "Pagos Seguros Automatizados",
    description: "Cobros automáticos, facturación electrónica y múltiples métodos de pago"
  },
  {
    icon: TrendingUp,
    title: "Dashboard Analítico",
    description: "Métricas de desempeño, ingresos, satisfacción de pacientes y reportes personalizados"
  },
];

const benefits = [
  "Aumenta tus ingresos hasta 40% con telemedicina",
  "Atiende más pacientes sin límite geográfico",
  "Reduce costos de consultorio físico",
  "Horarios flexibles desde cualquier lugar",
  "Sistema de pagos integrado sin comisiones ocultas",
  "Soporte técnico 24/7 especializado",
  "Capacitación continua incluida",
  "Cumplimiento normativo garantizado"
];

const howItWorks = [
  {
    icon: UserCheck,
    title: "1. Registro y Verificación",
    description: "Crea tu perfil profesional. Nuestro equipo verifica tu título y colegiación en 24-48 horas."
  },
  {
    icon: Settings,
    title: "2. Configura tu Consultorio",
    description: "Establece tus horarios, precios, especialidades y servicios. Personaliza tu perfil público."
  },
  {
    icon: Calendar,
    title: "3. Recibe Pacientes",
    description: "Los pacientes te encuentran, agendan citas y pagan online. Tú solo atiendes."
  },
  {
    icon: BarChart3,
    title: "4. Crece tu Práctica",
    description: "Analiza métricas, optimiza horarios y expande tu alcance con nuestra tecnología."
  },
];

const testimonials = [
  {
    name: "Dr. Carlos Mendoza",
    specialty: "Cardiólogo",
    location: "Caracas",
    rating: 5,
    comment: "En 6 meses aumenté mis ingresos en un 35%. La plataforma es excelente y los pacientes la aman. Ahora atiendo pacientes de todo el país sin moverme de casa."
  },
  {
    name: "Dra. María González",
    specialty: "Pediatra",
    location: "Valencia",
    rating: 5,
    comment: "Como madre, la flexibilidad de horarios es invaluable. Puedo atender pacientes temprano en la mañana o tarde en la noche. La calidad del video es perfecta."
  },
  {
    name: "Dr. Roberto Silva",
    specialty: "Dermatólogo",
    location: "Maracaibo",
    rating: 5,
    comment: "Las herramientas de diagnóstico visual son sorprendentes. Puedo ver manchas y lesiones con gran detalle. Mis pacientes están fascinados con el servicio."
  },
];

const pricingPlans = [
  {
    name: "Básico",
    price: "Gratis",
    period: "para siempre",
    description: "Perfecto para comenzar",
    features: [
      "Hasta 10 pacientes/mes",
      "Agenda digital básica",
      "Videoconsultas ilimitadas",
      "Recetas digitales",
      "Comisión 15% por consulta"
    ],
    cta: "Comenzar Gratis",
    popular: false
  },
  {
    name: "Profesional",
    price: "$29",
    period: "/mes",
    description: "Para médicos activos",
    features: [
      "Pacientes ilimitados",
      "Agenda avanzada con IA",
      "Videoconsultas HD grabables",
      "Recetas e informes digitales",
      "Comisión reducida 10%",
      "Soporte prioritario",
      "Dashboard analítico"
    ],
    cta: "Prueba 30 días gratis",
    popular: true
  },
  {
    name: "Premium",
    price: "$79",
    period: "/mes",
    description: "Para consultorios múltiples",
    features: [
      "Todo de Profesional",
      "Multi-consultorio (hasta 3)",
      "Secretaria virtual incluida",
      "Sin comisiones por consulta",
      "API personalizada",
      "Marca blanca disponible",
      "Account manager dedicado"
    ],
    cta: "Agendar Demo",
    popular: false
  }
];

const faqs = [
  {
    question: "¿Cómo funciona el proceso de verificación?",
    answer: "Una vez que te registras, nuestro equipo de cumplimiento verifica tu título médico y colegiación con el Colegio de Médicos de Venezuela. Este proceso toma entre 24-48 horas hábiles. Necesitarás subir tu título universitario, certificado de colegiación vigente y cédula de identidad."
  },
  {
    question: "¿Qué comisión cobra Red-Salud?",
    answer: "Depende de tu plan. Plan Básico: 15% por consulta. Plan Profesional: 10% por consulta + suscripción mensual de $29. Plan Premium: 0% comisión + suscripción mensual de $79. Todos los planes incluyen procesamiento de pagos sin costos adicionales."
  },
  {
    question: "¿Puedo usar mi propia agenda y solo usar Red-Salud para videoconsultas?",
    answer: "Sí, ofrecemos integración con calendarios externos (Google Calendar, Outlook). Sin embargo, recomendamos usar nuestra agenda integrada para aprovechar recordatorios automáticos, confirmaciones de citas y sincronización con el historial del paciente."
  },
  {
    question: "¿Las recetas digitales son legalmente válidas?",
    answer: "Absolutamente. Nuestras recetas médicas cuentan con firma electrónica certificada conforme a la Ley de Mensajes de Datos y Firmas Electrónicas de Venezuela. Son válidas en todas las farmacias afiliadas a nuestra red (500+ en todo el país) y en farmacias que acepten recetas digitales."
  },
  {
    question: "¿Qué pasa si tengo problemas técnicos durante una consulta?",
    answer: "Contamos con soporte técnico 24/7 para médicos. Si experimentas problemas durante una videoconsulta, puedes llamar a nuestro soporte inmediato que te ayudará a resolverlo en minutos. Además, el sistema automáticamente reprograma la cita sin cargo si hay problemas técnicos comprobados."
  },
  {
    question: "¿Puedo atender pacientes internacionales?",
    answer: "Sí, la plataforma te permite atender pacientes en cualquier país. Sin embargo, debes cumplir con las regulaciones médicas del país donde se encuentra el paciente. Actualmente, la mayoría de nuestros médicos atienden pacientes venezolanos en el exterior y turismo médico hacia Venezuela."
  },
  {
    question: "¿Cómo funcionan los pagos? ¿Cuándo recibo mi dinero?",
    answer: "Los pacientes pagan por adelantado al agendar. El dinero se retiene en una cuenta escrow y se libera a tu cuenta bancaria 24 horas después de completar la consulta. Esto protege tanto al médico como al paciente. Puedes retirar tu dinero acumulado cada semana o mensualmente."
  },
  {
    question: "¿Necesito equipo especial o internet de alta velocidad?",
    answer: "No necesitas equipo especial. Funciona con cualquier computadora, tablet o smartphone con cámara y micrófono. En cuanto a internet, recomendamos mínimo 5 Mbps de bajada y 2 Mbps de subida para videoconsultas en calidad HD. La plataforma se adapta automáticamente a tu velocidad de internet."
  }
];

const stats = [
  { value: "+5,000", label: "Médicos Activos" },
  { value: "+100,000", label: "Consultas Realizadas" },
  { value: "4.9/5", label: "Satisfacción" },
  { value: "+40%", label: "Aumento Ingresos Promedio" }
];

export default function MedicosPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-600 via-blue-700 to-blue-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              Para Profesionales de la Salud
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transforma tu práctica médica con telemedicina
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Únete a más de 5,000 médicos que están atendiendo más pacientes, 
              aumentando sus ingresos y trabajando con flexibilidad total desde cualquier lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
              >
                <Link href="/auth/register?tipo=medico">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                asChild
                className="border-2 border-white text-white hover:bg-white/10"
              >
                <Link href="#planes">Ver Planes y Precios</Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-white/20">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Herramientas profesionales a tu alcance
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Todo lo que necesitas para ofrecer atención médica de excelencia en el mundo digital
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
              >
                <div className="bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900 dark:to-teal-900 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-950 dark:to-teal-950 p-12 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">+5,000</div>
                  <p className="text-xl text-gray-700 dark:text-gray-300">Médicos Registrados</p>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-bold text-teal-600 dark:text-teal-400 mb-2">+40%</div>
                  <p className="text-xl text-gray-700 dark:text-gray-300">Aumento de Ingresos</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Ventajas exclusivas para médicos
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Médicos de todas las especialidades están transformando su práctica 
                profesional y mejorando su calidad de vida con Red-Salud.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-teal-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comienza a atender pacientes en línea en menos de 48 horas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((step) => (
              <div 
                key={step.title}
                className="text-center"
              >
                <div className="bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-900 dark:to-teal-900 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <step.icon className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planes" className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Planes diseñados para tu crecimiento
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tu práctica médica
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <div 
                key={plan.name}
                className={`relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? "border-blue-500 dark:border-blue-400 scale-105" 
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Más Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  asChild
                  className={`w-full ${plan.popular ? "bg-gradient-to-r from-blue-600 to-teal-600" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href={`/auth/register?tipo=medico&plan=${plan.name.toLowerCase()}`}>
                    {plan.cta}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Lo que dicen los médicos
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Profesionales de la salud que ya están transformando sus consultorios
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 dark:border-gray-700"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                      {testimonial.name.split(' ')[0].charAt(0)}{testimonial.name.split(' ')[1]?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.specialty}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Resolvemos tus dudas sobre la plataforma
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 dark:border-gray-700 rounded-xl px-6 data-[state=open]:bg-blue-50 dark:data-[state=open]:bg-blue-950/20 data-[state=open]:border-blue-200 dark:data-[state=open]:border-blue-800"
                >
                  <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-700 dark:text-gray-300 leading-relaxed pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Comienza a atender pacientes hoy
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de médicos que ya están creciendo profesional y económicamente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              asChild
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
            >
              <Link href="/auth/register?tipo=medico">
                Registrarme Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              asChild
              className="border-2 border-white text-white hover:bg-white/10"
            >
              <Link href="/contacto">Agendar Demo Personalizada</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

