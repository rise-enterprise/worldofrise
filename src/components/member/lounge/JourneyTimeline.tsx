import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import type { Visit } from '@/types/loyalty';
import { format } from 'date-fns';

interface JourneyTimelineProps {
  visits: Visit[];
}

export function JourneyTimeline({ visits }: JourneyTimelineProps) {
  const recent = visits.slice(0, 4);
  if (recent.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.8 }}
      className="px-6 pb-12"
    >
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
          <h2 className="text-[10px] text-muted-foreground tracking-[0.35em] uppercase">
            Your Journey
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-primary/20 via-border to-transparent" />

          <div className="space-y-5">
            {recent.map((visit, i) => (
              <motion.div
                key={visit.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.7 + i * 0.12, duration: 0.5 }}
                className="relative pl-9"
              >
                {/* Node */}
                <div className={`absolute left-1.5 top-1 w-3 h-3 rounded-full border
                  ${i === 0 ? 'bg-primary/80 border-primary/40 shadow-[0_0_8px_rgba(180,150,80,0.3)]' : 'bg-card border-border/60'}`}
                />

                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-foreground font-display capitalize truncate">
                      {visit.brand}
                    </span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {visit.location}
                    </span>
                  </div>
                  <time className="text-[10px] text-muted-foreground/50 tracking-wider whitespace-nowrap">
                    {format(visit.date, 'MMM d')}
                  </time>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
