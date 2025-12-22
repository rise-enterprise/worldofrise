import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Gift,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const mainNavItems = [
  { path: '/admin', label: 'Home', icon: LayoutDashboard, end: true },
  { path: '/admin/members', label: 'Members', icon: Users },
  { path: '/admin/rewards', label: 'Rewards', icon: Gift },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

const moreItems = [
  { path: '/admin/visits', label: 'Visits' },
  { path: '/admin/points', label: 'Points' },
  { path: '/admin/tiers', label: 'Tiers' },
  { path: '/admin/redemptions', label: 'Redemptions' },
  { path: '/admin/campaigns', label: 'Campaigns' },
  { path: '/admin/locations', label: 'Locations' },
  { path: '/admin/imports', label: 'Imports/Exports' },
  { path: '/admin/audit', label: 'Audit Logs' },
  { path: '/admin/help', label: 'Admin Guide' },
];

export function AdminMobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-2 pb-safe">
      <div className="flex items-center justify-around h-16">
        {mainNavItems.map((item) => {
          const isActive = item.end
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}

        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex flex-col items-center justify-center gap-1 h-auto py-2 px-3">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {moreItems.map((item) => (
              <DropdownMenuItem key={item.path} asChild>
                <NavLink to={item.path} className="w-full">
                  {item.label}
                </NavLink>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
