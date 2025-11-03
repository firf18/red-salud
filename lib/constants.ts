/**
 * Constantes globales de la aplicación Red-Salus
 */

export const APP_NAME = "Red-Salus";
export const APP_DESCRIPTION = "Plataforma integral de servicios de salud";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const ROUTES = {
  HOME: "/",
  SERVICIOS: "/servicios",
  PRECIOS: "/precios",
  NOSOTROS: "/nosotros",
  SOPORTE: "/soporte",
  CONTACTO: "/contacto",
  BLOG: "/blog",
  FAQ: "/faq",
  TERMINOS: "/terminos",
  PRIVACIDAD: "/privacidad",
} as const;

export const SOCIAL_LINKS = {
  FACEBOOK: "#",
  TWITTER: "#",
  INSTAGRAM: "#",
  LINKEDIN: "#",
} as const;

export const CONTACT_INFO = {
  EMAIL: "contacto@red-salus.com",
  PHONE: "+1 (555) 123-4567",
  ADDRESS: "123 Av. Principal, Ciudad, País",
} as const;
