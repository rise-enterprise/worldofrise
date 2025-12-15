import { useState } from 'react';
import { Guest } from '@/types/loyalty';
import { mockGuests } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GuestInsightsPanel } from '@/components/insights/GuestInsightsPanel';
import { Sparkles, AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TIER_CONFIG } from '@/types/loyalty';

interface BulkInsightsViewProps {
  onSelectGuest: (guest: Guest) => void;
}

export function BulkInsightsView({ onSelectGuest }: BulkInsightsViewProps) {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Calculate at-risk guests based on days since last visit
  const guestsWithRisk = mockGuests.map(guest => {
    const daysSinceLastVisit = Math.floor(
      (Date.now() - guest.lastVisit.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    let risk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (daysSinceLastVisit > 90) risk = 'critical';
    else if (daysSinceLastVisit > 60) risk = 'high';
    else if (daysSinceLastVisit > 30) risk = 'medium';
    
    return { guest, risk, daysSinceLastVisit };
  });

  const atRiskGuests = guestsWithRisk.filter(g => g.risk === 'high' || g.risk === 'critical');
  const mediumRiskGuests = guestsWithRisk.filter(g => g.risk === 'medium');

  const formatDays = (days: number) => {
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  if (selectedGuest) {
    return (
      <div className="p-8 space-y-6">
        <Button variant="ghost" onClick={() => setSelectedGuest(null)} className="gap-2">
          ← Back to At-Risk Guests
        </Button>
        
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-12 w-12">
            <AvatarImage src={selectedGuest.avatarUrl} />
            <AvatarFallback>{selectedGuest.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-display text-xl font-medium text-foreground">{selectedGuest.name}</h2>
            <Badge variant={selectedGuest.tier as any}>{TIER_CONFIG[selectedGuest.tier].displayName}</Badge>
          </div>
        </div>

        <GuestInsightsPanel guest={selectedGuest} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Insights Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Identify at-risk guests and generate personalized re-engagement messages
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-display font-medium text-red-500">{atRiskGuests.length}</p>
                <p className="text-sm text-muted-foreground">Critical/High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-display font-medium text-amber-500">{mediumRiskGuests.length}</p>
                <p className="text-sm text-muted-foreground">Medium Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-2xl font-display font-medium text-emerald-500">
                  {guestsWithRisk.filter(g => g.risk === 'low').length}
                </p>
                <p className="text-sm text-muted-foreground">Healthy Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* At Risk Guests */}
      {atRiskGuests.length > 0 && (
        <Card variant="luxury">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Priority Re-engagement Needed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {atRiskGuests.map(({ guest, risk, daysSinceLastVisit }) => (
              <div
                key={guest.id}
                onClick={() => setSelectedGuest(guest)}
                className={cn(
                  'flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all',
                  'hover:bg-muted/50 border',
                  risk === 'critical' ? 'border-red-500/30 bg-red-500/5' : 'border-orange-500/30 bg-orange-500/5'
                )}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={guest.avatarUrl} />
                    <AvatarFallback>{guest.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{guest.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Last visit: {formatDays(daysSinceLastVisit)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={guest.tier as any}>{TIER_CONFIG[guest.tier].displayName}</Badge>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      risk === 'critical' ? 'border-red-500 text-red-500' : 'border-orange-500 text-orange-500'
                    )}
                  >
                    {risk === 'critical' ? 'Critical' : 'High Risk'}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Sparkles className="h-4 w-4 mr-1" />
                    Generate Insights
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Medium Risk */}
      {mediumRiskGuests.length > 0 && (
        <Card variant="luxury">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              Proactive Outreach Recommended
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mediumRiskGuests.map(({ guest, daysSinceLastVisit }) => (
              <div
                key={guest.id}
                onClick={() => setSelectedGuest(guest)}
                className="flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all hover:bg-muted/50 border border-border/50"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={guest.avatarUrl} />
                    <AvatarFallback>{guest.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{guest.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Last visit: {formatDays(daysSinceLastVisit)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={guest.tier as any}>{TIER_CONFIG[guest.tier].displayName}</Badge>
                  <Badge variant="outline" className="border-amber-500 text-amber-500">
                    Medium Risk
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
