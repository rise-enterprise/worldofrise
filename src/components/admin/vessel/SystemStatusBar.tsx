import { useAIPersonality, PERSONALITIES, type AIPersonality } from "@/contexts/AIPersonalityContext";

interface SystemStatusBarProps {
  isCrisis: boolean;
  totalMembers: number;
  activeMembers: number;
  visitsMonth: number;
  vipCount: number;
  churnRisk: number;
}

export default function SystemStatusBar({
  isCrisis,
  totalMembers,
  activeMembers,
  visitsMonth,
  vipCount,
  churnRisk,
}: SystemStatusBarProps) {
  const { personality, setPersonality, config } = useAIPersonality();

  return (
    <div
      className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-2.5 shrink-0"
      style={{
        backgroundColor: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(24px) saturate(1.3)",
        borderBottom: `1px solid ${isCrisis ? "rgba(184,74,74,0.1)" : "rgba(200,162,74,0.06)"}`,
      }}
    >
      {/* Left: System identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: isCrisis ? "#b84a4a" : "#5a8a6a",
              boxShadow: isCrisis ? "0 0 8px rgba(184,74,74,0.4)" : "0 0 6px rgba(90,138,106,0.25)",
            }}
          />
          <span className="text-[9px] uppercase tracking-[0.25em]" style={{ color: isCrisis ? "#b84a4a" : "#8a8578", fontFamily: "'Georgia', serif" }}>
            {isCrisis ? "ALERT ACTIVE" : "RISE EXECUTIVE INTELLIGENCE"}
          </span>
        </div>

        {/* Mode selector — warm champagne pills */}
        <div className="hidden md:flex items-center gap-1">
          {(Object.keys(PERSONALITIES) as AIPersonality[]).map((p) => {
            const pc = PERSONALITIES[p];
            const active = personality === p;
            return (
              <button
                key={p}
                onClick={() => setPersonality(p)}
                className="px-2.5 py-1 rounded text-[8px] uppercase tracking-[0.15em] transition-all duration-400"
                style={{
                  backgroundColor: active ? "rgba(200,162,74,0.06)" : "transparent",
                  color: active ? pc.accentHex : "#8a8578",
                  border: active ? `1px solid ${pc.accentHex}12` : "1px solid transparent",
                  fontFamily: "'Georgia', serif",
                }}
              >
                {pc.icon} {pc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Metrics strip */}
      <div className="flex items-center gap-4 sm:gap-6">
        {[
          { label: "MEMBERS", value: totalMembers, color: "#C8A24A" },
          { label: "ACTIVE", value: activeMembers, color: "#5a8a6a" },
          { label: "VISITS/MO", value: visitsMonth, color: "#d4b86a" },
          { label: "VIP", value: vipCount, color: "#C8A24A" },
          { label: "AT RISK", value: churnRisk, color: "#b84a4a" },
        ].map(({ label, value, color }) => (
          <div key={label} className="hidden sm:flex flex-col items-end">
            <span className="text-[7px] uppercase tracking-[0.2em]" style={{ color: "#8a8578", fontFamily: "'Georgia', serif" }}>
              {label}
            </span>
            <span className="text-[11px] font-mono tabular-nums" style={{ color }}>
              {value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
