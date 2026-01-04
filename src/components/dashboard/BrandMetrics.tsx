import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Coffee, UtensilsCrossed } from 'lucide-react';

interface BrandMetricsProps {
  visitsByBrand: {
    noir: number;
    sasso: number;
  };
}

export function BrandMetrics({ visitsByBrand }: BrandMetricsProps) {
  const total = visitsByBrand.noir + visitsByBrand.sasso;
  const noirPercentage = Math.round((visitsByBrand.noir / total) * 100);
  const sassoPercentage = 100 - noirPercentage;

  return (
    <Card variant="crystal" className="animate-slide-up" style={{ animationDelay: '300ms' }}>
      <CardHeader>
        <CardTitle className="text-lg tracking-crystal">Brand Performance</CardTitle>
        <p className="text-xs text-muted-foreground tracking-refined">Visits this month by experience</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* NOIR */}
        <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/50 border border-border/30">
                <Coffee className="h-4 w-4 text-foreground/70" />
              </div>
              <div>
                <p className="font-display text-sm font-medium text-foreground tracking-crystal">NOIR Café</p>
                <p className="text-xs text-muted-foreground tracking-refined">نوار كافيه</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-medium text-foreground tracking-crystal">{visitsByBrand.noir.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground tracking-refined">{noirPercentage}% of total</p>
            </div>
          </div>
          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-foreground/50 rounded-full transition-all duration-1000 ease-crystal"
              style={{ width: `${noirPercentage}%` }}
            />
          </div>
        </div>

        {/* SASSO */}
        <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/50 border border-border/30">
                <UtensilsCrossed className="h-4 w-4 text-foreground/70" />
              </div>
              <div>
                <p className="font-display text-sm font-medium text-foreground tracking-crystal">SASSO</p>
                <p className="text-xs text-muted-foreground tracking-refined">Italian Fine Dining</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-medium text-foreground tracking-crystal">{visitsByBrand.sasso.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground tracking-refined">{sassoPercentage}% of total</p>
            </div>
          </div>
          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary/40 rounded-full transition-all duration-1000 ease-crystal"
              style={{ width: `${sassoPercentage}%` }}
            />
          </div>
        </div>

        {/* Combined visualization */}
        <div className="pt-5 border-t border-border/30 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <p className="text-xs text-muted-foreground mb-3 tracking-widest uppercase">Distribution</p>
          <div className="flex h-2 rounded-full overflow-hidden bg-muted/30">
            <div 
              className="bg-foreground/50 transition-all duration-1000 ease-crystal"
              style={{ width: `${noirPercentage}%` }}
            />
            <div 
              className="bg-primary/40 transition-all duration-1000 ease-crystal"
              style={{ width: `${sassoPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs text-muted-foreground tracking-refined">
            <span>NOIR</span>
            <span>SASSO</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
