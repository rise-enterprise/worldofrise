import { cn } from '@/lib/utils';
import { Brand } from '@/types/loyalty';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  Sparkles,
  Crown,
  Coffee,
  UtensilsCrossed,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

interface MobileNavBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  activeBrand: Brand;
  setActiveBrand: (brand: Brand) => void;
}

const navigation = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'guests', label: 'Guests', icon: Users },
  { id: 'insights', label: 'Insights', icon: Sparkles },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const brandFilters: { id: Brand; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Brands', icon: Crown },
  { id: 'noir', label: 'NOIR', icon: Coffee },
  { id: 'sasso', label: 'SASSO', icon: UtensilsCrossed },
];

export function MobileNavBar({ activeView, setActiveView, activeBrand, setActiveBrand }: MobileNavBarProps) {
  const [brandSheetOpen, setBrandSheetOpen] = useState(false);
  
  const currentBrand = brandFilters.find(b => b.id === activeBrand);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2 px-1">
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]',
              activeView === item.id
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        
        {/* Brand Switcher */}
        <Sheet open={brandSheetOpen} onOpenChange={setBrandSheetOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] text-muted-foreground">
              {currentBrand && <currentBrand.icon className="h-5 w-5" />}
              <span className="text-[10px] font-medium">Brand</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle className="font-display">Select Brand</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-2">
              {brandFilters.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => {
                    setActiveBrand(brand.id);
                    setBrandSheetOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all',
                    activeBrand === brand.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <brand.icon className="h-5 w-5" />
                  <span className="font-medium">{brand.label}</span>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
