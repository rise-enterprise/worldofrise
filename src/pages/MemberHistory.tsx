import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMyMember } from '@/hooks/useMyMember';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Coffee, UtensilsCrossed, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MemberHistory() {
  const navigate = useNavigate();
  const { data: member, isLoading } = useMyMember();

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(date);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 max-w-2xl mx-auto pt-16 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="rounded-xl border border-border/40 bg-card/80 backdrop-blur-xl p-8 text-center">
          <p className="text-muted-foreground">No member data available</p>
          <Button variant="outline" className="mt-4 border-border/30" onClick={() => navigate('/member')}>Back</Button>
        </div>
      </div>
    );
  }

  const groupedVisits = member.visits.reduce((acc, visit) => {
    const monthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(visit.date);
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(visit);
    return acc;
  }, {} as Record<string, typeof member.visits>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/15">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/member')} className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <h1 className="font-display text-lg font-medium text-foreground tracking-crystal">Visit History</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { value: member.totalVisits, label: 'Total Visits', color: 'primary' },
            { value: member.visits.filter(v => v.brand === 'noir').length, label: 'NOIR', icon: Coffee },
            { value: member.visits.filter(v => v.brand === 'sasso').length, label: 'SASSO', icon: UtensilsCrossed },
          ].map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl p-4 text-center bg-card/50 border border-border/15 backdrop-blur-sm"
            >
              <p className="font-display text-2xl font-medium text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          {Object.entries(groupedVisits).map(([monthYear, visits], gi) => (
            <motion.div key={monthYear}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + gi * 0.1 }}
            >
              <h3 className="text-sm font-display font-medium text-primary mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />{monthYear}
              </h3>
              <div className="space-y-2 relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />
                {visits.map((visit, index) => (
                  <motion.div key={visit.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="rounded-xl bg-card/40 border border-border/15 backdrop-blur-sm p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center border',
                          visit.brand === 'noir' ? 'bg-foreground/5 border-foreground/10' : 'bg-primary/5 border-primary/10'
                        )}>
                          {visit.brand === 'noir' ? <Coffee className="h-5 w-5 text-foreground/70" /> : <UtensilsCrossed className="h-5 w-5 text-primary/70" />}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{visit.brand === 'noir' ? 'NOIR Café' : 'SASSO'}</p>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />{visit.location}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">{formatDate(visit.date)}</p>
                        <Badge variant="outline" className="text-[10px] mt-1 border-border/20 text-muted-foreground">
                          {visit.country === 'doha' ? 'Qatar' : 'Riyadh'}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {member.visits.length === 0 && (
          <div className="rounded-xl border border-border/20 bg-card/40 p-12 text-center">
            <Calendar className="h-12 w-12 text-primary/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No visits recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
