import { useState } from "react";
import { Users, Search, ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { usePaginatedMembers } from "@/hooks/usePaginatedMembers";
import { Skeleton } from "@/components/ui/skeleton";

export default function MembersView() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePaginatedMembers({
    page,
    searchQuery: search || undefined,
  });
  const members = data?.guests ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="p-6 space-y-4 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount.toLocaleString()} loyalty members
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 bg-card">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none w-64"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-6 gap-4 p-3 border-b border-border/30 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          <span className="col-span-2">Member</span>
          <span>Location</span>
          <span>Visits</span>
          <span>Points</span>
          <span>Tier</span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="divide-y divide-border/20">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 p-3">
                <Skeleton className="h-5 col-span-2" />
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
              </div>
            ))}
          </div>
        )}

        {/* Rows */}
        {!isLoading && (
          <div className="divide-y divide-border/20">
            {members.map((member) => (
              <div key={member.id} className="grid grid-cols-6 gap-4 p-3 text-sm hover:bg-muted/20 transition-colors cursor-pointer">
                <div className="col-span-2 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground shrink-0">
                    {member.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground font-medium truncate">{member.name}</span>
                      {member.isVip && <Crown className="w-3 h-3 text-primary shrink-0" />}
                    </div>
                    <span className="text-xs text-muted-foreground truncate block">{member.phone || member.email}</span>
                  </div>
                </div>
                <span className="text-muted-foreground capitalize self-center">{member.country}</span>
                <span className="text-muted-foreground self-center">{member.totalVisits ?? 0}</span>
                <span className="text-muted-foreground self-center">{(member.totalPoints ?? 0).toLocaleString()}</span>
                <div className="self-center">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {member.tierName}
                  </span>
                </div>
              </div>
            ))}
            {members.length === 0 && !isLoading && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No members found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-muted/50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg hover:bg-muted/50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
