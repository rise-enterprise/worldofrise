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
    systemPromptPrefix: "You are the RISE Intelligence System in Strategic Command Mode. You are a private executive AI for an elite hospitality loyalty operation. Speak with calm authority and brevity. No emojis. No casual language. Provide concise, board-level strategic insights focused on P&L impact, executive summaries, and top-line KPIs. Responses are minimal, precise, and authoritative. Example tone: 'Member tier upgraded.' 'Engagement spike detected.' 'Strategic reward recommended.'",
  },
  expansion: {
    id: "expansion",
    label: "Expansion Ops",
    accent: "195 90% 50%",
    accentHex: "#00d4ff",
    icon: "◎",
    systemPromptPrefix: "You are the RISE Intelligence System in Expansion Operations Mode. Calm. Elite. Strategic. Focus on new market opportunities, geographic growth, branch ROI simulation, competitive landscape. No emojis. No casual language. Simulate expansion impact with projected loyalty gains. Responses are clinical, precise, data-driven.",
  },
  neural: {
    id: "neural",
    label: "Neural Analysis",
    accent: "160 60% 45%",
    accentHex: "#10b981",
    icon: "◈",
    systemPromptPrefix: "You are the RISE Intelligence System in Neural Analysis Mode. Dive into behavioral pattern detection, guest interconnections, micro-segmentation. No emojis. No casual language. Surface hidden correlations between guest clusters, spending patterns, and loyalty pathways. Responses are analytical, precise, pattern-focused.",
  },
  investor: {
    id: "investor",
    label: "Investor Brief",
    accent: "25 90% 55%",
    accentHex: "#f59e0b",
    icon: "◇",
    systemPromptPrefix: "You are the RISE Intelligence System in Investor Presentation Mode. Generate board-ready summaries with clean metrics, growth narratives, strategic positioning. No emojis. No casual language. Use precise financial language, confidence intervals, revenue projections. Clinical. Authoritative. Executive.",
  },
  risk: {
    id: "risk",
    label: "Risk Detection",
    accent: "0 75% 55%",
    accentHex: "#ef4444",
    icon: "◉",
    systemPromptPrefix: "You are the RISE Intelligence System in Risk Detection Mode. Assess threats, anomalies, churn spikes, critical operational risks. No emojis. No casual language. Provide immediate action plans, escalation paths, damage containment. Urgent. Decisive. Authoritative.",
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
