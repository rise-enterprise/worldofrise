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
        backgroundColor: "rgba(6,6,8,0.85)",
        backdropFilter: "blur(20px) saturate(1.2)",
        borderBottom: `1px solid ${isCrisis ? "rgba(184,74,74,0.12)" : "rgba(138,138,148,0.06)"}`,
      }}
    >
      {/* Left: System identity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: isCrisis ? "#b84a4a" : "#5a8a6a",
              boxShadow: isCrisis ? "0 0 8px rgba(184,74,74,0.5)" : "0 0 6px rgba(90,138,106,0.3)",
            }}
          />
          <span className="text-[9px] uppercase tracking-[0.25em] font-mono" style={{ color: isCrisis ? "#b84a4a" : "#8a8a94" }}>
            {isCrisis ? "ALERT ACTIVE" : "RISE INTELLIGENCE SYSTEM"}
          </span>
        </div>

        {/* Mode selector — titanium pills */}
        <div className="hidden md:flex items-center gap-1">
          {(Object.keys(PERSONALITIES) as AIPersonality[]).map((p) => {
            const pc = PERSONALITIES[p];
            const active = personality === p;
            return (
              <button
                key={p}
                onClick={() => setPersonality(p)}
                className="px-2.5 py-1 rounded text-[8px] uppercase tracking-[0.15em] font-mono transition-all duration-300"
                style={{
                  backgroundColor: active ? "rgba(138,138,148,0.08)" : "transparent",
                  color: active ? pc.accentHex : "#4a4a54",
                  border: active ? `1px solid ${pc.accentHex}15` : "1px solid transparent",
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
          { label: "MEMBERS", value: totalMembers, color: "#8a8a94" },
          { label: "ACTIVE", value: activeMembers, color: "#5a8a6a" },
          { label: "VISITS/MO", value: visitsMonth, color: "#8a8a94" },
          { label: "VIP", value: vipCount, color: "#C8A24A" },
          { label: "AT RISK", value: churnRisk, color: "#b84a4a" },
        ].map(({ label, value, color }) => (
          <div key={label} className="hidden sm:flex flex-col items-end">
            <span className="text-[7px] uppercase tracking-[0.2em] font-mono" style={{ color: "#4a4a54" }}>
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
