import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import NoirLogo from '@/assets/NOIR_LOGO.png';
import SassoLogo from '@/assets/sasso_logo.png';

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
            <div className="p-2 rounded-lg bg-noir border border-noir-accent/20 flex items-center justify-center">
              <img src={NoirLogo} alt="NOIR" className="h-8 w-8 object-contain" />
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
            <div className="p-2 rounded-lg bg-sasso border border-sasso-accent/20 flex items-center justify-center">
              <img src={SassoLogo} alt="SASSO" className="h-8 w-8 object-contain" />
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
          <div className="flex justify-between mt-2">
            <img src={NoirLogo} alt="NOIR" className="h-4 w-4 object-contain" />
            <img src={SassoLogo} alt="SASSO" className="h-4 w-4 object-contain" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
