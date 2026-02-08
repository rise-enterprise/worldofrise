import { Guest, TIER_CONFIG } from '@/types/loyalty';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Coffee, UtensilsCrossed, MapPin, Mail, Phone, Star, Cake, Calendar, Diamond } from 'lucide-react';

interface VIPGuestCardProps {
  guest: Guest;
  onClick?: () => void;
  delay?: number;
  compact?: boolean;
}

const formatFullDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
};

export function VIPGuestCard({ guest, onClick, delay = 0, compact = false }: VIPGuestCardProps) {
  const tierConfig = TIER_CONFIG[guest.tier];
  const initials = guest.name.split(' ').map(n => n[0]).join('');
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  const isTopTier = guest.tier === 'black' || guest.tier === 'inner-circle';
  const displayName = guest.salutation ? `${guest.salutation} ${guest.name}` : guest.name;

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
              isTopTier ? "border-primary/40 ring-1 ring-primary/20" : "border-border/30"
            )}>
              <AvatarImage src={guest.avatarUrl} alt={guest.name} />
              <AvatarFallback className="bg-muted text-foreground font-display text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-display text-sm font-medium text-foreground truncate tracking-wide">
                  {displayName}
                </h4>
                {guest.isVip && <Diamond className="h-3 w-3 text-primary shrink-0" />}
              </div>
              <Badge variant={guest.tier as any} className="text-[10px] mt-1">
                {tierConfig.displayName.split(' ')[0]}
              </Badge>
              {guest.email && (
                <p className="text-[10px] text-muted-foreground/50 truncate mt-1 flex items-center gap-1">
                  <Mail className="h-2.5 w-2.5 shrink-0" />{guest.email}
                </p>
              )}
              {guest.phone && (
                <p className="text-[10px] text-muted-foreground/50 truncate flex items-center gap-1">
                  <Phone className="h-2.5 w-2.5 shrink-0" />{guest.phone}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground/60 tracking-refined">
            <span>{guest.totalVisits} visits</span>
            {guest.totalPoints != null && (
              <span className="flex items-center gap-1"><Star className="h-3 w-3" />{guest.totalPoints}</span>
            )}
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
      {isTopTier && (
        <>
          <div className="absolute top-0 left-0 w-6 h-px bg-gradient-to-r from-primary/50 to-transparent" />
          <div className="absolute top-0 left-0 w-px h-6 bg-gradient-to-b from-primary/50 to-transparent" />
          <div className="absolute bottom-0 right-0 w-6 h-px bg-gradient-to-l from-primary/50 to-transparent" />
          <div className="absolute bottom-0 right-0 w-px h-6 bg-gradient-to-t from-primary/50 to-transparent" />
        </>
      )}
      
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
      
      <CardContent className="px-6 py-7 relative">
        <div className="flex items-start gap-4 mb-5">
          <Avatar className={cn(
            "h-12 w-12 border shrink-0",
            isTopTier ? "border-primary/40 ring-1 ring-primary/20" : "border-border/30"
          )}>
            <AvatarImage src={guest.avatarUrl} alt={guest.name} />
            <AvatarFallback className="bg-muted text-foreground font-display">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="min-w-0 flex-1 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-2 w-2 rounded-full shrink-0",
                guest.status === 'blocked' ? 'bg-destructive' : 'bg-emerald-500 dark:bg-emerald-400'
              )} />
                <h4 className="font-display text-sm font-medium text-foreground tracking-wide">
                {displayName}
              </h4>
              {guest.isVip && <Diamond className="h-3.5 w-3.5 text-primary shrink-0" />}
            </div>
            <Badge variant={guest.tier as any} className="text-[10px] shrink-0 w-fit">
              {tierConfig.displayName}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          {/* Brand, Location, Phone row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60 tracking-refined flex-wrap">
            <span className="flex items-center gap-1.5">
              {guest.favoriteBrand === 'noir' ? <Coffee className="h-3 w-3" /> : <UtensilsCrossed className="h-3 w-3" />}
              {guest.favoriteBrand === 'noir' ? 'NOIR' : 'SASSO'}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {guest.country === 'doha' ? 'Qatar' : 'Riyadh'}
            </span>
            {guest.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0" />{guest.phone}
              </span>
            )}
          </div>

          {/* Email row */}
          {guest.email && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 tracking-refined truncate">
              <Mail className="h-3 w-3 shrink-0" />{guest.email}
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-6 pt-5 border-t border-border/20">
            <div>
              <p className="text-[10px] text-muted-foreground/50 tracking-[0.2em] uppercase leading-relaxed">Visits</p>
              <p className="font-display text-lg font-medium text-primary tracking-wide">{guest.totalVisits}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground/50 tracking-[0.2em] uppercase leading-relaxed">Last visit</p>
              <p className="text-sm text-foreground tracking-refined">{formatDate(guest.lastVisit)}</p>
            </div>
            {guest.totalPoints != null && (
              <div>
                <p className="text-[10px] text-muted-foreground/50 tracking-[0.2em] uppercase leading-relaxed">Points</p>
                <p className="font-display text-lg font-medium text-primary tracking-wide">{guest.totalPoints}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-muted-foreground/50 tracking-[0.2em] uppercase leading-relaxed">Member since</p>
              <p className="text-sm text-foreground tracking-refined">{formatFullDate(guest.joinedAt)}</p>
            </div>
          </div>

          {/* Birthday */}
          {guest.birthday && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 tracking-refined mt-4">
              <Cake className="h-3 w-3" />
              {formatFullDate(guest.birthday)}
            </div>
          )}

          {guest.tags.length > 0 && (
            <div className="flex gap-1.5 mt-4">
              {guest.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] tracking-refined border-border/30 text-muted-foreground/60 hover:border-primary/20 hover:text-primary/70 transition-colors">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
