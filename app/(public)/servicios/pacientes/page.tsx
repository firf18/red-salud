import type { Metadata } from "next";
import { 
  CheckCircle2, 
  Clock, 
  Shield, 
  Video, 
  FileText, 
  Heart,
  ArrowRight,
  Calendar,
  UserCheck,
  CreditCard,
  Star
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
  title: "Servicios para Pacientes",
  description: "Consultas médicas en línea, historial médico digital y atención personalizada 24/7",
};

const features = [
  {
    icon: Video,
    title: "Videoconsultas",
    description: "Conecta con médicos certificados desde la comodidad de tu hogar"
  },
  {
    icon: Clock,
    title: "Atención 24/7",
    description: "Disponibilidad de profesionales de salud las 24 horas del día"
  },
  {
    icon: FileText,
    title: "Historial Digital",
    description: "Accede a tu historial médico completo desde cualquier dispositivo"
  },
  {
    icon: Shield,
    title: "Datos Seguros",
    description: "Encriptación de extremo a extremo para proteger tu información"
  },
  {
    icon: Heart,
    title: "Seguimiento Personalizado",
    description: "Planes de tratamiento adaptados a tus necesidades específicas"
  },
];

const benefits = [
  "Sin tiempos de espera prolongados",
  "Prescripciones médicas digitales",
  "Recordatorios de medicamentos",
  "Análisis de laboratorio en línea",
  "Segunda opinión médica",
  "Historial médico compartido con especialistas",
];

const howItWorks = [
  {
    icon: UserCheck,
    title: "1. Crea tu perfil",
    description: "Regístrate gratis en menos de 2 minutos. Completa tu información médica básica."
  },
  {
    icon: Calendar,
    title: "2. Busca y agenda",
    description: "Encuentra médicos por especialidad, ubicación o disponibilidad. Agenda tu cita al instante."
  },
  {
    icon: Video,
    title: "3. Consulta online",
    description: "Conéctate desde cualquier dispositivo. Videollamadas HD con tu médico."
  },
  {
    icon: FileText,
    title: "4. Recibe atención",
    description: "Obtén diagnóstico, recetas digitales y seguimiento personalizado."
  },
];

const testimonials = [
  {
    name: "María González",
    location: "Caracas",
    rating: 5,
    comment: "Increíble servicio. Pude consultar con un cardiólogo desde mi casa en menos de 24 horas."
  },
  {
    name: "Carlos Pérez",
    location: "Valencia",
    rating: 5,
    comment: "La plataforma es muy fácil de usar. Los médicos son profesionales y atentos."
  },
  {
    name: "Ana Rodríguez",
    location: "Maracaibo",
    rating: 5,
    comment: "Ahorro tiempo y dinero. Ya no necesito salir de casa para consultas de rutina."
  },
];

const faqs = [
  {
    question: "¿Cómo funciona una videoconsulta?",
    answer: "Una videoconsulta es una cita médica virtual a través de videollamada. Funciona igual que una consulta presencial: hablas con el médico, describes tus síntomas, y recibes diagnóstico y tratamiento. La diferencia es que todo ocurre desde la comodidad de tu hogar."
  },
  {
    question: "¿Las recetas digitales son válidas?",
    answer: "Sí, absolutamente. Nuestras recetas médicas digitales cuentan con firma electrónica certificada y son válidas en todas las farmacias afiliadas a nuestra red en Venezuela. Puedes descargarlas en PDF o enviarlas directamente a la farmacia de tu elección."
  },
  {
    question: "¿Qué necesito para una videoconsulta?",
    answer: "Solo necesitas un dispositivo con cámara y micrófono (computadora, tablet o smartphone), conexión a internet estable, y la app de Red-Salud o acceso web. No necesitas descargar programas adicionales."
  },
  {
    question: "¿Cuánto cuesta una consulta?",
    answer: "Los precios varían según la especialidad y el médico. En promedio, una consulta general cuesta entre $10-$20 USD, mientras que especialistas pueden costar entre $20-$40 USD. Todos los precios se muestran antes de agendar. Consulta nuestros planes de suscripción para obtener descuentos."
  },
  {
    question: "¿Puedo usar mi seguro médico?",
    answer: "Sí, trabajamos con las principales aseguradoras de Venezuela. Si tienes póliza con alguna de nuestras aseguradoras aliadas, puedes usar tu cobertura. Verifica con tu aseguradora antes de agendar."
  },
  {
    question: "¿Qué pasa si necesito exámenes o medicamentos?",
    answer: "Si el médico requiere exámenes, puedes agendarlos con nuestros laboratorios afiliados. Los resultados se subirán automáticamente a tu historial. Para medicamentos, la receta digital se envía directamente a nuestra red de farmacias, donde puedes recogerlos o solicitar delivery."
  },
];

export default function PacientesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-teal-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Tu salud, a un clic de distancia
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              Consultas médicas en línea con profesionales certificados. 
              Cuida tu salud sin salir de casa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
              >
                <Link href="/register/paciente">
                  Registrarse Gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                asChild
                className="border-2 border-white text-white hover:bg-white/10"
              >
                <Link href="/precios">Ver Planes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Todo lo que necesitas para cuidar tu salud
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Una plataforma completa diseñada para facilitarte el acceso a servicios de salud de calidad
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="bg-blue-100 dark:bg-blue-900 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
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
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Beneficios exclusivos para ti
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Únete a miles de pacientes que ya están disfrutando de una experiencia 
                de salud moderna, accesible y personalizada.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-linear-to-br from-blue-100 to-teal-100 dark:from-blue-950 dark:to-teal-950 p-8 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">24/7</div>
                  <p className="text-xl text-gray-700 dark:text-gray-300">Atención disponible</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Regístrate hoy y obtén tu primera consulta con descuento especial
          </p>
          <Button 
            size="lg" 
            asChild
            className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
          >
            <Link href="/auth/register?tipo=paciente">
              Crear Cuenta Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Cuatro simples pasos para acceder a atención médica de calidad
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

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Lo que dicen nuestros pacientes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Miles de venezolanos confían en Red-Salud para su atención médica
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
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
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Preguntas frecuentes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Resolvemos tus dudas sobre nuestros servicios
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-6 data-[state=open]:bg-blue-50 dark:data-[state=open]:bg-gray-700 data-[state=open]:border-blue-200 dark:data-[state=open]:border-blue-600"
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
      <section className="py-20 bg-gradient-to-br from-blue-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Comienza hoy mismo
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a más de 10,000 pacientes que ya cuidan su salud con Red-Salud
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              asChild
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl"
            >
              <Link href="/auth/register?tipo=paciente">
                Registrarse Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              asChild
              className="border-2 border-white text-white hover:bg-white/10"
            >
              <Link href="/servicios/medicos">Ver Médicos Disponibles</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
