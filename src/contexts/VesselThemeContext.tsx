import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type VesselMode = "day" | "night";

interface VesselThemeContextValue {
  mode: VesselMode;
  toggleMode: () => void;
  isDay: boolean;
  colors: {
    bg: string;
    accent: string;
    grid: string;
    glow: string;
    particle: string;
    fog: string;
    text: string;
    textMuted: string;
    border: string;
    corePrimary: string;
    coreSecondary: string;
  };
}

const NIGHT_COLORS = {
  bg: "#0a0a0f",
  accent: "#C8A24A",
  grid: "#C8A24A",
  glow: "#d4b86a",
  particle: "#C8A24A",
  fog: "#0a0a0f",
  text: "#f0ece4",
  textMuted: "#8a8578",
  border: "rgba(200,162,74,0.08)",
  corePrimary: "#C8A24A",
  coreSecondary: "#d4b86a",
};

const DAY_COLORS = {
  bg: "#f8f5f0",
  accent: "#b8944a",
  grid: "#b8944a",
  glow: "#d4c088",
  particle: "#b8944a",
  fog: "#f0ece4",
  text: "#1a1510",
  textMuted: "#8a7d6a",
  border: "rgba(200,162,74,0.06)",
  corePrimary: "#b8944a",
  coreSecondary: "#8a7a62",
};

const VesselThemeContext = createContext<VesselThemeContextValue | null>(null);

export function VesselThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<VesselMode>("night");

  const toggleMode = useCallback(() => {
    setMode(prev => prev === "day" ? "night" : "day");
  }, []);

  const isDay = mode === "day";
  const colors = isDay ? DAY_COLORS : NIGHT_COLORS;

  return (
    <VesselThemeContext.Provider value={{ mode, toggleMode, isDay, colors }}>
      {children}
    </VesselThemeContext.Provider>
  );
}

export function useVesselTheme() {
  const ctx = useContext(VesselThemeContext);
  if (!ctx) throw new Error("useVesselTheme must be used within VesselThemeProvider");
  return ctx;
}
