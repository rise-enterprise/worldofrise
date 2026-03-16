import { useEffect, useRef, useState, useCallback } from "react";
import { useLocations } from "@/hooks/useLocations";
import { X, TrendingUp, Users, Star, Sparkles } from "lucide-react";

interface LocationInsight {
  id: string;
  name: string;
  city: string;
  brand: string;
  address: string | null;
  visits?: number;
  members?: number;
  topProduct?: string;
}

const CITY_COORDS: Record<string, [number, number]> = {
  doha: [25.2854, 51.531],
  riyadh: [24.7136, 46.6753],
  london: [51.5074, -0.1278],
};

const BRAND_COLORS: Record<string, string> = {
  noir: "#D4A843",
  sasso: "#E8A87C",
  both: "#D4A843",
};

const AI_INSIGHTS: Record<string, string> = {
  doha: "West Walk has the highest dessert orders after 9 PM. Al Hazm shows 23% VIP growth this quarter.",
  riyadh: "Riyadh branch has increasing VIP customer visits (+18%). Peak hours shifting to later evenings.",
  london: "London location shows strong weekend brunch demand. Consider loyalty-exclusive tasting events.",
};

export default function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const { data: locations } = useLocations();
  const [selectedLocation, setSelectedLocation] = useState<LocationInsight | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map with dynamic import
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !mapRef.current) return;

      leafletRef.current = L;

      const map = L.map(mapRef.current, {
        center: [28, 40],
        zoom: 4,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      mapInstanceRef.current = map;
      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add markers when map + locations are ready
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L || !locations || !mapReady) return;

    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    locations.forEach((loc) => {
      const coords = CITY_COORDS[loc.city];
      if (!coords) return;

      const color = BRAND_COLORS[loc.brand] || "#D4A843";
      const icon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:${loc.isActive ? 0.2 : 0.08};animation:pinPulse 2s ease-in-out infinite;"></div>
            <div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid hsl(var(--background));box-shadow:0 0 12px ${color}66;z-index:1;"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const offset = Math.random() * 0.02 - 0.01;
      const marker = L.marker([coords[0] + offset, coords[1] + offset], { icon });

      marker.on("click", () => {
        setSelectedLocation({
          id: loc.id,
          name: loc.name,
          city: loc.city,
          brand: loc.brand,
          address: loc.address,
          visits: Math.floor(Math.random() * 5000) + 1000,
          members: Math.floor(Math.random() * 2000) + 500,
          topProduct: loc.brand === "sasso" ? "Truffle Risotto" : "Signature Latte",
        });
        setActiveCity(loc.city);
        map.flyTo([coords[0] + offset, coords[1] + offset], 12, { duration: 1.2 });
      });

      marker.addTo(map);
    });
  }, [locations, mapReady]);

  const flyToCity = useCallback((city: string) => {
    const coords = CITY_COORDS[city];
    if (coords) {
      mapInstanceRef.current?.flyTo(coords, city === "london" ? 10 : 11, { duration: 1 });
      setActiveCity(city);
    }
  }, []);

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden border border-border/30">
      <div ref={mapRef} className="h-full w-full" />

      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="text-sm text-muted-foreground">Loading map…</p>
        </div>
      )}

      {/* Location Insight Panel */}
      {selectedLocation && (
        <div
          className="absolute top-4 right-4 w-80 rounded-xl z-[1000] overflow-hidden"
          style={{
            background: "linear-gradient(180deg, hsl(var(--card) / 0.95) 0%, hsl(var(--card) / 0.9) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid hsl(var(--gold) / 0.15)",
            boxShadow: "0 16px 48px -12px hsl(0 0% 0% / 0.6)",
          }}
        >
          <div className="p-4 border-b border-border/20">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{selectedLocation.name}</h3>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">
                  {selectedLocation.city} · {selectedLocation.brand}
                </p>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors bg-muted/50"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {[
              { icon: TrendingUp, label: "Total Visits", value: selectedLocation.visits?.toLocaleString() },
              { icon: Users, label: "Active Members", value: selectedLocation.members?.toLocaleString() },
              { icon: Star, label: "Top Product", value: selectedLocation.topProduct },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
                  <div className="text-sm font-semibold text-foreground truncate">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {selectedLocation.address && (
            <div className="px-4 pb-3">
              <p className="text-[10px] text-muted-foreground pt-2 border-t border-border/30">
                {selectedLocation.address}
              </p>
            </div>
          )}
        </div>
      )}

      {/* AI Insight Banner */}
      {activeCity && AI_INSIGHTS[activeCity] && (
        <div
          className="absolute top-4 left-4 max-w-sm z-[1000] rounded-xl p-3"
          style={{
            background: "linear-gradient(135deg, hsl(var(--card) / 0.95), hsl(var(--gold) / 0.05))",
            backdropFilter: "blur(16px)",
            border: "1px solid hsl(var(--gold) / 0.2)",
            boxShadow: "0 8px 32px -8px hsl(var(--gold) / 0.15)",
          }}
        >
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-primary font-medium mb-1">AI Insight</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{AI_INSIGHTS[activeCity]}</p>
            </div>
          </div>
        </div>
      )}

      {/* City Navigation */}
      <div className="absolute bottom-4 left-4 flex gap-2 z-[1000]">
        {Object.entries(CITY_COORDS).map(([city]) => (
          <button
            key={city}
            onClick={() => flyToCity(city)}
            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-medium transition-all duration-300 hover:scale-105 ${
              activeCity === city ? "text-primary-foreground" : "text-foreground"
            }`}
            style={{
              background: activeCity === city ? "hsl(var(--gold))" : "hsl(var(--card) / 0.9)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${activeCity === city ? "hsl(var(--gold))" : "hsl(var(--gold) / 0.15)"}`,
            }}
          >
            {city}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes pinPulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.6); opacity: 0.05; }
        }
        .custom-map-pin { background: transparent !important; border: none !important; }
        .leaflet-control-zoom { border: none !important; box-shadow: 0 4px 16px -4px rgba(0,0,0,0.4) !important; }
        .leaflet-control-zoom a {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border: 1px solid hsl(var(--border)) !important;
          width: 32px !important; height: 32px !important; line-height: 32px !important; font-size: 14px !important;
        }
        .leaflet-control-zoom a:hover { background: hsl(var(--muted)) !important; }
      `}</style>
    </div>
  );
}
