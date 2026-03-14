import InteractiveMap from "@/components/admin/map/InteractiveMap";

export default function MapView() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-border/30 shrink-0">
        <h1 className="text-lg font-semibold text-foreground">Location Intelligence</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Interactive map with real-time location performance data</p>
      </div>
      <div className="flex-1 p-4 min-h-0">
        <InteractiveMap />
      </div>
    </div>
  );
}
