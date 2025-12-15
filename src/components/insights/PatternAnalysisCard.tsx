import { GuestInsightPatterns } from '@/types/loyalty';
import { TrendingUp, TrendingDown, Minus, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatternAnalysisCardProps {
  patterns: GuestInsightPatterns;
}

export function PatternAnalysisCard({ patterns }: PatternAnalysisCardProps) {
  const frequencyConfig = {
    increasing: {
      label: 'Increasing',
      icon: TrendingUp,
      color: 'text-emerald-500',
      description: 'Visits becoming more frequent',
    },
    stable: {
      label: 'Stable',
      icon: Minus,
      color: 'text-amber-500',
      description: 'Consistent visit pattern',
    },
    declining: {
      label: 'Declining',
      icon: TrendingDown,
      color: 'text-red-500',
      description: 'Visits becoming less frequent',
    },
  };

  const freq = frequencyConfig[patterns.visitFrequency];
  const FreqIcon = freq.icon;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-foreground">Visit Patterns</h4>
      
      <div className="grid grid-cols-2 gap-3">
        {/* Visit Frequency */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <FreqIcon className={cn('h-4 w-4', freq.color)} />
            <span className="text-xs text-muted-foreground">Frequency Trend</span>
          </div>
          <p className={cn('font-medium', freq.color)}>{freq.label}</p>
          <p className="text-xs text-muted-foreground mt-1">{freq.description}</p>
        </div>

        {/* Average Days Between Visits */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Avg. Visit Gap</span>
          </div>
          <p className="font-medium text-foreground">
            {patterns.averageDaysBetweenVisits} days
          </p>
          <p className="text-xs text-muted-foreground mt-1">Between visits</p>
        </div>

        {/* Preferred Day */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Preferred Day</span>
          </div>
          <p className="font-medium text-foreground">{patterns.preferredDayOfWeek}</p>
          <p className="text-xs text-muted-foreground mt-1">Most common visit day</p>
        </div>

        {/* Time Slot */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Time Preference</span>
          </div>
          <p className="font-medium text-foreground capitalize">{patterns.preferredTimeSlot}</p>
          <p className="text-xs text-muted-foreground mt-1">Usual visit time</p>
        </div>
      </div>
    </div>
  );
}
