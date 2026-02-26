import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";
import { useVesselTheme } from "@/contexts/VesselThemeContext";
import { useAIPersonality, PERSONALITIES, AIPersonality } from "@/contexts/AIPersonalityContext";

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
  const retentionRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;
  const { isDay, toggleMode, colors } = useVesselTheme();
  const { personality, config, setPersonality } = useAIPersonality();

  const modes = Object.values(PERSONALITIES);

  return (
    <div
      className={cn(
        "relative z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-6 py-2 border-b backdrop-blur-xl transition-all duration-1000 gap-1 sm:gap-0",
      )}
      style={{
        borderColor: isCrisis ? "rgba(239,68,68,0.2)" : colors.border,
        backgroundColor: isCrisis
          ? "rgba(239,68,68,0.05)"
          : isDay
          ? "rgba(245,240,232,0.6)"
          : "rgba(2,8,24,0.4)",
      }}
    >
      {/* Left — System identity */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className={cn(
          "w-2 h-2 rounded-full animate-pulse",
          isCrisis ? "bg-destructive" : "bg-emerald-500"
        )} />
        <span
          className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] font-semibold"
          style={{ color: config.accentHex }}
        >
          {isCrisis ? "⚠ INSTABILITY" : `${config.icon} ${config.label.toUpperCase()} MODE`}
        </span>
      </div>

      {/* Center — AI Personality selector + metrics */}
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-hide w-full sm:w-auto justify-start sm:justify-center">
        {/* Personality pills */}
        <div className="flex items-center gap-1 shrink-0">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setPersonality(mode.id)}
              className={cn(
                "text-[7px] sm:text-[8px] uppercase tracking-wider px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all duration-300 border whitespace-nowrap",
                personality === mode.id
                  ? "border-current shadow-[0_0_12px_-3px_currentColor]"
                  : "border-transparent opacity-40 hover:opacity-70"
              )}
              style={{
                color: personality === mode.id ? mode.accentHex : (isDay ? "#8a7d6a" : "#667788"),
                backgroundColor: personality === mode.id ? `${mode.accentHex}15` : "transparent",
              }}
              title={`${mode.label} Mode`}
            >
              <span className="hidden sm:inline">{mode.icon} </span>{mode.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-4 shrink-0" style={{ backgroundColor: colors.border }} />

        {/* Key metrics */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <StatusMetric label="MEMBERS" value={totalMembers.toLocaleString()} isDay={isDay} accent={config.accentHex} />
          <span className="hidden sm:inline-flex"><StatusMetric label="VIP" value={vipCount.toLocaleString()} isDay={isDay} accent={config.accentHex} /></span>
          <StatusMetric label="CHURN" value={churnRisk.toLocaleString()} warn={churnRisk > totalMembers * 0.3} isDay={isDay} accent={config.accentHex} />
        </div>
      </div>

      {/* Right — Mode toggle + Time */}
      <div className="hidden sm:flex items-center gap-3">
        <button
          onClick={toggleMode}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider transition-all duration-500 border",
            isDay
              ? "border-[#C8A24A]/20 bg-[#C8A24A]/10 text-[#C8A24A] hover:bg-[#C8A24A]/20"
              : "border-[#00d4ff]/20 bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/20"
          )}
        >
          {isDay ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
          {isDay ? "Night" : "Day"}
        </button>
        <span
          className="text-[10px] tabular-nums tracking-wider"
          style={{ color: colors.textMuted }}
        >
          {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function StatusMetric({ label, value, warn, isDay, accent }: { label: string; value: string; warn?: boolean; isDay: boolean; accent: string }) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
      <span
        className="text-[8px] sm:text-[9px] uppercase tracking-wider"
        style={{ color: isDay ? "rgba(138,125,106,0.6)" : "rgba(102,119,136,0.4)" }}
      >
        {label}
      </span>
      <span
        className="text-[10px] sm:text-[11px] font-mono tabular-nums"
        style={{ color: warn ? "rgba(239,68,68,0.8)" : isDay ? "rgba(26,21,16,0.7)" : "rgba(232,228,220,0.7)" }}
      >
        {value}
      </span>
    </div>
  );
}
