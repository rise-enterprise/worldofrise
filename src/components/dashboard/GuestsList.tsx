import { useState, useEffect } from 'react';
import { Guest, TIER_CONFIG, Brand, Tier } from '@/types/loyalty';
import { usePaginatedMembers, PAGE_SIZE } from '@/hooks/usePaginatedMembers';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  Search, 
  Coffee, 
  UtensilsCrossed, 
  MapPin,
  ChevronRight,
  ChevronLeft,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuestsListProps {
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

export function GuestsList({ activeBrand, onSelectGuest }: GuestsListProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<Tier | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTier, activeBrand]);

  const { data, isLoading, isFetching } = usePaginatedMembers({
    page: currentPage,
    searchQuery: debouncedSearch,
    tierFilter: selectedTier,
    brandFilter: activeBrand,
  });

  const guests = data?.guests || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 0;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: isMobile ? '2-digit' : 'numeric'
    }).format(date);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-medium text-foreground tracking-wide">Guest Directory</h2>
          <p className="text-xs md:text-sm text-muted-foreground/60 mt-1 tracking-refined">
            {totalCount.toLocaleString()} members in your circle
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-[0_0_20px_rgba(200,162,74,0.15)]">
          <Crown className="h-4 w-4" />
          <span className="hidden sm:inline">Export Distinguished</span>
          <span className="sm:hidden">Export VIPs</span>
        </Button>
      </div>

      {/* Filters */}
      <Card variant="obsidian" className="animate-slide-up relative overflow-hidden">
        {/* Crystal glass effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
        <CardContent className="p-3 md:p-4 relative">
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary/70 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B0D11] border border-primary/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
              />
            </div>

            {/* Tier Filter - Horizontal scroll on mobile */}
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-1">
                {tierFilters.map((tier) => (
                  <Button
                    key={tier.id}
                    variant={selectedTier === tier.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTier(tier.id)}
                    className={cn(
                      "whitespace-nowrap h-8 text-xs md:text-sm transition-all duration-200",
                      selectedTier === tier.id 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-transparent border-[rgba(217,222,231,0.12)] text-muted-foreground hover:text-foreground hover:border-primary/30"
                    )}
                  >
                    {tier.label}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="h-2" />
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} variant="obsidian">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <Skeleton className="h-12 w-12 md:h-14 md:w-14 rounded-full shrink-0 bg-[#151921]" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <Skeleton className="h-4 w-32 md:w-48 bg-[#151921]" />
                    <Skeleton className="h-3 w-24 md:w-32 bg-[#151921]" />
                  </div>
                  <Skeleton className="h-5 w-5 shrink-0 bg-[#151921]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Guest List */}
          <div className={cn("space-y-2 md:space-y-3 transition-opacity", isFetching && "opacity-60")}>
            {guests.length === 0 ? (
              <Card variant="obsidian">
                <CardContent className="p-6 md:p-8 text-center">
                  <p className="text-muted-foreground/60">No members match your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              guests.map((guest, index) => {
                const tierConfig = TIER_CONFIG[guest.tier];
                const initials = guest.name.split(' ').map(n => n[0]).join('');
                const isTopTier = guest.tier === 'black' || guest.tier === 'inner-circle';

                return (
                  <Card 
                    key={guest.id}
                    variant="obsidian"
                    className={cn(
                      'cursor-pointer hover:shadow-[inset_0_0_20px_rgba(200,162,74,0.03)] transition-all duration-300 animate-slide-up active:scale-[0.99]',
                      isTopTier && 'border-primary/20'
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => onSelectGuest(guest)}
                  >
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <Avatar className={cn(
                          "h-12 w-12 md:h-14 md:w-14 border shrink-0",
                          isTopTier ? "border-primary/40 ring-1 ring-primary/20" : "border-[rgba(217,222,231,0.12)]"
                        )}>
                          <AvatarImage src={guest.avatarUrl} alt={guest.name} />
                          <AvatarFallback className="bg-[#0B0D11] text-muted-foreground font-display text-base md:text-lg">
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-display text-sm md:text-base font-medium text-foreground truncate tracking-wide">
                              {guest.name}
                            </h4>
                            <Badge variant={guest.tier as any} className="text-[10px] md:text-xs shrink-0">
                              {isMobile ? tierConfig.displayName.split(' ')[0] : tierConfig.displayName}
                            </Badge>
                            {guest.isVip && (
                              <Badge variant="gold" className="text-[10px] md:text-xs shrink-0">VIP</Badge>
                            )}
                          </div>
                          
                          <p className="text-xs md:text-sm text-muted-foreground/60 truncate">
                            {guest.email || guest.phone || 'No contact info'}
                          </p>
                          
                          {/* Mobile: Show visits inline */}
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground/50">
                            <span className="flex items-center gap-1">
                              {guest.favoriteBrand === 'noir' ? (
                                <Coffee className="h-3 w-3" />
                              ) : (
                                <UtensilsCrossed className="h-3 w-3" />
                              )}
                              <span className="hidden sm:inline">{guest.favoriteBrand === 'noir' ? 'NOIR' : 'SASSO'}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="hidden sm:inline">{guest.country === 'doha' ? 'Qatar' : 'Saudi'}</span>
                            </span>
                            {/* Show visits on mobile */}
                            <span className="md:hidden font-medium text-foreground">
                              {guest.totalVisits} visits
                            </span>
                          </div>
                        </div>

                        {/* Desktop: visits count */}
                        <div className="text-right hidden md:block">
                          <p className="font-display text-2xl font-medium text-primary">{guest.totalVisits}</p>
                          <p className="text-xs text-muted-foreground/50">total visits</p>
                        </div>

                        {/* Desktop: last visit */}
                        <div className="text-right hidden lg:block">
                          <p className="text-sm text-foreground">{formatDate(guest.lastVisit)}</p>
                          <p className="text-xs text-muted-foreground/50">last visit</p>
                        </div>

                        <ChevronRight className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Pagination - Simplified for mobile */}
          {totalPages > 1 && (
            <Card variant="obsidian" className="animate-fade-in">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs md:text-sm text-muted-foreground/60 hidden sm:block">
                    {((currentPage - 1) * PAGE_SIZE) + 1} - {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground/60 sm:hidden">
                    Page {currentPage} of {totalPages}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-9 px-3 bg-transparent border-[rgba(217,222,231,0.12)] hover:border-primary/30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Prev</span>
                    </Button>
                    
                    {/* Page indicator for mobile */}
                    <span className="text-sm font-medium px-2 min-w-[3rem] text-center text-foreground">
                      {currentPage} / {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-9 px-3 bg-transparent border-[rgba(217,222,231,0.12)] hover:border-primary/30"
                    >
                      <span className="hidden sm:inline mr-1">Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
