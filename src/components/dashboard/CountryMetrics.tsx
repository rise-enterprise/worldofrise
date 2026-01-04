import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface CountryMetricsProps {
  visitsByCountry: {
    doha: number;
    riyadh: number;
  };
}

export function CountryMetrics({ visitsByCountry }: CountryMetricsProps) {
  const total = (visitsByCountry.doha || 0) + (visitsByCountry.riyadh || 0) || 1;

  return (
    <Card variant="crystal" className="animate-slide-up" style={{ animationDelay: '400ms' }}>
      <CardHeader>
        <CardTitle className="text-lg tracking-crystal">Regional Presence</CardTitle>
        <p className="text-xs text-muted-foreground tracking-refined">Guest activity by location</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Qatar */}
          <div 
            className="p-5 rounded-xl bg-accent/30 border border-border/30 animate-slide-up light-shift"
            style={{ animationDelay: '500ms' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-primary/70" />
              <span className="text-sm font-medium text-foreground tracking-refined">Qatar</span>
            </div>
            <p className="font-display text-3xl font-medium text-foreground mb-1 tracking-crystal">
              {(visitsByCountry.doha || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground tracking-refined">
              {Math.round(((visitsByCountry.doha || 0) / total) * 100)}% of visits
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-lg">🇶🇦</span>
              <span className="text-xs text-muted-foreground tracking-refined">Doha</span>
            </div>
          </div>

          {/* Saudi Arabia */}
          <div 
            className="p-5 rounded-xl bg-accent/30 border border-border/30 animate-slide-up light-shift"
            style={{ animationDelay: '600ms' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-primary/70" />
              <span className="text-sm font-medium text-foreground tracking-refined">Saudi Arabia</span>
            </div>
            <p className="font-display text-3xl font-medium text-foreground mb-1 tracking-crystal">
              {visitsByCountry.riyadh.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground tracking-refined">
              {Math.round((visitsByCountry.riyadh / total) * 100)}% of visits
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-lg">🇸🇦</span>
              <span className="text-xs text-muted-foreground tracking-refined">Riyadh</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
