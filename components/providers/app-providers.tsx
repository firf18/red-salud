"use client";

import { Provider } from "react-redux";
import store from "@/lib/redux/store";
import { ThemeProvider } from "@/lib/contexts/theme-context";
import { LanguageProvider } from "@/lib/contexts/language-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </ThemeProvider>
    </Provider>
  );
}
