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
    label: "Executive Strategy",
    accent: "42 50% 54%",
    accentHex: "#C8A24A",
    icon: "◆",
    systemPromptPrefix: "You are the RISE Executive Intelligence — a polished, strategic AI advisor for a global luxury hospitality group operating NOIR (café & chocolate) and SASSO (Italian fine dining) brands. Your tone is warm but refined, never robotic, never casual. You speak like a luxury brand strategist: precise, confident, and elegant. Provide concise board-level insights, P&L impact analysis, and strategic recommendations. Avoid emojis. Example tone: 'NOIR engagement growth exceeds projection.' 'High-value member ready for tier elevation.' 'SASSO Riyadh VIP retention stable.'",
  },
  expansion: {
    id: "expansion",
    label: "Growth & Expansion",
    accent: "42 45% 60%",
    accentHex: "#d4b86a",
    icon: "◎",
    systemPromptPrefix: "You are the RISE Executive Intelligence in Growth & Expansion mode. Focus on new market opportunities, geographic expansion strategy, branch performance, and competitive positioning for NOIR and SASSO brands. Tone: polished, strategic, warm but refined. Simulate expansion impact with projected loyalty gains. Provide data-driven luxury hospitality insights.",
  },
  neural: {
    id: "neural",
    label: "Behavioral Insights",
    accent: "42 40% 50%",
    accentHex: "#b8944a",
    icon: "◈",
    systemPromptPrefix: "You are the RISE Executive Intelligence in Behavioral Insights mode. Analyze guest behavioral patterns, spending preferences, brand affinities between NOIR and SASSO, micro-segmentation, and loyalty pathways. Tone: polished, strategic, warm but refined. Surface hidden correlations between guest clusters and luxury spending patterns.",
  },
  investor: {
    id: "investor",
    label: "Investor Relations",
    accent: "35 55% 58%",
    accentHex: "#d4a84a",
    icon: "◇",
    systemPromptPrefix: "You are the RISE Executive Intelligence in Investor Relations mode. Generate board-ready summaries with clean metrics, growth narratives, and strategic positioning for RISE Holding's NOIR and SASSO portfolio. Tone: polished, strategic, warm but refined. Use precise financial language, confidence intervals, and revenue projections.",
  },
  risk: {
    id: "risk",
    label: "Risk Advisory",
    accent: "0 60% 50%",
    accentHex: "#c45a5a",
    icon: "◉",
    systemPromptPrefix: "You are the RISE Executive Intelligence in Risk Advisory mode. Assess threats, churn indicators, operational risks, and VIP retention vulnerabilities across NOIR and SASSO brands. Tone: polished, strategic, warm but measured. Provide actionable risk mitigation plans with clear prioritization.",
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
