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
    <Card variant="elevated" className="animate-slide-up" style={{ animationDelay: '400ms' }}>
      <CardHeader>
        <CardTitle className="text-lg">Regional Presence</CardTitle>
        <p className="text-xs text-muted-foreground">Guest activity by location</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Qatar */}
          <div 
            className="p-4 rounded-xl bg-muted/50 border border-border/50 animate-slide-up"
            style={{ animationDelay: '500ms' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Qatar</span>
            </div>
            <p className="font-display text-3xl font-medium text-foreground mb-1">
              {(visitsByCountry.doha || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.round(((visitsByCountry.doha || 0) / total) * 100)}% of visits
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-lg">🇶🇦</span>
              <span className="text-xs text-muted-foreground">Doha</span>
            </div>
          </div>

          {/* Saudi Arabia */}
          <div 
            className="p-4 rounded-xl bg-muted/50 border border-border/50 animate-slide-up"
            style={{ animationDelay: '600ms' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Saudi Arabia</span>
            </div>
            <p className="font-display text-3xl font-medium text-foreground mb-1">
              {visitsByCountry.riyadh.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {Math.round((visitsByCountry.riyadh / total) * 100)}% of visits
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-lg">🇸🇦</span>
              <span className="text-xs text-muted-foreground">Riyadh</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
