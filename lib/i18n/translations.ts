// ===================================================================
// ARCHIVO REFACTORIZADO - Traducciones Modulares
// ===================================================================
// Este archivo importa y re-exporta todos los módulos de traducción
// que han sido organizados en la carpeta ./translations/

import { 
  commonTranslations,
  dashboardTranslations,
  preferencesTranslations,
  authTranslations,
  profileTranslations,
  appointmentsTranslations,
  medicalTranslations,
  messagesTranslations,
  errorsTranslations,
} from './translations/index';

export {
  type LanguageCode,
  translations,
  getTranslations,
  t,
  interpolate,
} from './translations/index';

// Tipos exportados para compatibilidad
export type Language = "es" | "en" | "pt" | "fr" | "it";

export interface Translations {
  [key: string]: string | Translations;
}

// Re-exportar módulos individuales para acceso directo
export {
  commonTranslations,
  dashboardTranslations,
  preferencesTranslations,
  authTranslations,
  profileTranslations,
  appointmentsTranslations,
  medicalTranslations,
  messagesTranslations,
  errorsTranslations,
};
