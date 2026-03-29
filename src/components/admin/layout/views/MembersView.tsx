import { useState } from "react";
import { Users, Search, ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { usePaginatedMembers } from "@/hooks/usePaginatedMembers";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MembersView() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePaginatedMembers({ page, searchQuery: search || undefined });
  const members = data?.guests ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-medium text-foreground tracking-crystal">Members</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalCount.toLocaleString()} loyalty members</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/15 bg-card/40 backdrop-blur-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input placeholder="Search members..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none w-64" />
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="rounded-xl border border-border/15 bg-card/40 backdrop-blur-sm overflow-hidden">
        <div className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-border/10 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          <span className="col-span-2">Member</span>
          <span>Location</span>
          <span>Visits</span>
          <span>Points</span>
          <span>Tier</span>
        </div>

        {isLoading ? (
          <div className="divide-y divide-border/10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 px-4 py-3">
                <Skeleton className="h-5 col-span-2" />
                <Skeleton className="h-5" /><Skeleton className="h-5" /><Skeleton className="h-5" /><Skeleton className="h-5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border/8">
            {members.map((member, i) => (
              <motion.div key={member.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                className="grid grid-cols-6 gap-4 px-4 py-3 text-sm hover:bg-muted/10 transition-colors cursor-pointer">
                <div className="col-span-2 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center text-xs font-medium text-foreground/70 shrink-0">
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
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/8 text-primary border border-primary/10">
                    {member.tierName}
                  </span>
                </div>
              </motion.div>
            ))}
            {members.length === 0 && (
              <div className="p-12 text-center text-muted-foreground text-sm">
                <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                No members found
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
              className="p-1.5 rounded-lg hover:bg-muted/20 disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
              className="p-1.5 rounded-lg hover:bg-muted/20 disabled:opacity-30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
