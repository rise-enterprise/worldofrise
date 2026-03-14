import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLocations } from "@/hooks/useLocations";
import { MapPin, X, TrendingUp, Users, Star } from "lucide-react";

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
  noir: "#C8A24A",
  sasso: "#E8A87C",
  both: "#C8A24A",
};

function createCustomIcon(brand: string, isActive: boolean) {
  const color = BRAND_COLORS[brand] || "#C8A24A";
  return L.divIcon({
    className: "custom-map-pin",
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${color};
          opacity: ${isActive ? 0.2 : 0.08};
          animation: pinPulse 2s ease-in-out infinite;
        "></div>
        <div style="
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid #0a0a0f;
          box-shadow: 0 0 12px ${color}66;
          z-index: 1;
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export default function InteractiveMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { data: locations } = useLocations();
  const [selectedLocation, setSelectedLocation] = useState<LocationInsight | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [28, 40],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
    });

    // Dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !locations) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    locations.forEach((loc) => {
      const coords = CITY_COORDS[loc.city];
      if (!coords) return;

      // Offset pins slightly so they don't overlap
      const offset = Math.random() * 0.02 - 0.01;
      const marker = L.marker([coords[0] + offset, coords[1] + offset], {
        icon: createCustomIcon(loc.brand, loc.isActive),
      });

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

        map.flyTo([coords[0] + offset, coords[1] + offset], 12, {
          duration: 1.2,
        });
      });

      marker.addTo(map);
    });
  }, [locations]);

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden border border-border/30">
      <div ref={mapRef} className="h-full w-full" />

      {/* Location Insight Panel */}
      {selectedLocation && (
        <div
          className="absolute top-4 right-4 w-72 rounded-xl p-4 z-[1000] animate-soft-reveal"
          style={{
            background: "linear-gradient(180deg, hsl(var(--card) / 0.95) 0%, hsl(var(--card) / 0.9) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid hsl(var(--gold) / 0.15)",
            boxShadow: "0 16px 48px -12px hsl(0 0% 0% / 0.6)",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{selectedLocation.name}</h3>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">
                {selectedLocation.city} · {selectedLocation.brand}
              </p>
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              style={{ background: "hsl(var(--muted) / 0.5)" }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 p-2 rounded-lg" style={{ background: "hsl(var(--muted) / 0.3)" }}>
              <TrendingUp className="w-4 h-4 text-primary" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Visits</div>
                <div className="text-sm font-semibold text-foreground">{selectedLocation.visits?.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg" style={{ background: "hsl(var(--muted) / 0.3)" }}>
              <Users className="w-4 h-4 text-primary" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Members</div>
                <div className="text-sm font-semibold text-foreground">{selectedLocation.members?.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg" style={{ background: "hsl(var(--muted) / 0.3)" }}>
              <Star className="w-4 h-4 text-primary" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Top Product</div>
                <div className="text-sm font-semibold text-foreground">{selectedLocation.topProduct}</div>
              </div>
            </div>
          </div>

          {selectedLocation.address && (
            <p className="text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border/30">
              {selectedLocation.address}
            </p>
          )}
        </div>
      )}

      {/* Quick city navigation */}
      <div className="absolute bottom-4 left-4 flex gap-2 z-[1000]">
        {Object.entries(CITY_COORDS).map(([city, coords]) => (
          <button
            key={city}
            onClick={() => {
              mapInstanceRef.current?.flyTo(coords, city === "london" ? 10 : 11, { duration: 1 });
            }}
            className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-medium transition-all duration-300 hover:scale-105"
            style={{
              background: "hsl(var(--card) / 0.9)",
              backdropFilter: "blur(12px)",
              border: "1px solid hsl(var(--gold) / 0.15)",
              color: "hsl(var(--foreground))",
            }}
          >
            {city}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes pinPulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.5); opacity: 0.05; }
        }
        .custom-map-pin {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 16px -4px rgba(0,0,0,0.4) !important;
        }
        .leaflet-control-zoom a {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border: 1px solid hsl(var(--border)) !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 14px !important;
        }
        .leaflet-control-zoom a:hover {
          background: hsl(var(--muted)) !important;
        }
      `}</style>
    </div>
  );
}
