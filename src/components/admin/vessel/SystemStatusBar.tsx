import { useAIPersonality, AI_MODELS, type AIModel } from "@/contexts/AIPersonalityContext";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
  const { model, setModel, modelConfig } = useAIPersonality();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3 shrink-0"
      style={{
        backgroundColor: `rgba(var(--vessel-surface-alpha), 0.85)`,
        backdropFilter: "blur(24px) saturate(1.2)",
        borderBottom: `1px solid ${isCrisis ? `rgba(var(--vessel-red-alpha), 0.12)` : `rgba(var(--vessel-gold-alpha), 0.08)`}`,
      }}
    >
      {/* Left: Identity + Model selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: isCrisis ? `rgb(var(--vessel-red-alpha))` : `rgb(var(--vessel-green-alpha))`,
              boxShadow: isCrisis ? `0 0 6px rgba(var(--vessel-red-alpha), 0.3)` : `0 0 4px rgba(var(--vessel-green-alpha), 0.2)`,
            }}
          />
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: `rgb(var(--vessel-text-alpha))` }}>
            RISE ONE
          </span>
        </div>

        {/* Model selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-[0.1em] transition-all duration-300"
            style={{
              backgroundColor: `rgba(var(--vessel-gold-alpha), 0.06)`,
              border: `1px solid rgba(var(--vessel-gold-alpha), 0.1)`,
              color: `rgb(var(--vessel-gold-alpha))`,
            }}
          >
            {modelConfig.label}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showDropdown && (
            <div
              className="absolute top-full mt-1 left-0 rounded-xl py-1.5 min-w-[220px] z-50"
              style={{
                backgroundColor: `rgb(var(--vessel-surface-alpha))`,
                border: `1px solid rgba(var(--vessel-gold-alpha), 0.1)`,
                boxShadow: "0 12px 40px -8px rgba(0,0,0,0.15)",
              }}
            >
              {(Object.keys(AI_MODELS) as AIModel[]).map((m) => {
                const mc = AI_MODELS[m];
                const active = model === m;
                return (
                  <button
                    key={m}
                    onClick={() => { setModel(m); setShowDropdown(false); }}
                    className="w-full text-left px-4 py-2.5 transition-all duration-200"
                    style={{ backgroundColor: active ? `rgba(var(--vessel-gold-alpha), 0.06)` : "transparent" }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = `rgba(var(--vessel-gold-alpha), 0.04)`; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <div className="text-[10px] uppercase tracking-[0.1em] font-medium" style={{ color: active ? `rgb(var(--vessel-gold-alpha))` : `rgb(var(--vessel-text-alpha))` }}>
                      {mc.label}
                    </div>
                    <div className="text-[9px] mt-0.5" style={{ color: `rgb(var(--vessel-muted-alpha))` }}>
                      {mc.description}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Theme toggle + Metrics */}
      <div className="flex items-center gap-4 sm:gap-6">
        <ThemeToggle className="h-8 w-8" />
        {[
          { label: "MEMBERS", value: totalMembers, color: `rgb(var(--vessel-gold-alpha))` },
          { label: "ACTIVE", value: activeMembers, color: `rgb(var(--vessel-green-alpha))` },
          { label: "VISITS/MO", value: visitsMonth, color: `rgb(var(--vessel-text-alpha))` },
          { label: "VIP", value: vipCount, color: `rgb(var(--vessel-gold-alpha))` },
          { label: "AT RISK", value: churnRisk, color: `rgb(var(--vessel-red-alpha))` },
        ].map(({ label, value, color }) => (
          <div key={label} className="hidden sm:flex flex-col items-end">
            <span className="text-[7px] uppercase tracking-[0.15em]" style={{ color: `rgb(var(--vessel-muted-alpha))` }}>
              {label}
            </span>
            <span className="text-[12px] font-mono tabular-nums font-medium" style={{ color }}>
              {value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
