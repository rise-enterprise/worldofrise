import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  delay?: number;
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, className, delay = 0 }: MetricCardProps) {
  return (
    <Card 
      variant="obsidian" 
      className={cn(
        'animate-slide-up group hover:shadow-[inset_0_0_30px_rgba(200,162,74,0.03)] transition-all duration-300',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 font-body">{title}</p>
            <div>
              <p className="font-display text-4xl font-medium text-foreground tracking-wide">{value}</p>
              {subtitle && (
                <p className="text-sm text-muted-foreground/60 mt-1 font-body tracking-refined">{subtitle}</p>
              )}
            </div>
            {trend && (
              <p className={cn(
                'text-xs font-medium tracking-refined',
                trend.value >= 0 ? 'text-primary' : 'text-destructive'
              )}>
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-[#0B0D11] border border-[rgba(217,222,231,0.08)] text-primary/70 group-hover:text-primary group-hover:border-primary/20 transition-all duration-300">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
