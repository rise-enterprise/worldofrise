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
    <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: '300ms' }}>
      <CardHeader>
        <CardTitle className="text-lg">Brand Performance</CardTitle>
        <p className="text-xs text-muted-foreground">Visits this month by experience</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* NOIR */}
        <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-noir border border-noir-accent/20">
                <Coffee className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="font-display text-sm font-medium text-foreground">NOIR Café</p>
                <p className="text-xs text-muted-foreground">نوار كافيه</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-medium text-foreground">{visitsByBrand.noir.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{noirPercentage}% of total</p>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-foreground/80 rounded-full transition-all duration-1000"
              style={{ width: `${noirPercentage}%` }}
            />
          </div>
        </div>

        {/* SASSO */}
        <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-sasso border border-sasso-accent/20">
                <UtensilsCrossed className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="font-display text-sm font-medium text-foreground">SASSO</p>
                <p className="text-xs text-muted-foreground">Italian Fine Dining</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-medium text-foreground">{visitsByBrand.sasso.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{sassoPercentage}% of total</p>
            </div>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-sasso-accent rounded-full transition-all duration-1000"
              style={{ width: `${sassoPercentage}%` }}
            />
          </div>
        </div>

        {/* Combined visualization */}
        <div className="pt-4 border-t border-border animate-slide-up" style={{ animationDelay: '600ms' }}>
          <p className="text-xs text-muted-foreground mb-3">Distribution</p>
          <div className="flex h-3 rounded-full overflow-hidden">
            <div 
              className="bg-foreground/80 transition-all duration-1000"
              style={{ width: `${noirPercentage}%` }}
            />
            <div 
              className="bg-sasso-accent transition-all duration-1000"
              style={{ width: `${sassoPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>NOIR</span>
            <span>SASSO</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
