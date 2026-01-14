import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Gift, Star, Wine, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reward {
  id: string;
  title: string;
  description: string;
  category: 'experience' | 'vip_table' | 'secret_menu' | 'invitation';
  brand: 'noir' | 'sasso' | 'both';
  minTier: 'crystal' | 'onyx' | 'obsidian' | 'royal';
  pointsCost: number;
  inventory: number | null;
  isActive: boolean;
}

const mockRewards: Reward[] = [
  { id: '1', title: 'Private Chef\'s Table', description: 'An exclusive dining experience with our head chef', category: 'experience', brand: 'sasso', minTier: 'obsidian', pointsCost: 5000, inventory: 10, isActive: true },
  { id: '2', title: 'VIP Lounge Access', description: 'Complimentary access to our private lounge', category: 'vip_table', brand: 'noir', minTier: 'onyx', pointsCost: 2500, inventory: null, isActive: true },
  { id: '3', title: 'Secret Menu Tasting', description: 'Experience our hidden culinary creations', category: 'secret_menu', brand: 'both', minTier: 'crystal', pointsCost: 1500, inventory: 20, isActive: true },
  { id: '4', title: 'Royal Gala Invitation', description: 'Exclusive invitation to our annual Royal Gala', category: 'invitation', brand: 'both', minTier: 'royal', pointsCost: 10000, inventory: 5, isActive: true },
];

const categoryIcons = {
  experience: Star,
  vip_table: Wine,
  secret_menu: Gift,
  invitation: Crown,
};

const tierColors = {
  crystal: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  onyx: 'bg-gray-900/50 text-gray-200 border-gray-700/50',
  obsidian: 'bg-primary/20 text-primary border-primary/30',
  royal: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export function RewardsManagement() {
  const [rewards, setRewards] = useState<Reward[]>(mockRewards);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filteredRewards = filter === 'all' 
    ? rewards 
    : rewards.filter(r => r.category === filter);

  const handleCreateReward = () => {
    setEditingReward(null);
    setIsDialogOpen(true);
  };

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward);
    setIsDialogOpen(true);
  };

  const handleToggleActive = (id: string) => {
    setRewards(rewards.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-wide">
            Rewards Management
          </h1>
          <p className="text-sm text-muted-foreground/60 mt-2 tracking-refined">
            Create and manage exclusive rewards for your members
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="vip-gold" onClick={handleCreateReward}>
              <Plus className="h-4 w-4 mr-2" />
              Create Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0E1116] border-[rgba(217,222,231,0.08)] max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editingReward ? 'Edit Reward' : 'Create New Reward'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  placeholder="Reward title" 
                  defaultValue={editingReward?.title}
                  className="bg-[#0B0D11] border-[rgba(217,222,231,0.08)]"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Reward description" 
                  defaultValue={editingReward?.description}
                  className="bg-[#0B0D11] border-[rgba(217,222,231,0.08)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select defaultValue={editingReward?.category || 'experience'}>
                    <SelectTrigger className="bg-[#0B0D11] border-[rgba(217,222,231,0.08)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="experience">Experience</SelectItem>
                      <SelectItem value="vip_table">VIP Table</SelectItem>
                      <SelectItem value="secret_menu">Secret Menu</SelectItem>
                      <SelectItem value="invitation">Invitation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Select defaultValue={editingReward?.brand || 'both'}>
                    <SelectTrigger className="bg-[#0B0D11] border-[rgba(217,222,231,0.08)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="noir">NOIR</SelectItem>
                      <SelectItem value="sasso">SASSO</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Minimum Tier</Label>
                  <Select defaultValue={editingReward?.minTier || 'crystal'}>
                    <SelectTrigger className="bg-[#0B0D11] border-[rgba(217,222,231,0.08)]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crystal">Crystal</SelectItem>
                      <SelectItem value="onyx">Onyx</SelectItem>
                      <SelectItem value="obsidian">Obsidian</SelectItem>
                      <SelectItem value="royal">Royal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Points Cost</Label>
                  <Input 
                    type="number"
                    placeholder="0" 
                    defaultValue={editingReward?.pointsCost}
                    className="bg-[#0B0D11] border-[rgba(217,222,231,0.08)]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Inventory (leave empty for unlimited)</Label>
                <Input 
                  type="number"
                  placeholder="Unlimited" 
                  defaultValue={editingReward?.inventory || ''}
                  className="bg-[#0B0D11] border-[rgba(217,222,231,0.08)]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="vip-gold" onClick={() => setIsDialogOpen(false)}>
                  {editingReward ? 'Save Changes' : 'Create Reward'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'experience', 'vip_table', 'secret_menu', 'invitation'].map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(cat)}
            className={cn(
              filter === cat && 'bg-primary text-primary-foreground'
            )}
          >
            {cat === 'all' ? 'All' : cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => {
          const Icon = categoryIcons[reward.category];
          return (
            <Card 
              key={reward.id} 
              variant="obsidian" 
              className={cn(
                "animate-slide-up transition-all duration-300",
                !reward.isActive && "opacity-50"
              )}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-display">{reward.title}</CardTitle>
                      <Badge variant="outline" className={cn("mt-1 text-xs", tierColors[reward.minTier])}>
                        {reward.minTier.charAt(0).toUpperCase() + reward.minTier.slice(1)}+
                      </Badge>
                    </div>
                  </div>
                  <Switch 
                    checked={reward.isActive}
                    onCheckedChange={() => handleToggleActive(reward.id)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground/80 mb-4 line-clamp-2">
                  {reward.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-primary font-medium">{reward.pointsCost.toLocaleString()}</span>
                    <span className="text-muted-foreground/60 ml-1">points</span>
                  </div>
                  <div className="text-muted-foreground/60">
                    {reward.inventory ? `${reward.inventory} left` : 'Unlimited'}
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-[rgba(217,222,231,0.08)]">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditReward(reward)}
                  >
                    <Edit2 className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
