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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { Gift, Plus, Edit, Coins, Calendar, Store } from 'lucide-react';
import { format } from 'date-fns';

interface Reward {
  id: string;
  title_en: string;
  title_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  points_cost: number;
  brand_scope: string | null;
  validity_start: string | null;
  validity_end: string | null;
  is_active: boolean;
  stock_limit: number | null;
  per_member_limit: number | null;
  created_at: string;
}

export default function AdminRewards() {
  const { hasPermission, logAudit, admin } = useAdminAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    points_cost: 100,
    brand_scope: 'both',
    validity_start: '',
    validity_end: '',
    is_active: true,
    stock_limit: null as number | null,
    per_member_limit: 1,
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      logger.error('Error fetching rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rewards',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingReward(null);
    setFormData({
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      points_cost: 100,
      brand_scope: 'both',
      validity_start: '',
      validity_end: '',
      is_active: true,
      stock_limit: null,
      per_member_limit: 1,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      title_en: reward.title_en,
      title_ar: reward.title_ar || '',
      description_en: reward.description_en || '',
      description_ar: reward.description_ar || '',
      points_cost: reward.points_cost,
      brand_scope: reward.brand_scope || 'both',
      validity_start: reward.validity_start || '',
      validity_end: reward.validity_end || '',
      is_active: reward.is_active ?? true,
      stock_limit: reward.stock_limit,
      per_member_limit: reward.per_member_limit || 1,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!hasPermission('rewards')) {
      toast({
        title: 'Permission Denied',
        description: 'You do not have permission to manage rewards',
        variant: 'destructive',
      });
      return;
    }

    try {
      const rewardData = {
        title_en: formData.title_en,
        title_ar: formData.title_ar || null,
        description_en: formData.description_en || null,
        description_ar: formData.description_ar || null,
        points_cost: formData.points_cost,
        brand_scope: formData.brand_scope as 'noir' | 'sasso' | 'both',
        validity_start: formData.validity_start || null,
        validity_end: formData.validity_end || null,
        is_active: formData.is_active,
        stock_limit: formData.stock_limit,
        per_member_limit: formData.per_member_limit,
      };

      if (editingReward) {
        const { error } = await supabase
          .from('rewards')
          .update(rewardData)
          .eq('id', editingReward.id);

        if (error) throw error;
        await logAudit('update', 'reward', editingReward.id, editingReward, rewardData);
        toast({ title: 'Reward Updated', description: 'Reward saved successfully' });
      } else {
        const { error } = await supabase
          .from('rewards')
          .insert({
            ...rewardData,
            created_by: admin?.id,
          });

        if (error) throw error;
        await logAudit('create', 'reward');
        toast({ title: 'Reward Created', description: 'New reward added successfully' });
      }

      setDialogOpen(false);
      fetchRewards();
    } catch (error) {
      logger.error('Error saving reward:', error);
      toast({
        title: 'Error',
        description: 'Failed to save reward',
        variant: 'destructive',
      });
    }
  };

  const brandLabels: Record<string, string> = {
    noir: 'Noir',
    sasso: 'SASSO',
    both: 'All Brands',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Rewards</h1>
          <p className="text-muted-foreground">Manage loyalty rewards and redemption options</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Reward
        </Button>
      </div>

      {/* Rewards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <Card key={reward.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{reward.title_en}</CardTitle>
                      {reward.title_ar && (
                        <p className="text-sm text-muted-foreground truncate" dir="rtl">
                          {reward.title_ar}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(reward)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-primary">{reward.points_cost} points</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <Store className="w-3 h-3 mr-1" />
                      {brandLabels[reward.brand_scope || 'both']}
                    </Badge>
                    <Badge variant={reward.is_active ? 'default' : 'secondary'}>
                      {reward.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  {(reward.validity_start || reward.validity_end) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {reward.validity_start && format(new Date(reward.validity_start), 'MMM d')}
                      {' - '}
                      {reward.validity_end ? format(new Date(reward.validity_end), 'MMM d, yyyy') : 'No end'}
                    </div>
                  )}

                  {reward.description_en && (
                    <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t border-border">
                      {reward.description_en}
                    </p>
                  )}

                  <div className="flex justify-between text-xs text-muted-foreground pt-2">
                    <span>Stock: {reward.stock_limit ?? '∞'}</span>
                    <span>Limit: {reward.per_member_limit}/member</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingReward ? 'Edit Reward' : 'Create Reward'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title (English) *</Label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder="Free coffee"
                />
              </div>
              <div className="space-y-2">
                <Label>Title (Arabic)</Label>
                <Input
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  placeholder="قهوة مجانية"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description (English)</Label>
              <Textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Enjoy a complimentary beverage..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Arabic)</Label>
              <Textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                placeholder="استمتع بمشروب مجاني..."
                rows={2}
                dir="rtl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Points Cost *</Label>
                <Input
                  type="number"
                  value={formData.points_cost}
                  onChange={(e) => setFormData({ ...formData, points_cost: parseInt(e.target.value) || 0 })}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Brand Scope</Label>
                <Select
                  value={formData.brand_scope}
                  onValueChange={(value) => setFormData({ ...formData, brand_scope: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">All Brands</SelectItem>
                    <SelectItem value="noir">Noir Only</SelectItem>
                    <SelectItem value="sasso">SASSO Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Validity Start</Label>
                <Input
                  type="date"
                  value={formData.validity_start}
                  onChange={(e) => setFormData({ ...formData, validity_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Validity End</Label>
                <Input
                  type="date"
                  value={formData.validity_end}
                  onChange={(e) => setFormData({ ...formData, validity_end: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stock Limit (empty = unlimited)</Label>
                <Input
                  type="number"
                  value={formData.stock_limit ?? ''}
                  onChange={(e) => setFormData({ ...formData, stock_limit: e.target.value ? parseInt(e.target.value) : null })}
                  min={0}
                  placeholder="∞"
                />
              </div>
              <div className="space-y-2">
                <Label>Per Member Limit</Label>
                <Input
                  type="number"
                  value={formData.per_member_limit}
                  onChange={(e) => setFormData({ ...formData, per_member_limit: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
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
            <Button onClick={handleSave} disabled={!formData.title_en || formData.points_cost < 1}>
              {editingReward ? 'Save Changes' : 'Create Reward'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
