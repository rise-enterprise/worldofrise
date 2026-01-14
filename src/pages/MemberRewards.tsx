import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CrystalBackground } from '@/components/effects/CrystalBackground';
import { RewardCard } from '@/components/ui/reward-card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Filter, Gift, Star, Wine, Crown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockRewards = [
  { 
    id: '1', 
    title: 'Private Chef\'s Table', 
    description: 'An intimate dining experience curated by our head chef, featuring a bespoke 7-course tasting menu',
    category: 'experience' as const, 
    brand: 'sasso' as const, 
    tier: 'obsidian' as const, 
    pointsCost: 5000, 
    availability: 'limited' as const,
  },
  { 
    id: '2', 
    title: 'VIP Lounge Access', 
    description: 'Complimentary access to our private lounge with premium beverages and personalized service',
    category: 'vip_table' as const, 
    brand: 'noir' as const, 
    tier: 'onyx' as const, 
    pointsCost: 2500, 
    availability: 'available' as const,
  },
  { 
    id: '3', 
    title: 'Secret Menu Tasting', 
    description: 'Experience our hidden culinary creations, available only to those who know',
    category: 'secret_menu' as const, 
    brand: 'both' as const, 
    tier: 'crystal' as const, 
    pointsCost: 1500, 
    availability: 'available' as const,
  },
  { 
    id: '4', 
    title: 'Royal Gala Invitation', 
    description: 'An exclusive invitation to our annual Royal Gala, featuring world-renowned performers',
    category: 'invitation' as const, 
    brand: 'both' as const, 
    tier: 'royal' as const, 
    pointsCost: 10000, 
    availability: 'limited' as const,
  },
  { 
    id: '5', 
    title: 'Signature Cocktail Creation', 
    description: 'Work with our mixologist to create your own signature cocktail, named after you',
    category: 'experience' as const, 
    brand: 'noir' as const, 
    tier: 'onyx' as const, 
    pointsCost: 3000, 
    availability: 'available' as const,
  },
  { 
    id: '6', 
    title: 'Wine Cellar Experience', 
    description: 'A private tour and tasting in our exclusive wine cellar with our sommelier',
    category: 'experience' as const, 
    brand: 'sasso' as const, 
    tier: 'obsidian' as const, 
    pointsCost: 4500, 
    availability: 'available' as const,
  },
];

const categories = [
  { id: 'all', label: 'All Privileges', icon: Gift },
  { id: 'experience', label: 'Experiences', icon: Star },
  { id: 'vip_table', label: 'VIP Tables', icon: Wine },
  { id: 'invitation', label: 'Invitations', icon: Crown },
];

export default function MemberRewards() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedReward, setSelectedReward] = useState<typeof mockRewards[0] | null>(null);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const memberPoints = 7500; // Mock member points
  const memberTier = 'obsidian';

  const filteredRewards = selectedCategory === 'all' 
    ? mockRewards 
    : mockRewards.filter(r => r.category === selectedCategory);

  const handleRedeem = (reward: typeof mockRewards[0]) => {
    setSelectedReward(reward);
    setIsRedeemDialogOpen(true);
  };

  const confirmRedeem = () => {
    setRedeemSuccess(true);
    setTimeout(() => {
      setIsRedeemDialogOpen(false);
      setRedeemSuccess(false);
      setSelectedReward(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <CrystalBackground variant="subtle" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/member">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Salon
            </Button>
          </Link>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-muted-foreground/60">Your Balance</p>
            <p className="font-display text-2xl text-primary">{memberPoints.toLocaleString()} <span className="text-sm">pts</span></p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground tracking-wide">
            Exclusive Privileges
          </h1>
          <p className="text-muted-foreground/60 mt-4 max-w-xl mx-auto">
            Redeem your points for extraordinary experiences crafted for our most distinguished members
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'gap-2',
                selectedCategory === cat.id && 'bg-primary text-primary-foreground'
              )}
            >
              <cat.icon className="h-4 w-4" />
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              {...reward}
              onRedeem={() => handleRedeem(reward)}
              className="animate-slide-up"
            />
          ))}
        </div>

        {filteredRewards.length === 0 && (
          <div className="text-center py-16">
            <Gift className="h-12 w-12 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground/60 mt-4">No privileges available in this category</p>
          </div>
        )}
      </div>

      {/* Redeem Dialog */}
      <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
        <DialogContent className="bg-[#0E1116] border-[rgba(217,222,231,0.08)] max-w-md">
          {!redeemSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-center">
                  Confirm Redemption
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">{selectedReward?.title}</p>
                  <p className="text-sm text-muted-foreground/60 mt-2">{selectedReward?.description}</p>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg bg-[#0B0D11] border border-[rgba(217,222,231,0.08)]">
                  <span className="text-sm text-muted-foreground/60">Points Required</span>
                  <span className="text-lg font-medium text-primary">{selectedReward?.pointsCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg bg-[#0B0D11] border border-[rgba(217,222,231,0.08)]">
                  <span className="text-sm text-muted-foreground/60">Your Balance After</span>
                  <span className="text-lg font-medium text-foreground">
                    {(memberPoints - (selectedReward?.pointsCost || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setIsRedeemDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="vip-gold" 
                    className="flex-1"
                    onClick={confirmRedeem}
                    disabled={memberPoints < (selectedReward?.pointsCost || 0)}
                  >
                    Confirm Redemption
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="font-display text-xl text-foreground">Privilege Redeemed</h3>
              <p className="text-sm text-muted-foreground/60 mt-2">
                Your request has been submitted. We'll be in touch shortly.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
