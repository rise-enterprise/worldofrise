import { motion } from 'framer-motion';
import { useExperiences, type Experience } from '@/hooks/useExperiences';
import { Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export function InvitationsSection() {
  const { data: experiences } = useExperiences();
  const upcoming = experiences?.slice(0, 2) || [];

  if (upcoming.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3, duration: 0.8 }}
      className="px-6 pb-12"
    >
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
          <h2 className="text-[10px] text-muted-foreground tracking-[0.35em] uppercase">
            You Are Invited
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
        </div>

        <div className="space-y-3">
          {upcoming.map((exp, i) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + i * 0.15, duration: 0.6 }}
              className="group relative p-5 rounded-xl border border-primary/10 bg-card/50 backdrop-blur-sm
                         hover:border-primary/25 transition-all duration-500 cursor-pointer overflow-hidden"
            >
              {/* Gold edge glow */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-primary/60 tracking-[0.3em] uppercase mb-1.5">
                      Exclusive Invitation
                    </p>
                    <h3 className="font-display text-sm text-foreground tracking-wide mb-2">
                      {exp.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(exp.date), 'MMMM d, yyyy')}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primary/30 group-hover:text-primary/60 transition-colors shrink-0 mt-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
