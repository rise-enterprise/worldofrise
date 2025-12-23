import { useState, useEffect } from 'react';
import { Guest, TIER_CONFIG, Brand, Tier } from '@/types/loyalty';
import { usePaginatedMembers, PAGE_SIZE } from '@/hooks/usePaginatedMembers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Coffee, 
  UtensilsCrossed, 
  MapPin,
  ChevronRight,
  ChevronLeft,
  Crown,
  ChevronsLeft,
  ChevronsRight
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
      year: 'numeric'
    }).format(date);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="font-display text-2xl font-medium text-foreground">Guest Directory</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount.toLocaleString()} members in your circle
          </p>
        </div>
        <Button variant="luxury" className="gap-2">
          <Crown className="h-4 w-4" />
          Export VIP List
        </Button>
      </div>

      {/* Filters */}
      <Card variant="glass" className="animate-slide-up">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            {/* Tier Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {tierFilters.map((tier) => (
                <Button
                  key={tier.id}
                  variant={selectedTier === tier.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTier(tier.id)}
                  className="whitespace-nowrap"
                >
                  {tier.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Guest List */}
          <div className={cn("space-y-3 transition-opacity", isFetching && "opacity-60")}>
            {guests.length === 0 ? (
              <Card variant="elevated">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No members found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              guests.map((guest, index) => {
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
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => onSelectGuest(guest)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border-2 border-border">
                          <AvatarImage src={guest.avatarUrl} alt={guest.name} />
                          <AvatarFallback className="bg-muted text-muted-foreground font-display text-lg">
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-display text-base font-medium text-foreground">
                              {guest.name}
                            </h4>
                            <Badge variant={guest.tier as any} className="text-xs">
                              {tierConfig.displayName}
                            </Badge>
                            {guest.tags.includes('VIP') && (
                              <Badge variant="gold" className="text-xs">VIP</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground">{guest.email || guest.phone || 'No contact info'}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {guest.favoriteBrand === 'noir' ? (
                                <Coffee className="h-3 w-3" />
                              ) : (
                                <UtensilsCrossed className="h-3 w-3" />
                              )}
                              {guest.favoriteBrand === 'noir' ? 'NOIR' : 'SASSO'} preferred
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {guest.country === 'doha' ? 'Qatar' : 'Saudi Arabia'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right hidden md:block">
                          <p className="font-display text-2xl font-medium text-foreground">{guest.totalVisits}</p>
                          <p className="text-xs text-muted-foreground">total visits</p>
                        </div>

                        <div className="text-right hidden lg:block">
                          <p className="text-sm text-foreground">{formatDate(guest.lastVisit)}</p>
                          <p className="text-xs text-muted-foreground">last visit</p>
                        </div>

                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card variant="glass" className="animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * PAGE_SIZE) + 1} - {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount.toLocaleString()} members
                  </p>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1 mx-2">
                      {getPageNumbers().map((page, i) => (
                        page === '...' ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">...</span>
                        ) : (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => goToPage(page as number)}
                            className="h-8 w-8 p-0"
                          >
                            {page}
                          </Button>
                        )
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronsRight className="h-4 w-4" />
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
