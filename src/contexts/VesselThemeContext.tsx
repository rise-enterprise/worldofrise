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
  bg: "#08060a",
  accent: "#C8A24A",
  grid: "#C8A24A",
  glow: "#C8A24A",
  particle: "#C8A24A",
  fog: "#08060a",
  text: "#e8e4dc",
  textMuted: "#6a6058",
  border: "rgba(200,162,74,0.08)",
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
