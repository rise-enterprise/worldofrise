import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CrystalPageWrapper } from '@/components/effects/CrystalPageWrapper';
import { RewardCard } from '@/components/ui/reward-card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Gift, Star, Wine, Crown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRewards, Reward } from '@/hooks/useRewards';
import { useDemoMember } from '@/hooks/useMembers';

const categories = [
  { id: 'all', label: 'All Privileges', icon: Gift },
  { id: 'experience', label: 'Experiences', icon: Star },
  { id: 'vip_table', label: 'VIP Tables', icon: Wine },
  { id: 'invitation', label: 'Invitations', icon: Crown },
];

export default function MemberRewards() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const { data: rewards = [], isLoading: rewardsLoading } = useRewards();
  const { data: member } = useDemoMember();
  
  const memberPoints = member?.totalPoints || 0;

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory);

  const handleRedeem = (reward: Reward) => {
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

  if (rewardsLoading) {
    return (
      <CrystalPageWrapper variant="tiffany" sparkleCount={20}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-12 w-48 mb-8" />
          <Skeleton className="h-24 w-full max-w-xl mx-auto mb-12" />
          <div className="flex justify-center gap-2 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </CrystalPageWrapper>
    );
  }

  return (
    <CrystalPageWrapper variant="tiffany" sparkleCount={20}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/member">
            <Button variant="ghost" size="sm" className="gap-2 hover:text-primary">
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
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground tracking-crystal">
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
              variant={selectedCategory === cat.id ? 'vip-gold' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'gap-2',
                selectedCategory !== cat.id && 'border-primary/30'
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
              id={reward.id}
              title={reward.title}
              description={reward.description || ''}
              brand={reward.brand}
              pointsCost={reward.pointsCost}
              isLimited={reward.availability === 'limited'}
              isUnlocked={reward.availability !== 'sold_out'}
              tierRequired={reward.tier}
              onRedeem={() => handleRedeem(reward)}
              className="animate-slide-up"
            />
          ))}
        </div>

        {filteredRewards.length === 0 && (
          <div className="text-center py-16">
            <Gift className="h-12 w-12 mx-auto text-primary/40" />
            <p className="text-muted-foreground/60 mt-4">No privileges available in this category</p>
          </div>
        )}
      </div>

      {/* Redeem Dialog */}
      <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
        <DialogContent className="crystal-panel-gold max-w-md">
          {!redeemSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-center tracking-crystal">
                  Confirm Redemption
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">{selectedReward?.title}</p>
                  <p className="text-sm text-muted-foreground/60 mt-2">{selectedReward?.description}</p>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg bg-background/50 border border-primary/20">
                  <span className="text-sm text-muted-foreground/60">Points Required</span>
                  <span className="text-lg font-medium text-primary">{selectedReward?.pointsCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg bg-background/50 border border-primary/20">
                  <span className="text-sm text-muted-foreground/60">Your Balance After</span>
                  <span className="text-lg font-medium text-foreground">
                    {(memberPoints - (selectedReward?.pointsCost || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-primary/30" onClick={() => setIsRedeemDialogOpen(false)}>
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
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <Check className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="font-display text-xl text-foreground tracking-crystal">Privilege Redeemed</h3>
              <p className="text-sm text-muted-foreground/60 mt-2">
                Your request has been submitted. We'll be in touch shortly.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CrystalPageWrapper>
  );
}
