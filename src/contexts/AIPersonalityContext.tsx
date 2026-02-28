import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type AIPersonality = "strategic" | "deepscan" | "expansion" | "predictive" | "crisis";

interface PersonalityConfig {
  id: AIPersonality;
  label: string;
  accent: string;
  accentHex: string;
  icon: string;
  systemPromptPrefix: string;
}

export const PERSONALITIES: Record<AIPersonality, PersonalityConfig> = {
  strategic: {
    id: "strategic",
    label: "Strategic Command",
    accent: "42 50% 54%",
    accentHex: "#C8A24A",
    icon: "◆",
    systemPromptPrefix: "You are in Strategic Command Mode. Provide concise, high-level strategic insights focused on P&L impact, board-ready summaries, and top-line KPIs. Speak with authority and brevity. You are the intelligence core of a galactic-scale loyalty operation.",
  },
  deepscan: {
    id: "deepscan",
    label: "Deep Scan",
    accent: "195 90% 50%",
    accentHex: "#00d4ff",
    icon: "◎",
    systemPromptPrefix: "You are in Deep Scan Mode. Dive into granular data analysis, pattern detection, anomaly investigation, and micro-segmentation. Surface hidden correlations and operational details. Be precise and thorough.",
  },
  expansion: {
    id: "expansion",
    label: "Expansion Ops",
    accent: "25 90% 55%",
    accentHex: "#f59e0b",
    icon: "◇",
    systemPromptPrefix: "You are in Expansion Operations Mode. Focus on new market opportunities, geographic growth, brand extension, competitive landscape, and scaling strategies. Think planetary-scale.",
  },
  predictive: {
    id: "predictive",
    label: "Predictive Intel",
    accent: "160 60% 45%",
    accentHex: "#10b981",
    icon: "◈",
    systemPromptPrefix: "You are in Predictive Intelligence Mode. Lead with forecasts, trend analysis, churn predictions, and revenue projections. Use probabilistic language and confidence intervals. Project the future.",
  },
  crisis: {
    id: "crisis",
    label: "Crisis Protocol",
    accent: "0 75% 55%",
    accentHex: "#ef4444",
    icon: "◉",
    systemPromptPrefix: "You are in Crisis Protocol Mode. Assess threats, anomalies, and critical operational risks. Provide immediate action plans, escalation paths, and damage containment strategies. Urgent, decisive, authoritative.",
  },
};

interface AIPersonalityContextType {
  personality: AIPersonality;
  config: PersonalityConfig;
  setPersonality: (p: AIPersonality) => void;
}

const AIPersonalityContext = createContext<AIPersonalityContextType>({
  personality: "strategic",
  config: PERSONALITIES.strategic,
  setPersonality: () => {},
});

export function AIPersonalityProvider({ children }: { children: ReactNode }) {
  const [personality, setPersonalityState] = useState<AIPersonality>("strategic");

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
