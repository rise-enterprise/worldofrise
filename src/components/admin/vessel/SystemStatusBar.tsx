import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";
import { useVesselTheme } from "@/contexts/VesselThemeContext";
import { useAIPersonality, PERSONALITIES } from "@/contexts/AIPersonalityContext";

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
  const { isDay, toggleMode } = useVesselTheme();
  const { personality, config, setPersonality } = useAIPersonality();
  const modes = Object.values(PERSONALITIES);

  return (
    <div
      className={cn(
        "relative z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-2.5 transition-all duration-700 gap-1.5 sm:gap-0",
      )}
      style={{
        borderBottom: `1px solid ${isCrisis ? "rgba(184,74,74,0.15)" : "rgba(200,162,74,0.06)"}`,
        backgroundColor: isCrisis ? "rgba(184,74,74,0.03)" : "rgba(10,10,12,0.7)",
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Left — System identity + health */}
      <div className="flex items-center gap-3 shrink-0">
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          isCrisis ? "bg-[#b84a4a] animate-pulse" : "bg-[#5a8a6a]"
        )} />
        <span
          className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium"
          style={{ color: isCrisis ? "#b84a4a" : config.accentHex }}
        >
          {isCrisis ? "ALERT ACTIVE" : "RISE TACTICAL"}
        </span>
        <div className="w-px h-3 bg-[rgba(200,162,74,0.08)]" />
        <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.15em] text-[#5a5a64]">
          {config.label}
        </span>
      </div>

      {/* Center — Mode selector + key metrics */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-hide w-full sm:w-auto justify-start sm:justify-center">
        {/* Mode pills */}
        <div className="flex items-center gap-0.5 shrink-0">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setPersonality(mode.id)}
              className={cn(
                "text-[7px] sm:text-[8px] uppercase tracking-wider px-2 py-1 rounded transition-all duration-300 border whitespace-nowrap",
                personality === mode.id
                  ? "border-current/20"
                  : "border-transparent opacity-30 hover:opacity-60"
              )}
              style={{
                color: personality === mode.id ? mode.accentHex : "#4a4a54",
                backgroundColor: personality === mode.id ? `${mode.accentHex}0a` : "transparent",
              }}
              title={mode.label}
            >
              {mode.id === "strategic" ? "STR" :
               mode.id === "expansion" ? "EXP" :
               mode.id === "neural" ? "NRL" :
               mode.id === "investor" ? "INV" : "RSK"}
            </button>
          ))}
        </div>

        <div className="w-px h-3.5 shrink-0 bg-[rgba(200,162,74,0.06)]" />

        {/* Key metrics — large dominant numbers */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <TacticalMetric label="MEMBERS" value={totalMembers.toLocaleString()} />
          <TacticalMetric label="ACTIVE" value={activeMembers.toLocaleString()} />
          <span className="hidden sm:inline-flex">
            <TacticalMetric label="VISITS" value={visitsMonth.toLocaleString()} />
          </span>
          <TacticalMetric label="VIP" value={vipCount.toLocaleString()} accent />
          <TacticalMetric label="RISK" value={churnRisk.toLocaleString()} warn={churnRisk > totalMembers * 0.3} />
        </div>
      </div>

      {/* Right — Toggle + Time */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleMode}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[8px] sm:text-[9px] uppercase tracking-wider transition-all duration-500 border border-[rgba(200,162,74,0.08)] text-[#C8A24A]/50 hover:text-[#C8A24A]/80 hover:bg-[rgba(200,162,74,0.04)]"
        >
          {isDay ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
          {isDay ? "Night" : "Day"}
        </button>
        <span className="hidden sm:inline text-[10px] tabular-nums tracking-wider text-[#4a4a54]">
          {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function TacticalMetric({ label, value, warn, accent }: { label: string; value: string; warn?: boolean; accent?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0 shrink-0">
      <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.15em] text-[#4a4a54]">
        {label}
      </span>
      <span
        className="text-[12px] sm:text-[14px] font-mono tabular-nums font-medium tracking-wide"
        style={{
          color: warn ? "#b84a4a" : accent ? "#C8A24A" : "rgba(220,218,214,0.7)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
