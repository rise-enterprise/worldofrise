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
    <Card variant="obsidian" className="animate-slide-up relative overflow-hidden" style={{ animationDelay: '300ms' }}>
      {/* Crystal corner accents */}
      <div className="absolute top-0 left-0 w-6 h-px bg-gradient-to-r from-primary/40 to-transparent" />
      <div className="absolute top-0 left-0 w-px h-6 bg-gradient-to-b from-primary/40 to-transparent" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-primary to-primary/30 rounded-full" />
          <CardTitle className="text-lg tracking-wide font-display">Brand Performance</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground/60 tracking-refined ml-3">Visits this month by experience</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* NOIR */}
        <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#0B0D11] border border-[rgba(217,222,231,0.08)]">
                <Coffee className="h-4 w-4 text-foreground/70" />
              </div>
              <div>
                <p className="font-display text-sm font-medium text-foreground tracking-wide">NOIR Café</p>
                <p className="text-xs text-muted-foreground/50 tracking-refined">نوار كافيه</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-medium text-foreground tracking-wide">{visitsByBrand.noir.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground/50 tracking-refined">{noirPercentage}% of total</p>
            </div>
          </div>
          <div className="h-1.5 bg-[#0B0D11] rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
            <div 
              className="h-full bg-gradient-to-r from-foreground/50 to-foreground/30 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${noirPercentage}%` }}
            />
          </div>
        </div>

        {/* SASSO */}
        <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#0B0D11] border border-[rgba(217,222,231,0.08)]">
                <UtensilsCrossed className="h-4 w-4 text-primary/70" />
              </div>
              <div>
                <p className="font-display text-sm font-medium text-foreground tracking-wide">SASSO</p>
                <p className="text-xs text-muted-foreground/50 tracking-refined">Italian Fine Dining</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-medium text-primary tracking-wide">{visitsByBrand.sasso.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground/50 tracking-refined">{sassoPercentage}% of total</p>
            </div>
          </div>
          <div className="h-1.5 bg-[#0B0D11] rounded-full overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(200,162,74,0.3)]"
              style={{ width: `${sassoPercentage}%` }}
            />
          </div>
        </div>

        {/* Combined visualization */}
        <div className="pt-5 border-t border-primary/10 animate-slide-up relative" style={{ animationDelay: '600ms' }}>
          {/* Crystal divider glow */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <p className="text-xs text-muted-foreground/50 mb-3 tracking-[0.2em] uppercase">Distribution</p>
          <div className="flex h-2 rounded-full overflow-hidden bg-[#0B0D11] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
            <div 
              className="bg-gradient-to-r from-foreground/50 to-foreground/30 transition-all duration-1000 ease-out"
              style={{ width: `${noirPercentage}%` }}
            />
            <div 
              className="bg-gradient-to-r from-primary to-primary/50 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(200,162,74,0.3)]"
              style={{ width: `${sassoPercentage}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs text-muted-foreground/50 tracking-refined">
            <span>NOIR</span>
            <span>SASSO</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
