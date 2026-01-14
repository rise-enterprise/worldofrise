import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

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
  animated?: boolean;
}

function AnimatedNumber({ value, delay = 0 }: { value: number; delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { damping: 30, stiffness: 80 });
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      spring.set(value);
    }, delay);
    
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [value, spring, delay]);

  return (
    <motion.span
      className="font-display text-4xl font-medium tracking-wide bg-gradient-to-br from-foreground via-foreground to-primary/80 bg-clip-text text-transparent"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
    >
      {displayValue.toLocaleString()}
    </motion.span>
  );
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, className, delay = 0, animated = true }: MetricCardProps) {
  const numericValue = typeof value === 'number' ? value : parseInt(String(value).replace(/,/g, ''), 10);
  const isNumeric = !isNaN(numericValue);

  return (
    <Card 
      variant="obsidian" 
      className={cn(
        'animate-slide-up group hover:shadow-[inset_0_0_30px_rgba(200,162,74,0.05)] transition-all duration-500',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/60 font-body">{title}</p>
            <div className="relative">
              {animated && isNumeric ? (
                <AnimatedNumber value={numericValue} delay={delay + 200} />
              ) : (
                <p className="font-display text-4xl font-medium text-foreground tracking-wide">{value}</p>
              )}
              {subtitle && (
                <p className="text-sm text-muted-foreground/60 mt-1 font-body tracking-refined">{subtitle}</p>
              )}
              {/* Subtle gold glow */}
              <div className="absolute -inset-4 bg-primary/5 blur-2xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            {trend && (
              <motion.p 
                className={cn(
                  'text-xs font-medium tracking-refined',
                  trend.value >= 0 ? 'text-primary' : 'text-destructive'
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (delay + 400) / 1000 }}
              >
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </motion.p>
            )}
          </div>
          <motion.div 
            className="p-3 rounded-xl bg-[#0B0D11] border border-[rgba(217,222,231,0.08)] text-primary/70 group-hover:text-primary group-hover:border-primary/20 group-hover:shadow-[0_0_20px_rgba(200,162,74,0.15)] transition-all duration-500"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay / 1000, duration: 0.3 }}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
