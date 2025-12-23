import { Guest, TIER_CONFIG } from '@/types/loyalty';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Coffee, UtensilsCrossed, MapPin } from 'lucide-react';

interface VIPGuestCardProps {
  guest: Guest;
  onClick?: () => void;
  delay?: number;
  compact?: boolean;
}

export function VIPGuestCard({ guest, onClick, delay = 0, compact = false }: VIPGuestCardProps) {
  const tierConfig = TIER_CONFIG[guest.tier];
  const initials = guest.name.split(' ').map(n => n[0]).join('');
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  if (compact) {
    return (
      <Card 
        variant="elevated"
        className={cn(
          'cursor-pointer hover:scale-[1.02] transition-all duration-300 animate-slide-up h-full',
          guest.tier === 'black' && 'border-primary/30 shadow-gold'
        )}
        style={{ animationDelay: `${delay}ms` }}
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-10 w-10 border-2 border-border shrink-0">
              <AvatarImage src={guest.avatarUrl} alt={guest.name} />
              <AvatarFallback className="bg-muted text-muted-foreground font-display text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h4 className="font-display text-sm font-medium text-foreground truncate">
                {guest.name}
              </h4>
              <Badge variant={guest.tier as any} className="text-[10px]">
                {tierConfig.displayName.split(' ')[0]}
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{guest.totalVisits} visits</span>
            <span>{formatDate(guest.lastVisit)}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      variant="elevated"
      className={cn(
        'cursor-pointer hover:scale-[1.02] transition-all duration-300 animate-slide-up',
        guest.tier === 'black' && 'border-primary/30 shadow-gold'
      )}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-border">
            <AvatarImage src={guest.avatarUrl} alt={guest.name} />
            <AvatarFallback className="bg-muted text-muted-foreground font-display">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-display text-sm font-medium text-foreground truncate">
                {guest.name}
              </h4>
              <Badge variant={guest.tier as any} className="text-[10px] shrink-0">
                {tierConfig.displayName}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {guest.favoriteBrand === 'noir' ? (
                  <Coffee className="h-3 w-3" />
                ) : (
                  <UtensilsCrossed className="h-3 w-3" />
                )}
                {guest.favoriteBrand === 'noir' ? 'NOIR' : 'SASSO'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {guest.country === 'doha' ? 'Qatar' : 'Riyadh'}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Visits</p>
                  <p className="font-display text-lg font-medium text-foreground">{guest.totalVisits}</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div>
                  <p className="text-xs text-muted-foreground">Last visit</p>
                  <p className="text-sm text-foreground">{formatDate(guest.lastVisit)}</p>
                </div>
              </div>
              
              {guest.tags.length > 0 && (
                <div className="flex gap-1">
                  {guest.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
