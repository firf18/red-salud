"use client";

import { Provider } from "react-redux";
import store from "@/lib/redux/store";
import { PreferencesProvider } from "@/lib/contexts/preferences-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PreferencesProvider>
        {children}
      </PreferencesProvider>
    </Provider>
  );
}
