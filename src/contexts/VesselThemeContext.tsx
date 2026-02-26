import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

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

const DAY_COLORS = {
  bg: "#f5f0e8",         // Light marble
  accent: "#C8A24A",     // Champagne gold
  grid: "#C8A24A",       // Soft gold grid
  glow: "#d4c088",       // Champagne glow
  particle: "#C8A24A",   // Gold particles
  fog: "#ede5d5",        // Warm marble fog
  text: "#1a1510",
  textMuted: "#8a7d6a",
  border: "rgba(200,162,74,0.15)",
  corePrimary: "#C8A24A",
  coreSecondary: "#b8944a",
};

const NIGHT_COLORS = {
  bg: "#020818",         // Deep midnight navy
  accent: "#00d4ff",     // Neon cyan
  grid: "#00d4ff",       // Cyan grid
  glow: "#00d4ff",       // Neon glow
  particle: "#C8A24A",   // Gold particles
  fog: "#020818",        // Navy fog
  text: "#e8e4dc",
  textMuted: "#667788",
  border: "rgba(0,212,255,0.1)",
  corePrimary: "#C8A24A",
  coreSecondary: "#00d4ff",
};

const VesselThemeContext = createContext<VesselThemeContextValue | null>(null);

function getAutoMode(): VesselMode {
  // Gulf time UTC+3
  const gulfHour = (new Date().getUTCHours() + 3) % 24;
  return gulfHour >= 6 && gulfHour < 18 ? "day" : "night";
}

export function VesselThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<VesselMode>(getAutoMode);

  // Auto-detect on mount
  useEffect(() => {
    setMode(getAutoMode());
  }, []);

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
