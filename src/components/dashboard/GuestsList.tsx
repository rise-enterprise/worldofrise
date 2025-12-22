import { useState } from 'react';
import { Guest, TIER_CONFIG, Brand, Tier } from '@/types/loyalty';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Coffee, 
  UtensilsCrossed, 
  MapPin,
  ChevronRight,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface GuestsListProps {
  guests: Guest[];
  activeBrand: Brand;
  onSelectGuest: (guest: Guest) => void;
}

const tierFilters: { id: Tier | 'all'; label: string }[] = [
  { id: 'all', label: 'All Tiers' },
  { id: 'black', label: 'RISE Black' },
  { id: 'inner-circle', label: 'Inner Circle' },
  { id: 'elite', label: 'Élite' },
  { id: 'connoisseur', label: 'Connoisseur' },
  { id: 'initiation', label: 'Initiation' },
];

export function GuestsList({ guests, activeBrand, onSelectGuest }: GuestsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<Tier | 'all'>('all');

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guest.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = activeBrand === 'all' || guest.favoriteBrand === activeBrand;
    const matchesTier = selectedTier === 'all' || guest.tier === selectedTier;
    return matchesSearch && matchesBrand && matchesTier;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-medium text-foreground">Guest Directory</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredGuests.length} members in your circle
          </p>
        </div>
        <Button variant="luxury" className="gap-2 self-start sm:self-auto" size="sm">
          <Crown className="h-4 w-4" />
          <span className="hidden sm:inline">Export VIP List</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>

      {/* Filters */}
      <Card variant="glass" className="animate-slide-up">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Tier Filter - Horizontal Scroll on Mobile */}
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {tierFilters.map((tier) => (
                  <Button
                    key={tier.id}
                    variant={selectedTier === tier.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTier(tier.id)}
                    className="whitespace-nowrap shrink-0"
                  >
                    {tier.label}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Guest List */}
      <div className="space-y-3">
        {filteredGuests.map((guest, index) => {
          const tierConfig = TIER_CONFIG[guest.tier];
          const initials = guest.name.split(' ').map(n => n[0]).join('');

          return (
            <Card 
              key={guest.id}
              variant="elevated"
              className={cn(
                'cursor-pointer hover:scale-[1.01] transition-all duration-300 animate-slide-up',
                guest.tier === 'black' && 'border-primary/30'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onSelectGuest(guest)}
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <Avatar className="h-10 w-10 md:h-14 md:w-14 border-2 border-border shrink-0">
                    <AvatarImage src={guest.avatarUrl} alt={guest.name} />
                    <AvatarFallback className="bg-muted text-muted-foreground font-display text-sm md:text-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="font-display text-sm md:text-base font-medium text-foreground truncate">
                        {guest.name}
                      </h4>
                      <Badge variant={guest.tier as any} className="text-[10px] md:text-xs shrink-0">
                        {tierConfig.displayName}
                      </Badge>
                    </div>
                    
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{guest.email}</p>
                    
                    <div className="flex items-center gap-3 md:gap-4 mt-1.5 md:mt-2 text-[10px] md:text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {guest.favoriteBrand === 'noir' ? (
                          <Coffee className="h-3 w-3" />
                        ) : (
                          <UtensilsCrossed className="h-3 w-3" />
                        )}
                        <span className="hidden sm:inline">{guest.favoriteBrand === 'noir' ? 'NOIR' : 'SASSO'} preferred</span>
                        <span className="sm:hidden">{guest.favoriteBrand === 'noir' ? 'NOIR' : 'SASSO'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="hidden sm:inline">{guest.country === 'qatar' ? 'Qatar' : 'Saudi Arabia'}</span>
                        <span className="sm:hidden">{guest.country === 'qatar' ? 'QA' : 'SA'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <p className="font-display text-xl md:text-2xl font-medium text-foreground">{guest.totalVisits}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">visits</p>
                  </div>

                  <div className="text-right hidden lg:block">
                    <p className="text-sm text-foreground">{formatDate(guest.lastVisit)}</p>
                    <p className="text-xs text-muted-foreground">last visit</p>
                  </div>

                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
