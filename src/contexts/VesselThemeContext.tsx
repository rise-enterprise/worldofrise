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

const GALACTIC_COLORS = {
  bg: "#030810",
  accent: "#00d4ff",
  grid: "#00d4ff",
  glow: "#00d4ff",
  particle: "#C8A24A",
  fog: "#030810",
  text: "#e8e4dc",
  textMuted: "#5a6878",
  border: "rgba(0,212,255,0.08)",
  corePrimary: "#C8A24A",
  coreSecondary: "#00d4ff",
};

const DAY_COLORS = {
  bg: "#f5f0e8",
  accent: "#C8A24A",
  grid: "#C8A24A",
  glow: "#d4c088",
  particle: "#C8A24A",
  fog: "#ede5d5",
  text: "#1a1510",
  textMuted: "#8a7d6a",
  border: "rgba(200,162,74,0.15)",
  corePrimary: "#C8A24A",
  coreSecondary: "#b8944a",
};

const VesselThemeContext = createContext<VesselThemeContextValue | null>(null);

export function VesselThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<VesselMode>("night");

  const toggleMode = useCallback(() => {
    setMode(prev => prev === "day" ? "night" : "day");
  }, []);

  const isDay = mode === "day";
  const colors = isDay ? DAY_COLORS : GALACTIC_COLORS;

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
