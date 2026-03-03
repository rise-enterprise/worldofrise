import { createContext, useContext, ReactNode } from "react";

interface VesselThemeContextValue {
  colors: {
    bg: string;
    surface: string;
    accent: string;
    accentLight: string;
    text: string;
    textMuted: string;
    border: string;
    sand: string;
  };
}

const COLORS = {
  bg: "#faf8f5",
  surface: "#ffffff",
  accent: "#C8A24A",
  accentLight: "#d4b86a",
  text: "#1a1510",
  textMuted: "#8a7d6a",
  border: "rgba(200,162,74,0.08)",
  sand: "#f3efe8",
};

const VesselThemeContext = createContext<VesselThemeContextValue>({ colors: COLORS });

export function VesselThemeProvider({ children }: { children: ReactNode }) {
  return (
    <VesselThemeContext.Provider value={{ colors: COLORS }}>
      {children}
    </VesselThemeContext.Provider>
  );
}

export function useVesselTheme() {
  const ctx = useContext(VesselThemeContext);
  if (!ctx) throw new Error("useVesselTheme must be used within VesselThemeProvider");
  return ctx;
}
