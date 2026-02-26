import { useMemo } from 'react';

export function EnergyGrid() {
  const lines = useMemo(() => {
    const h: React.CSSProperties[] = [];
    const v: React.CSSProperties[] = [];
    for (let i = 0; i < 12; i++) {
      h.push({
        position: 'absolute' as const,
        left: 0,
        right: 0,
        top: `${(i + 1) * 8}%`,
        height: '1px',
        background: `linear-gradient(90deg, transparent 0%, hsl(var(--gold) / 0.04) 30%, hsl(var(--gold) / 0.06) 50%, hsl(var(--gold) / 0.04) 70%, transparent 100%)`,
      });
      v.push({
        position: 'absolute' as const,
        top: 0,
        bottom: 0,
        left: `${(i + 1) * 8}%`,
        width: '1px',
        background: `linear-gradient(180deg, transparent 0%, hsl(var(--gold) / 0.03) 30%, hsl(var(--gold) / 0.05) 50%, hsl(var(--gold) / 0.03) 70%, transparent 100%)`,
      });
    }
    return { h, v };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
      {lines.h.map((s, i) => <div key={`h-${i}`} style={s} />)}
      {lines.v.map((s, i) => <div key={`v-${i}`} style={s} />)}
      {/* Animated scan line */}
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(var(--gold) / 0.15) 50%, transparent 100%)',
          animation: 'scanDown 8s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes scanDown {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
