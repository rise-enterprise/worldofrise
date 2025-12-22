import { NavLink, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Coins,
  Trophy,
  Gift,
  Megaphone,
  MapPin,
  FileUp,
  Settings,
  HelpCircle,
  ClipboardList,
  Shield,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { path: '/admin/members', label: 'Members', icon: Users },
  { path: '/admin/visits', label: 'Visits', icon: Calendar },
  { path: '/admin/points', label: 'Points', icon: Coins },
  { path: '/admin/tiers', label: 'Tiers', icon: Trophy },
  { path: '/admin/rewards', label: 'Rewards', icon: Gift },
  { path: '/admin/redemptions', label: 'Redemptions', icon: ClipboardList },
  { path: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
  { path: '/admin/locations', label: 'Locations', icon: MapPin },
  { path: '/admin/imports', label: 'Imports/Exports', icon: FileUp },
  { path: '/admin/audit', label: 'Audit Logs', icon: Shield },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
  { path: '/admin/help', label: 'Admin Guide', icon: HelpCircle },
];

export function AdminSidebar() {
  const location = useLocation();
  const { admin } = useAdminAuth();

  const roleColors: Record<string, string> = {
    super_admin: 'bg-red-500/10 text-red-500 border-red-500/20',
    admin: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    manager: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    viewer: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">RISE Admin</h1>
            <p className="text-xs text-muted-foreground">Loyalty System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.end 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{admin?.name}</p>
            <Badge 
              variant="outline" 
              className={cn('text-[10px] px-1.5 py-0', roleColors[admin?.role || 'viewer'])}
            >
              {admin?.role?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  );
}
