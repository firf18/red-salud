import { HeroSection } from "@/components/sections/hero-section";
// Reemplazamos el scroll por especialidades dinámicas
import { SpecialtiesDynamic } from "@/components/sections/specialties-dynamic";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { FeaturesSection } from "@/components/sections/features-section";
import { ImpactSection } from "@/components/sections/impact-section";
import { TechnologySection } from "@/components/sections/technology-section";
import { FAQSection } from "@/components/sections/faq-section";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/constants";
import { FeaturedDoctors } from "@/components/sections/featured-doctors";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <SpecialtiesDynamic />
      <HowItWorksSection />
      <FeaturedDoctors />
      <ImpactSection />
      <TechnologySection />
      <FeaturesSection />
      <FAQSection />
      <section className="py-24 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 relative overflow-hidden">
        {/* Fondo dinámico */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Empieza ahora</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Crea tu cuenta o inicia sesión para agendar tu próxima cita y gestionar tu salud desde un solo lugar.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-xl">
              <a href={AUTH_ROUTES.REGISTER}>Crear cuenta</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-white/50 text-white hover:bg-white/10 hover:border-white bg-transparent backdrop-blur-sm transition-all duration-300 hover:scale-105">
              <a href={AUTH_ROUTES.LOGIN}>Iniciar sesión</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
