import { useEffect, useState } from "react";
import { Shield, Wifi, Clock } from "lucide-react";

export default function HUDStatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-1.5 border-b border-border/15 bg-card/10 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <span className="text-[10px] uppercase tracking-[0.2em] text-primary/70 font-body font-semibold">
          NOIR AI HUD
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[9px] text-success/80 uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[9px] text-muted-foreground/50 uppercase tracking-wider">
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          <span>Secure</span>
        </div>
        <div className="flex items-center gap-1">
          <Wifi className="w-3 h-3" />
          <span>Connected</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span className="tabular-nums">
            {time.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  );
}
