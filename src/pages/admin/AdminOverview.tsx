import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Calendar,
  Coins,
  Gift,
  TrendingUp,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

interface Stats {
  totalMembers: number;
  totalVisits: number;
  totalPoints: number;
  pendingRedemptions: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [membersRes, visitsRes, redemptionsRes] = await Promise.all([
        supabase.from('members').select('id, total_points', { count: 'exact' }),
        supabase.from('visits').select('id', { count: 'exact' }),
        supabase.from('redemptions').select('id', { count: 'exact' }).eq('status', 'requested'),
      ]);

      const totalPoints = membersRes.data?.reduce((sum, m) => sum + (m.total_points || 0), 0) || 0;

      setStats({
        totalMembers: membersRes.count || 0,
        totalVisits: visitsRes.count || 0,
        totalPoints,
        pendingRedemptions: redemptionsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Members', value: stats?.totalMembers || 0, icon: Users, color: 'text-blue-500' },
    { label: 'Total Visits', value: stats?.totalVisits || 0, icon: Calendar, color: 'text-green-500' },
    { label: 'Points in System', value: stats?.totalPoints || 0, icon: Coins, color: 'text-amber-500' },
    { label: 'Pending Redemptions', value: stats?.pendingRedemptions || 0, icon: Gift, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to RISE Loyalty Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Activity feed will show recent visits, redemptions, and admin actions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                System ready - No alerts
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Locations Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['Old Port', 'West Walk', 'Al Hazm', 'Msheireb', 'Laysen Valley'].map((loc) => (
              <div key={loc} className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-sm font-medium">{loc}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
