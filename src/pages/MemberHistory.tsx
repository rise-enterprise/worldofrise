import { useNavigate } from 'react-router-dom';
import { useMembers } from '@/hooks/useMembers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Coffee, UtensilsCrossed, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MemberHistory() {
  const navigate = useNavigate();
  const { data: guests = [], isLoading } = useMembers();
  const member = guests[0]; // Demo member - first guest
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-luxury p-4">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-luxury flex items-center justify-center">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No member data available</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/member')}>
              Back to Portal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group visits by month
  const groupedVisits = member.visits.reduce((acc, visit) => {
    const monthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(visit.date);
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(visit);
    return acc;
  }, {} as Record<string, typeof member.visits>);

  return (
    <div className="min-h-screen bg-gradient-luxury">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/member')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="font-display text-lg font-semibold text-foreground">Visit History</h1>
          <div className="w-16" />
        </div>
      </header>

      {/* Stats Summary */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <p className="font-display text-3xl font-medium text-foreground">{member.totalVisits}</p>
              <p className="text-xs text-muted-foreground">Total Visits</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-1">
                <Coffee className="h-6 w-6 text-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                {member.visits.filter(v => v.brand === 'noir').length} visits
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-4 text-center">
              <div className="flex justify-center mb-1">
                <UtensilsCrossed className="h-6 w-6 text-sasso-accent" />
              </div>
              <p className="text-xs text-muted-foreground">
                {member.visits.filter(v => v.brand === 'sasso').length} visits
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Visit Timeline */}
        <div className="space-y-6">
          {Object.entries(groupedVisits).map(([monthYear, visits]) => (
            <div key={monthYear} className="animate-fade-in">
              <h3 className="font-display text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {monthYear}
              </h3>
              <div className="space-y-2">
                {visits.map((visit, index) => (
                  <Card 
                    key={visit.id}
                    className="bg-card/50 border-border/50 animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center',
                            visit.brand === 'noir' ? 'bg-foreground/10' : 'bg-sasso-accent/10'
                          )}>
                            {visit.brand === 'noir' ? (
                              <Coffee className="h-5 w-5 text-foreground" />
                            ) : (
                              <UtensilsCrossed className="h-5 w-5 text-sasso-accent" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {visit.brand === 'noir' ? 'NOIR Café' : 'SASSO'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {visit.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-foreground">{formatDate(visit.date)}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {visit.country === 'doha' ? '🇶🇦 Qatar' : '🇸🇦 Riyadh'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {member.visits.length === 0 && (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No visits recorded yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}