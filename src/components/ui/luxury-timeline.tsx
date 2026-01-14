import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  date: Date;
  icon?: React.ReactNode;
  highlight?: boolean;
}

interface LuxuryTimelineProps {
  items: TimelineItem[];
  className?: string;
  maxItems?: number;
}

export function LuxuryTimeline({ items, className, maxItems }: LuxuryTimelineProps) {
  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div className={cn('relative', className)}>
      {/* Vertical gold line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
      
      <div className="space-y-6">
        {displayItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="relative pl-10"
          >
            {/* Node */}
            <div 
              className={cn(
                'absolute left-2 top-1 w-4 h-4 rounded-full',
                'border-2 transition-all duration-300',
                item.highlight 
                  ? 'bg-primary border-primary shadow-[0_0_12px_rgba(200,162,74,0.4)]' 
                  : 'bg-card border-border/50 hover:border-primary/50'
              )}
            >
              {/* Inner glow for highlighted items */}
              {item.highlight && (
                <div className="absolute inset-0.5 rounded-full bg-primary/50 animate-gentle-pulse" />
              )}
            </div>
            
            {/* Content */}
            <div 
              className={cn(
                'glass-panel p-4 rounded-xl transition-all duration-300',
                'hover:border-primary/20 hover:shadow-[inset_0_0_20px_rgba(200,162,74,0.03)]'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {item.icon && (
                      <span className="text-primary/70">{item.icon}</span>
                    )}
                    <h4 className="font-display text-foreground tracking-crystal truncate">
                      {item.title}
                    </h4>
                  </div>
                  {item.subtitle && (
                    <p className="text-sm text-muted-foreground tracking-refined mt-1">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <time className="text-xs text-muted-foreground/60 tracking-widest whitespace-nowrap">
                  {format(item.date, 'MMM d')}
                </time>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}