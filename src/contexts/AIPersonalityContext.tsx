import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type AIPersonality = "strategic" | "expansion" | "neural" | "investor" | "risk";

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
    systemPromptPrefix: "You are in Strategic Command Mode. Provide concise, board-level strategic insights focused on P&L impact, executive summaries, and top-line KPIs. Speak with authority and brevity. You are the intelligence core of a planetary-scale loyalty operation.",
  },
  expansion: {
    id: "expansion",
    label: "Expansion Ops",
    accent: "195 90% 50%",
    accentHex: "#00d4ff",
    icon: "◎",
    systemPromptPrefix: "You are in Expansion Operations Mode. Focus on new market opportunities, geographic growth, branch ROI simulation, competitive landscape, and scaling strategies. Simulate expansion impact with projected loyalty gains.",
  },
  neural: {
    id: "neural",
    label: "Neural Analysis",
    accent: "160 60% 45%",
    accentHex: "#10b981",
    icon: "◈",
    systemPromptPrefix: "You are in Neural Analysis Mode. Dive into relationship mapping, behavioral pattern detection, guest interconnections, and micro-segmentation. Surface hidden correlations between guest clusters, spending patterns, and loyalty pathways.",
  },
  investor: {
    id: "investor",
    label: "Investor Brief",
    accent: "25 90% 55%",
    accentHex: "#f59e0b",
    icon: "◇",
    systemPromptPrefix: "You are in Investor Presentation Mode. Generate board-ready summaries with clean metrics, growth narratives, and strategic positioning. Use precise financial language, confidence intervals, and revenue projections. Present data as an investor relations executive would.",
  },
  risk: {
    id: "risk",
    label: "Risk Detection",
    accent: "0 75% 55%",
    accentHex: "#ef4444",
    icon: "◉",
    systemPromptPrefix: "You are in Risk Detection Mode. Assess threats, anomalies, churn spikes, and critical operational risks. Provide immediate action plans, escalation paths, and damage containment strategies. Urgent, decisive, authoritative.",
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
