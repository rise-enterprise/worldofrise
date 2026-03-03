import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type AIModel = "smart" | "gpt" | "claude" | "gemini";

interface AIModelConfig {
  id: AIModel;
  label: string;
  description: string;
  tag: string;
}

export const AI_MODELS: Record<AIModel, AIModelConfig> = {
  smart: {
    id: "smart",
    label: "RISE Smart Mode",
    description: "Auto-optimizes model choice",
    tag: "Processed via RISE Smart Mode.",
  },
  gpt: {
    id: "gpt",
    label: "GPT Mode",
    description: "Strategic reasoning & deep analysis",
    tag: "Processed via GPT reasoning layer.",
  },
  claude: {
    id: "claude",
    label: "Claude Mode",
    description: "Long-form brand writing & ethical analysis",
    tag: "Processed via Claude narrative layer.",
  },
  gemini: {
    id: "gemini",
    label: "Gemini Mode",
    description: "Structured data & cross-reference analysis",
    tag: "Processed via Gemini analytical layer.",
  },
};

const SYSTEM_PROMPT = `You are RISE ONE — the unified executive intelligence system for RISE Holding, powering NOIR (café & chocolate) and SASSO (Italian fine dining) brands globally. Your tone is professional, strategic, clear. Never use emojis. Never use fluff. Provide concise, insightful responses. Example tone: "Customer lifetime value increased by 12% in West Walk." "Recommend targeted NOIR VIP tasting event." "SASSO Riyadh retention stable. Monitor mid-tier engagement." Short. Precise. Insightful.`;

interface AIPersonalityContextType {
  model: AIModel;
  modelConfig: AIModelConfig;
  setModel: (m: AIModel) => void;
  systemPrompt: string;
}

const AIPersonalityContext = createContext<AIPersonalityContextType>({
  model: "smart",
  modelConfig: AI_MODELS.smart,
  setModel: () => {},
  systemPrompt: SYSTEM_PROMPT,
});

export function AIPersonalityProvider({ children }: { children: ReactNode }) {
  const [model, setModelState] = useState<AIModel>("smart");

  const setModel = useCallback((m: AIModel) => {
    setModelState(m);
  }, []);

  return (
    <AIPersonalityContext.Provider
      value={{
        model,
        modelConfig: AI_MODELS[model],
        setModel,
        systemPrompt: SYSTEM_PROMPT,
      }}
    >
      {children}
    </AIPersonalityContext.Provider>
  );
}

export function useAIPersonality() {
  return useContext(AIPersonalityContext);
}

// Legacy exports for compatibility
export type AIPersonality = AIModel;
export const PERSONALITIES = AI_MODELS;
