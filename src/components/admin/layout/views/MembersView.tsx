import { Users, Search, Filter } from "lucide-react";

export default function MembersView() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Members</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage loyalty program members</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 bg-card">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search members..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none w-48"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 bg-card text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-3 border-b border-border/30 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          <span>Name</span>
          <span>Tier</span>
          <span>Visits</span>
          <span>Points</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-border/20">
          {[
            { name: "Ahmad Al-Thani", tier: "Inner Circle", visits: 142, points: 8500, status: "Active" },
            { name: "Fatima Al-Saud", tier: "Elite", visits: 89, points: 5200, status: "Active" },
            { name: "Mohammed Hassan", tier: "Connoisseur", visits: 56, points: 3100, status: "Active" },
            { name: "Sara Al-Kuwari", tier: "Black", visits: 203, points: 12400, status: "VIP" },
            { name: "Khalid Mansoor", tier: "Initiation", visits: 12, points: 600, status: "At Risk" },
          ].map((member) => (
            <div key={member.name} className="grid grid-cols-5 gap-4 p-3 text-sm hover:bg-muted/20 transition-colors cursor-pointer">
              <span className="text-foreground font-medium">{member.name}</span>
              <span className="text-primary text-xs">{member.tier}</span>
              <span className="text-muted-foreground">{member.visits}</span>
              <span className="text-muted-foreground">{member.points.toLocaleString()}</span>
              <span className={`text-xs ${member.status === "VIP" ? "text-primary" : member.status === "At Risk" ? "text-destructive" : "text-muted-foreground"}`}>
                {member.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
