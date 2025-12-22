import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Database } from '@/integrations/supabase/types';

type BrandType = Database['public']['Enums']['brand_type'];
type VisitSource = Database['public']['Enums']['visit_source'];
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Filter,
  User,
  MapPin,
  Coffee,
} from 'lucide-react';
import { format } from 'date-fns';

interface Visit {
  id: string;
  member_id: string;
  brand: string;
  location_id: string | null;
  visit_datetime: string;
  source: string;
  is_voided: boolean;
  created_at: string;
  member?: {
    full_name: string;
    phone: string;
  };
  location?: {
    name: string;
  };
}

export default function AdminVisits() {
  const { hasPermission, logAudit, admin } = useAdminAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState<BrandType | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<VisitSource | 'all'>('all');

  useEffect(() => {
    fetchVisits();
  }, [brandFilter, sourceFilter]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('visits')
        .select(`
          *,
          member:members(full_name, phone),
          location:locations(name)
        `)
        .order('visit_datetime', { ascending: false })
        .limit(100);

      if (brandFilter !== 'all') {
        query = query.eq('brand', brandFilter);
      }
      if (sourceFilter !== 'all') {
        query = query.eq('source', sourceFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVisits(data || []);
    } catch (error) {
      logger.error('Error fetching visits:', error);
      toast({
        title: 'Error',
        description: 'Failed to load visits',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVoidVisit = async (visit: Visit) => {
    if (!hasPermission('visits')) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to void visits',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('visits')
        .update({
          is_voided: true,
          voided_by: admin?.id,
          voided_at: new Date().toISOString(),
          void_reason: 'Voided by admin',
        })
        .eq('id', visit.id);

      if (error) throw error;

      await logAudit('delete', 'visit', visit.id, { is_voided: false }, { is_voided: true });

      toast({
        title: 'Visit Voided',
        description: 'The visit has been voided successfully',
      });

      fetchVisits();
    } catch (error) {
      logger.error('Error voiding visit:', error);
      toast({
        title: 'Error',
        description: 'Failed to void visit',
        variant: 'destructive',
      });
    }
  };

  const brandColors: Record<string, string> = {
    noir: 'bg-noir text-foreground',
    sasso: 'bg-sasso text-foreground',
    both: 'bg-primary/10 text-primary',
  };

  const sourceIcons: Record<string, typeof Calendar> = {
    manual: User,
    qr: Coffee,
    pos: Calendar,
    import: Filter,
  };

  const todayVisits = visits.filter(
    v => format(new Date(v.visit_datetime), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ).length;

  const validVisits = visits.filter(v => !v.is_voided).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Visits</h1>
          <p className="text-muted-foreground">Track and manage member visits</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Record Visit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{todayVisits}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valid Visits</p>
                <p className="text-2xl font-bold">{validVisits}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Voided</p>
                <p className="text-2xl font-bold">{visits.length - validVisits}</p>
              </div>
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>
            <Select value={brandFilter} onValueChange={(val) => setBrandFilter(val as BrandType | 'all')}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="noir">Noir</SelectItem>
                <SelectItem value="sasso">SASSO</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={(val) => setSourceFilter(val as VisitSource | 'all')}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="qr">QR Code</SelectItem>
                <SelectItem value="pos">POS</SelectItem>
                <SelectItem value="import">Import</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visits.map((visit) => {
                  const SourceIcon = sourceIcons[visit.source] || Calendar;
                  return (
                    <TableRow key={visit.id} className={visit.is_voided ? 'opacity-50' : ''}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{visit.member?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{visit.member?.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={brandColors[visit.brand]}>
                          {visit.brand === 'noir' ? 'Noir' : 'SASSO'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {visit.location?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {format(new Date(visit.visit_datetime), 'MMM d, yyyy HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <SourceIcon className="w-3 h-3" />
                          <span className="capitalize">{visit.source}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {visit.is_voided ? (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive">
                            Voided
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-success/10 text-success">
                            Valid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!visit.is_voided && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVoidVisit(visit)}
                            className="text-destructive hover:text-destructive"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Void
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {visits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No visits found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
