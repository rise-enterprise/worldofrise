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
      variant="crystal" 
      className={cn('animate-slide-up', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-body">{title}</p>
            <div>
              <p className="font-display text-4xl font-medium text-foreground tracking-crystal">{value}</p>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1 font-body">{subtitle}</p>
              )}
            </div>
            {trend && (
              <p className={cn(
                'text-xs font-medium tracking-refined',
                trend.value >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-accent/50 text-primary/70">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
