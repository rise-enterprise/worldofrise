import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Shield, Filter, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Database } from '@/integrations/supabase/types';

type AuditAction = Database['public']['Enums']['audit_action'];

interface AuditLog {
  id: string;
  action_type: AuditAction;
  entity_type: string;
  entity_id: string | null;
  admin_id: string | null;
  created_at: string;
  before_json: unknown;
  after_json: unknown;
  admin?: {
    name: string;
    email: string;
  } | null;
}

export default function AdminAudit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          admin:admins(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(200);

      if (actionFilter !== 'all') {
        query = query.eq('action_type', actionFilter);
      }
      if (entityFilter !== 'all') {
        query = query.eq('entity_type', entityFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const actionColors: Record<string, string> = {
    create: 'bg-success/10 text-success border-success/20',
    update: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    delete: 'bg-destructive/10 text-destructive border-destructive/20',
    login: 'bg-primary/10 text-primary border-primary/20',
    logout: 'bg-muted text-muted-foreground',
    block: 'bg-destructive/10 text-destructive border-destructive/20',
    unblock: 'bg-success/10 text-success border-success/20',
    approve: 'bg-success/10 text-success border-success/20',
    decline: 'bg-destructive/10 text-destructive border-destructive/20',
    export: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    import: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  const actionTypes = [
    'create', 'update', 'delete', 'login', 'logout',
    'block', 'unblock', 'approve', 'decline', 'export', 'import'
  ];

  const entityTypes = [
    'member', 'visit', 'tier', 'reward', 'redemption',
    'location', 'campaign', 'settings', 'session'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Audit Logs
        </h1>
        <p className="text-muted-foreground">Track all admin actions and system changes</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filters:</span>
            </div>
            <Select value={actionFilter} onValueChange={(val) => setActionFilter(val as AuditAction | 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actionTypes.map(action => (
                  <SelectItem key={action} value={action} className="capitalize">
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entityTypes.map(entity => (
                  <SelectItem key={entity} value={entity} className="capitalize">
                    {entity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Activity Log</span>
            <Badge variant="outline">{logs.length} entries</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        {format(new Date(log.created_at), 'MMM d, HH:mm:ss')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{log.admin?.name || 'System'}</p>
                          <p className="text-xs text-muted-foreground">{log.admin?.email || ''}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${actionColors[log.action_type] || ''}`}
                      >
                        {log.action_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {log.entity_type}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {log.entity_id ? `${log.entity_id.slice(0, 8)}...` : '-'}
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No audit logs found
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
