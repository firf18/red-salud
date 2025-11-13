"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES, APP_NAME, AUTH_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/contexts/theme-context";

const servicios = [
  { name: "Pacientes", href: "/servicios/pacientes", description: "Consultas médicas en línea" },
  { name: "Médicos", href: "/servicios/medicos", description: "Plataforma para profesionales" },
  { name: "Clínicas", href: "/servicios/clinicas", description: "Gestión de centros médicos" },
  { name: "Laboratorios", href: "/servicios/laboratorios", description: "Análisis y resultados" },
  { name: "Farmacias", href: "/servicios/farmacias", description: "Gestión de medicamentos" },
  { name: "Ambulancias", href: "/servicios/ambulancias", description: "Servicio de emergencias" },
  { name: "Seguros", href: "/servicios/seguros", description: "Gestión de pólizas" },
];

const navItems = [
  { name: "Inicio", href: ROUTES.HOME },
  { name: "Nosotros", href: ROUTES.NOSOTROS },
  { name: "Servicios", href: ROUTES.SERVICIOS, hasDropdown: true },
  { name: "Precios", href: ROUTES.PRECIOS },
  { name: "Blog", href: ROUTES.BLOG },
  { name: "Soporte", href: ROUTES.SOPORTE },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServiciosOpen, setIsServiciosOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/80 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href={ROUTES.HOME} className="flex items-center space-x-2">
              <span
                className={cn(
                  "font-bold text-lg sm:text-2xl transition-colors duration-300",
                  isScrolled ? "text-gray-900 dark:text-white" : "text-white"
                )}
              >
                {APP_NAME}
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            className="hidden xl:flex items-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setIsServiciosOpen(true)}
                onMouseLeave={() => item.hasDropdown && setIsServiciosOpen(false)}
              >
                {item.hasDropdown ? (
                  <>
                    <Link
                      href={item.href}
                    className={cn(
                      "px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-1",
                      isScrolled
                        ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    )}
                    >
                      {item.name}
                      <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isServiciosOpen && "rotate-180")} />
                    </Link>
                    
                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isServiciosOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                        >
                          <div className="p-2">
                            {servicios.map((servicio) => (
                              <Link
                                key={servicio.name}
                                href={servicio.href}
                                className="block px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 group"
                              >
                                <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {servicio.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {servicio.description}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105",
                      isScrolled
                        ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
                        : "text-white/90 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {item.name}
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Theme Toggle + Auth Buttons Desktop */}
          <motion.div
            className="hidden xl:flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <ThemeToggle isScrolled={isScrolled} />
            <Button
              asChild
              variant="outline"
              className={cn(
                "border-2 transition-all duration-300",
                isScrolled
                  ? "border-blue-600 text-blue-600 hover:bg-blue-50 bg-white dark:border-white dark:text-white dark:hover:bg-white/10"
                  : "border-white text-white hover:bg-white hover:text-blue-600 bg-white/10 backdrop-blur-sm"
              )}
            >
              <Link href={AUTH_ROUTES.LOGIN}>Iniciar Sesión</Link>
            </Button>
            <Button
              asChild
              className="bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href={AUTH_ROUTES.REGISTER}>Registrarse</Link>
            </Button>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="xl:hidden p-2 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X
                className={cn(
                  "h-6 w-6",
                  isScrolled ? "text-gray-900" : "text-white"
                )}
              />
            ) : (
              <Menu
                className={cn(
                  "h-6 w-6",
                  isScrolled ? "text-gray-900" : "text-white"
                )}
              />
            )}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="xl:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-6 space-y-3">
              {navItems.map((item) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.hasDropdown ? (
                    <MobileServiciosItem />
                  ) : (
                    <Link
                      href={item.href}
                      className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-300 font-medium dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="pt-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <ThemeToggle isScrolled={isScrolled} />
                </div>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <Link
                    href={AUTH_ROUTES.LOGIN}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-linear-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                >
                  <Link
                    href={AUTH_ROUTES.REGISTER}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function ThemeToggle({ isScrolled }: { isScrolled: boolean }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const classes = isScrolled
    ? "inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200 bg-white text-blue-600 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
    : "inline-flex items-center justify-center w-9 h-9 rounded-md border border-white/30 bg-black/40 text-white backdrop-blur-md hover:bg-black/50";
  return (
    <button onClick={toggleTheme} aria-label="Toggle theme" className={classes}>
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M6.34 17.66l-1.41 1.41"></path><path d="M19.07 4.93l-1.41 1.41"></path></svg>;
}

function MoonIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
}

function MobileServiciosItem() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-300 font-medium flex items-center justify-between"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-servicios"
      >
        Servicios
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-servicios"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 ml-2 border-l border-gray-200"
          >
            <div className="pl-4 space-y-1">
              {servicios.map((s) => (
                <Link key={s.name} href={s.href} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600" >
                  {s.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
