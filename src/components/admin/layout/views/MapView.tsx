import { useState } from "react";
import InteractiveMap from "@/components/admin/map/InteractiveMap";
import { useLocations } from "@/hooks/useLocations";
import { MapPin, Building2 } from "lucide-react";

export default function MapView() {
  const { data: locations } = useLocations();

  const locationsByCity = (locations ?? []).reduce((acc, loc) => {
    if (!acc[loc.city]) acc[loc.city] = [];
    acc[loc.city].push(loc);
    return acc;
  }, {} as Record<string, typeof locations extends (infer T)[] ? T[] : never>);

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-border/30 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Location Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {locations?.length ?? 0} active locations across {Object.keys(locationsByCity).length} cities
            </p>
          </div>
          <div className="flex items-center gap-4">
            {Object.entries(locationsByCity).map(([city, locs]) => (
              <div key={city} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                <span className="capitalize font-medium text-foreground">{city}</span>
                <span>({locs.length})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 min-h-0">
        <InteractiveMap />
      </div>
    </div>
  );
}
