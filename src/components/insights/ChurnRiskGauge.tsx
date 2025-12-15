import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface ChurnRiskGaugeProps {
  risk: 'low' | 'medium' | 'high' | 'critical';
  score: number;
}

export function ChurnRiskGauge({ risk, score }: ChurnRiskGaugeProps) {
  const riskConfig = {
    low: {
      label: 'Low Risk',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: CheckCircle,
    },
    medium: {
      label: 'Medium Risk',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      icon: AlertCircle,
    },
    high: {
      label: 'High Risk',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      icon: AlertTriangle,
    },
    critical: {
      label: 'Critical Risk',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      icon: XCircle,
    },
  };

  const config = riskConfig[risk];
  const Icon = config.icon;

  return (
    <div className={cn(
      'p-4 rounded-lg border',
      config.bg,
      config.border
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-5 w-5', config.color)} />
          <span className={cn('font-medium', config.color)}>{config.label}</span>
        </div>
        <span className="text-sm text-muted-foreground">Score: {score}/100</span>
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full rounded-full transition-all duration-500',
            risk === 'low' && 'bg-emerald-500',
            risk === 'medium' && 'bg-amber-500',
            risk === 'high' && 'bg-orange-500',
            risk === 'critical' && 'bg-red-500',
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      
      <p className="mt-2 text-xs text-muted-foreground">
        {risk === 'low' && 'Guest engagement is healthy. Maintain current relationship.'}
        {risk === 'medium' && 'Consider proactive outreach to strengthen engagement.'}
        {risk === 'high' && 'Immediate attention recommended. Send personalized message.'}
        {risk === 'critical' && 'Urgent re-engagement needed. High priority guest at risk.'}
      </p>
    </div>
  );
}
