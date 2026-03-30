import { motion } from 'framer-motion';
import { useRewards, type Reward } from '@/hooks/useRewards';
import { Star, Sparkles } from 'lucide-react';

export function PrivilegesSection() {
  const { data: rewards } = useRewards();
  const topRewards = rewards?.slice(0, 3) || [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="px-6 pb-12"
    >
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
          <h2 className="text-[10px] text-muted-foreground tracking-[0.35em] uppercase">
            Your Privileges
          </h2>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
        </div>

        <div className="space-y-3">
          {topRewards.map((reward, i) => (
            <PrivilegeCard key={reward.id} reward={reward} index={i} />
          ))}
          {topRewards.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="h-5 w-5 text-primary/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-body">
                Your privileges await discovery
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

function PrivilegeCard({ reward, index }: { reward: Reward; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2 + index * 0.15, duration: 0.6 }}
      className="group relative p-5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm
                 hover:border-primary/20 hover:bg-card/80 transition-all duration-500 cursor-pointer
                 overflow-hidden"
    >
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm text-foreground tracking-wide mb-1">
            {reward.title}
          </h3>
          {reward.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {reward.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          <Star className="h-3 w-3 text-primary/50" />
          <span className="text-xs text-primary font-display">{reward.pointsCost}</span>
        </div>
      </div>
    </motion.div>
  );
}
