"use client";

import { ThemeProvider } from "@/lib/contexts/theme-context";
import { LanguageProvider } from "@/lib/contexts/language-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
