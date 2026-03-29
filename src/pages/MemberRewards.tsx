import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Gift, Star, Wine, Crown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRewards, Reward } from '@/hooks/useRewards';
import { useMyMember } from '@/hooks/useMyMember';

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
  const { data: member } = useMyMember();
  const memberPoints = member?.totalPoints || 0;

  const filteredRewards = selectedCategory === 'all' ? rewards : rewards.filter(r => r.category === selectedCategory);

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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-12 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/member">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />Back
            </Button>
          </Link>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Your Balance</p>
            <p className="font-display text-2xl text-primary">{memberPoints.toLocaleString()} <span className="text-sm">pts</span></p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-5xl font-medium text-foreground tracking-crystal">Exclusive Privileges</h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm">
            Redeem points for extraordinary experiences crafted for our most distinguished members
          </p>
        </div>

        {/* Categories */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 border',
                selectedCategory === cat.id
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-card/40 border-border/20 text-muted-foreground hover:text-foreground hover:border-border/40'
              )}>
              <cat.icon className="h-4 w-4" />{cat.label}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward, i) => (
            <motion.div key={reward.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="group rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm overflow-hidden hover:border-primary/20 transition-all duration-300 hover:shadow-lg"
              style={{ boxShadow: '0 4px 24px -8px hsl(0 0% 0% / 0.2)' }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--gold) / 0.1)' }}>
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  {reward.availability === 'limited' && (
                    <span className="text-[10px] uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">Limited</span>
                  )}
                </div>
                <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors tracking-crystal mb-2">{reward.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl text-primary">{reward.pointsCost.toLocaleString()} <span className="text-xs text-muted-foreground">pts</span></span>
                  <button onClick={() => handleRedeem(reward)}
                    disabled={reward.availability === 'sold_out' || memberPoints < reward.pointsCost}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      reward.availability === 'sold_out' || memberPoints < reward.pointsCost
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : 'text-primary-foreground hover:opacity-90'
                    )}
                    style={reward.availability !== 'sold_out' && memberPoints >= reward.pointsCost
                      ? { background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-shadow)))' }
                      : undefined
                    }
                  >
                    {reward.availability === 'sold_out' ? 'Unavailable' : memberPoints < reward.pointsCost ? 'Insufficient' : 'Redeem'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredRewards.length === 0 && (
          <div className="text-center py-16">
            <Gift className="h-12 w-12 mx-auto text-primary/20" />
            <p className="text-muted-foreground mt-4">No privileges available in this category</p>
          </div>
        )}
      </div>

      {/* Redeem Dialog */}
      <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-2xl border-border/30">
          {!redeemSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-center tracking-crystal">Confirm Redemption</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">{selectedReward?.title}</p>
                  <p className="text-sm text-muted-foreground mt-2">{selectedReward?.description}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-background/50 border border-border/15">
                    <span className="text-sm text-muted-foreground">Points Required</span>
                    <span className="text-lg font-medium text-primary">{selectedReward?.pointsCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl bg-background/50 border border-border/15">
                    <span className="text-sm text-muted-foreground">Balance After</span>
                    <span className="text-lg font-medium text-foreground">{(memberPoints - (selectedReward?.pointsCost || 0)).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-border/30" onClick={() => setIsRedeemDialogOpen(false)}>Cancel</Button>
                  <button className="flex-1 py-2.5 rounded-lg text-primary-foreground font-medium text-sm"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-shadow)))' }}
                    onClick={confirmRedeem} disabled={memberPoints < (selectedReward?.pointsCost || 0)}>
                    Confirm
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 border border-success/20">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-display text-xl text-foreground tracking-crystal">Privilege Redeemed</h3>
              <p className="text-sm text-muted-foreground mt-2">We'll be in touch shortly with details.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
