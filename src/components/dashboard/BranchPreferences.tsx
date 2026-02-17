import { useBranchPreferences } from '@/hooks/useBranchPreferences';
import { Brand } from '@/types/loyalty';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';

interface BranchPreferencesProps {
  activeBrand: Brand;
  allowedBranches?: string[];
}

export function BranchPreferences({ activeBrand, allowedBranches }: BranchPreferencesProps) {
  const { data: rawBranches = [], isLoading } = useBranchPreferences(activeBrand);

  const branches = allowedBranches
    ? rawBranches.filter(b =>
        allowedBranches.some(ab => ab.toLowerCase() === b.branch_name.toLowerCase())
      )
    : rawBranches;

  const maxCount = branches.length > 0 ? branches[0].visit_count : 1;

  if (isLoading) {
    return (
      <Card variant="obsidian" className="animate-slide-up">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="obsidian" className="animate-slide-up relative overflow-hidden">
      {/* Crystal accents */}
      <div className="absolute top-0 left-0 w-8 h-px bg-gradient-to-r from-primary/50 to-transparent" />
      <div className="absolute top-0 left-0 w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
      <div className="absolute top-0 right-0 w-8 h-px bg-gradient-to-l from-primary/50 to-transparent" />
      <div className="absolute top-0 right-0 w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />

      <CardHeader className="pb-4 relative">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/30 rounded-full" />
          <div>
            <CardTitle className="text-base md:text-lg tracking-wide font-display flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Branch Preferences
            </CardTitle>
            <p className="text-xs text-muted-foreground/60 mt-1 tracking-refined">
              Top visited locations
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {branches.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No branch data available</p>
        ) : (
          branches.map((branch, index) => {
            const percentage = Math.round((branch.visit_count / maxCount) * 100);
            const isNoir = branch.branch_name.toLowerCase().includes('noir');
            const isSasso = branch.branch_name.toLowerCase().includes('sasso');

            return (
              <div key={branch.branch_name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/90 font-medium truncate max-w-[70%]">
                    {branch.branch_name}
                  </span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {branch.visit_count.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      isNoir
                        ? 'bg-gradient-to-r from-primary/80 to-primary'
                        : isSasso
                        ? 'bg-gradient-to-r from-sapphire/80 to-sapphire'
                        : 'bg-gradient-to-r from-accent/80 to-accent'
                    }`}
                    style={{
                      width: `${percentage}%`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
