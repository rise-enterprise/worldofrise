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
    <Card variant="obsidian" className="animate-slide-up relative overflow-hidden" style={{ animationDelay: '400ms' }}>
      {/* Crystal corner accents */}
      <div className="absolute top-0 left-0 w-6 h-px bg-gradient-to-r from-primary/40 to-transparent" />
      <div className="absolute top-0 left-0 w-px h-6 bg-gradient-to-b from-primary/40 to-transparent" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-primary to-primary/30 rounded-full" />
          <CardTitle className="text-lg tracking-wide font-display">Regional Presence</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground/60 tracking-refined ml-3">Guest activity by location</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Qatar */}
          <div 
            className="p-5 rounded-xl bg-[#0B0D11] border border-[rgba(217,222,231,0.08)] animate-slide-up hover:border-[rgba(217,222,231,0.15)] transition-all duration-300"
            style={{ animationDelay: '500ms' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-muted-foreground/50" />
              <span className="text-sm font-medium text-foreground tracking-refined">Qatar</span>
            </div>
            <p className="font-display text-3xl font-medium text-foreground mb-1 tracking-wide">
              {(visitsByCountry.doha || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground/50 tracking-refined">
              {Math.round(((visitsByCountry.doha || 0) / total) * 100)}% of visits
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground/40 tracking-refined">Doha</span>
            </div>
          </div>

          {/* Saudi Arabia */}
          <div 
            className="p-5 rounded-xl bg-[#0B0D11] border border-[rgba(217,222,231,0.08)] animate-slide-up hover:border-primary/20 transition-all duration-300"
            style={{ animationDelay: '600ms' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-primary/50" />
              <span className="text-sm font-medium text-foreground tracking-refined">Saudi Arabia</span>
            </div>
            <p className="font-display text-3xl font-medium text-primary mb-1 tracking-wide">
              {visitsByCountry.riyadh.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground/50 tracking-refined">
              {Math.round((visitsByCountry.riyadh / total) * 100)}% of visits
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground/40 tracking-refined">Riyadh</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
