import { cn } from '@/lib/utils';
import { Brand } from '@/types/loyalty';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Gift,
  Settings,
  Crown,
  Coffee,
  UtensilsCrossed,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  activeBrand: Brand;
  setActiveBrand: (brand: Brand) => void;
}

const navigation = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'guests', label: 'Guests', icon: Users },
  { id: 'privileges', label: 'Privileges', icon: Gift },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const brandFilters: { id: Brand; label: string; arabicLabel: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Brands', arabicLabel: 'جميع العلامات', icon: Crown },
  { id: 'noir', label: 'NOIR Café', arabicLabel: 'نوار كافيه', icon: Coffee },
  { id: 'sasso', label: 'SASSO', arabicLabel: 'ساسو', icon: UtensilsCrossed },
];

export function Sidebar({ activeView, setActiveView, activeBrand, setActiveBrand }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b border-sidebar-border">
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold text-gradient-gold">RISE</h1>
            <p className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase">Holding</p>
          </div>
        </div>

        {/* Brand Filter */}
        <div className="p-4 border-b border-sidebar-border">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 px-2">
            Brand View
          </p>
          <div className="space-y-1">
            {brandFilters.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setActiveBrand(brand.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  activeBrand === brand.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <brand.icon className="h-4 w-4" />
                <span className="font-medium">{brand.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 px-2">
            Navigation
          </p>
          <div className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  activeView === item.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-gradient-card rounded-lg p-4 border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">Active Members</p>
            <p className="font-display text-2xl text-foreground">892</p>
            <p className="text-[10px] text-primary mt-1">+12% this month</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
