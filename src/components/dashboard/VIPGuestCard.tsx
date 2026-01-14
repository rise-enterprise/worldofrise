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

  const isTopTier = guest.tier === 'black' || guest.tier === 'inner-circle';

  if (compact) {
    return (
      <Card 
        variant="obsidian"
        className={cn(
          'cursor-pointer transition-all duration-300 ease-out animate-slide-up h-full hover:shadow-[inset_0_0_20px_rgba(200,162,74,0.03)]',
          isTopTier && 'border-primary/20'
        )}
        style={{ animationDelay: `${delay}ms` }}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className={cn(
              "h-10 w-10 border shrink-0",
              isTopTier ? "border-primary/40 ring-1 ring-primary/20" : "border-[rgba(217,222,231,0.12)]"
            )}>
              <AvatarImage src={guest.avatarUrl} alt={guest.name} />
              <AvatarFallback className="bg-[#0B0D11] text-foreground font-display text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h4 className="font-display text-sm font-medium text-foreground truncate tracking-wide">
                {guest.name}
              </h4>
              <Badge variant={guest.tier as any} className="text-[10px] mt-1">
                {tierConfig.displayName.split(' ')[0]}
              </Badge>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground/60 tracking-refined">
            <span>{guest.totalVisits} visits</span>
            <span>{formatDate(guest.lastVisit)}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      variant="obsidian"
      className={cn(
        'cursor-pointer transition-all duration-300 ease-out animate-slide-up hover:shadow-[inset_0_0_30px_rgba(200,162,74,0.05)] relative overflow-hidden group',
        isTopTier && 'border-primary/25'
      )}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      {/* Crystal border glow for VIPs */}
      {isTopTier && (
        <>
          <div className="absolute top-0 left-0 w-6 h-px bg-gradient-to-r from-primary/50 to-transparent" />
          <div className="absolute top-0 left-0 w-px h-6 bg-gradient-to-b from-primary/50 to-transparent" />
          <div className="absolute bottom-0 right-0 w-6 h-px bg-gradient-to-l from-primary/50 to-transparent" />
          <div className="absolute bottom-0 right-0 w-px h-6 bg-gradient-to-t from-primary/50 to-transparent" />
        </>
      )}
      
      {/* Prismatic hover sweep */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
      
      <CardContent className="p-5 relative">
        <div className="flex items-start gap-4">
          <Avatar className={cn(
            "h-12 w-12 border",
            isTopTier ? "border-primary/40 ring-1 ring-primary/20" : "border-[rgba(217,222,231,0.12)]"
          )}>
            <AvatarImage src={guest.avatarUrl} alt={guest.name} />
            <AvatarFallback className="bg-[#0B0D11] text-foreground font-display">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="font-display text-sm font-medium text-foreground truncate tracking-wide">
                {guest.name}
              </h4>
              <Badge variant={guest.tier as any} className="text-[10px] shrink-0">
                {tierConfig.displayName}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground/60 tracking-refined">
              <span className="flex items-center gap-1.5">
                {guest.favoriteBrand === 'noir' ? (
                  <Coffee className="h-3 w-3" />
                ) : (
                  <UtensilsCrossed className="h-3 w-3" />
                )}
                {guest.favoriteBrand === 'noir' ? 'NOIR' : 'SASSO'}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                {guest.country === 'doha' ? 'Qatar' : 'Riyadh'}
              </span>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-muted-foreground/50 tracking-[0.2em] uppercase">Visits</p>
                  <p className="font-display text-lg font-medium text-primary tracking-wide">{guest.totalVisits}</p>
                </div>
                <div className="w-px h-8 bg-[rgba(217,222,231,0.08)]" />
                <div>
                  <p className="text-xs text-muted-foreground/50 tracking-[0.2em] uppercase">Last visit</p>
                  <p className="text-sm text-foreground tracking-refined">{formatDate(guest.lastVisit)}</p>
                </div>
              </div>
              
              {guest.tags.length > 0 && (
                <div className="flex gap-1.5">
                  {guest.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] tracking-refined border-[rgba(217,222,231,0.12)] text-muted-foreground/60 hover:border-primary/20 hover:text-primary/70 transition-colors">
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
