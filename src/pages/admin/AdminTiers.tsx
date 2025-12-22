import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { Trophy, Plus, Edit, ArrowUpDown } from 'lucide-react';

interface Tier {
  id: string;
  name: string;
  name_ar: string | null;
  min_visits: number;
  min_points: number | null;
  color: string | null;
  benefits_text_en: string | null;
  benefits_text_ar: string | null;
  is_active: boolean;
  sort_order: number | null;
}

export default function AdminTiers() {
  const { hasPermission, logAudit } = useAdminAuth();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    min_visits: 0,
    min_points: 0,
    color: '#C9A962',
    benefits_text_en: '',
    benefits_text_ar: '',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('tiers')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTiers(data || []);
    } catch (error) {
      logger.error('Error fetching tiers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tiers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingTier(null);
    setFormData({
      name: '',
      name_ar: '',
      min_visits: 0,
      min_points: 0,
      color: '#C9A962',
      benefits_text_en: '',
      benefits_text_ar: '',
      is_active: true,
      sort_order: tiers.length,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (tier: Tier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      name_ar: tier.name_ar || '',
      min_visits: tier.min_visits,
      min_points: tier.min_points || 0,
      color: tier.color || '#C9A962',
      benefits_text_en: tier.benefits_text_en || '',
      benefits_text_ar: tier.benefits_text_ar || '',
      is_active: tier.is_active ?? true,
      sort_order: tier.sort_order || 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!hasPermission('tiers')) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to manage tiers',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingTier) {
        const { error } = await supabase
          .from('tiers')
          .update({
            name: formData.name,
            name_ar: formData.name_ar || null,
            min_visits: formData.min_visits,
            min_points: formData.min_points,
            color: formData.color,
            benefits_text_en: formData.benefits_text_en || null,
            benefits_text_ar: formData.benefits_text_ar || null,
            is_active: formData.is_active,
            sort_order: formData.sort_order,
          })
          .eq('id', editingTier.id);

        if (error) throw error;
        await logAudit('update', 'tier', editingTier.id, editingTier, formData);
        toast({ title: 'Tier Updated', description: 'Tier settings saved successfully' });
      } else {
        const { error } = await supabase
          .from('tiers')
          .insert({
            name: formData.name,
            name_ar: formData.name_ar || null,
            min_visits: formData.min_visits,
            min_points: formData.min_points,
            color: formData.color,
            benefits_text_en: formData.benefits_text_en || null,
            benefits_text_ar: formData.benefits_text_ar || null,
            is_active: formData.is_active,
            sort_order: formData.sort_order,
          });

        if (error) throw error;
        await logAudit('create', 'tier');
        toast({ title: 'Tier Created', description: 'New tier added successfully' });
      }

      setDialogOpen(false);
      fetchTiers();
    } catch (error) {
      logger.error('Error saving tier:', error);
      toast({
        title: 'Error',
        description: 'Failed to save tier',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tiers</h1>
          <p className="text-muted-foreground">Configure loyalty tier thresholds and benefits</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tier
        </Button>
      </div>

      {/* Tiers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiers.map((tier) => (
            <Card key={tier.id} className="relative overflow-hidden">
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: tier.color || '#C9A962' }}
              />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${tier.color}20` }}
                    >
                      <Trophy className="w-5 h-5" style={{ color: tier.color || '#C9A962' }} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                      {tier.name_ar && (
                        <p className="text-sm text-muted-foreground" dir="rtl">
                          {tier.name_ar}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(tier)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Min. Visits</span>
                    <span className="font-medium">{tier.min_visits}</span>
                  </div>
                  {tier.min_points !== null && tier.min_points > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Min. Points</span>
                      <span className="font-medium">{tier.min_points.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={tier.is_active ? 'default' : 'secondary'}>
                      {tier.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {tier.benefits_text_en && (
                    <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t border-border">
                      {tier.benefits_text_en}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTier ? 'Edit Tier' : 'Create Tier'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Gold"
                />
              </div>
              <div className="space-y-2">
                <Label>Name (Arabic)</Label>
                <Input
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  placeholder="الذهبي"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Visits</Label>
                <Input
                  type="number"
                  value={formData.min_visits}
                  onChange={(e) => setFormData({ ...formData, min_visits: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum Points</Label>
                <Input
                  type="number"
                  value={formData.min_points}
                  onChange={(e) => setFormData({ ...formData, min_points: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#C9A962"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Benefits (English)</Label>
              <Textarea
                value={formData.benefits_text_en}
                onChange={(e) => setFormData({ ...formData, benefits_text_en: e.target.value })}
                placeholder="Priority seating, exclusive events..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Benefits (Arabic)</Label>
              <Textarea
                value={formData.benefits_text_ar}
                onChange={(e) => setFormData({ ...formData, benefits_text_ar: e.target.value })}
                placeholder="أولوية الجلوس، فعاليات حصرية..."
                rows={2}
                dir="rtl"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingTier ? 'Save Changes' : 'Create Tier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
