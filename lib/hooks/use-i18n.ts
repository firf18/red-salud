"use client";

import { usePreferences } from "@/lib/contexts/preferences-context";
import { getTranslation, type Language } from "@/lib/i18n/translations";

export function useI18n() {
  const { preferences } = usePreferences();
  const lang = preferences.language as Language;

  const t = (key: string, defaultValue?: string) => {
    return getTranslation(lang, key, defaultValue);
  };

  return { t, lang };
}
