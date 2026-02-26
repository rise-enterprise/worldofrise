import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type AIPersonality = "executive" | "marketing" | "operations" | "predictive" | "expansion";

interface PersonalityConfig {
  id: AIPersonality;
  label: string;
  accent: string;       // HSL values for CSS var override
  accentHex: string;    // Hex for 3D elements
  icon: string;
  systemPromptPrefix: string;
}

export const PERSONALITIES: Record<AIPersonality, PersonalityConfig> = {
  executive: {
    id: "executive",
    label: "Executive",
    accent: "42 50% 54%",       // Gold
    accentHex: "#C8A24A",
    icon: "👔",
    systemPromptPrefix: "You are in Executive Mode. Provide concise, high-level strategic insights focused on P&L impact, board-ready summaries, and top-line KPIs. Speak with authority and brevity.",
  },
  marketing: {
    id: "marketing",
    label: "Marketing",
    accent: "280 60% 55%",      // Purple
    accentHex: "#a855f7",
    icon: "📣",
    systemPromptPrefix: "You are in Marketing Mode. Focus on campaign performance, guest engagement, brand positioning, and growth opportunities. Use creative, persuasive language with data backing.",
  },
  operations: {
    id: "operations",
    label: "Operations",
    accent: "160 60% 45%",      // Emerald
    accentHex: "#10b981",
    icon: "⚙️",
    systemPromptPrefix: "You are in Operations Mode. Focus on operational efficiency, staffing, branch performance, service quality, and process optimization. Be precise and actionable.",
  },
  predictive: {
    id: "predictive",
    label: "Predictive",
    accent: "195 90% 50%",      // Cyan
    accentHex: "#00d4ff",
    icon: "🔮",
    systemPromptPrefix: "You are in Predictive Mode. Lead with forecasts, trend analysis, churn predictions, and revenue projections. Use probabilistic language and confidence intervals.",
  },
  expansion: {
    id: "expansion",
    label: "Expansion",
    accent: "25 90% 55%",       // Amber/Orange
    accentHex: "#f59e0b",
    icon: "🌍",
    systemPromptPrefix: "You are in Expansion Mode. Focus on new market opportunities, geographic growth, brand extension, competitive landscape, and scaling strategies. Think big-picture.",
  },
};

interface AIPersonalityContextType {
  personality: AIPersonality;
  config: PersonalityConfig;
  setPersonality: (p: AIPersonality) => void;
}

const AIPersonalityContext = createContext<AIPersonalityContextType>({
  personality: "executive",
  config: PERSONALITIES.executive,
  setPersonality: () => {},
});

export function AIPersonalityProvider({ children }: { children: ReactNode }) {
  const [personality, setPersonalityState] = useState<AIPersonality>("executive");

  const setPersonality = useCallback((p: AIPersonality) => {
    setPersonalityState(p);
  }, []);

  return (
    <AIPersonalityContext.Provider
      value={{
        personality,
        config: PERSONALITIES[personality],
        setPersonality,
      }}
    >
      {children}
    </AIPersonalityContext.Provider>
  );
}

export function useAIPersonality() {
  return useContext(AIPersonalityContext);
}
