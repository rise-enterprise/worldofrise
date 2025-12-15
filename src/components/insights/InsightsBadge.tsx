import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface InsightsBadgeProps {
  risk: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

export function InsightsBadge({ risk, className }: InsightsBadgeProps) {
  if (risk === 'low' || risk === 'medium') return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        risk === 'high' && 'bg-orange-500/10 text-orange-500',
        risk === 'critical' && 'bg-red-500/10 text-red-500',
        className
      )}
    >
      <AlertTriangle className="h-3 w-3" />
      {risk === 'high' ? 'At Risk' : 'Critical'}
    </div>
  );
}
