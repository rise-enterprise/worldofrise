import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Gift } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

interface RewardCardProps {
  id: string;
  title: string;
  description?: string;
  pointsCost: number;
  imageUrl?: string;
  tierRequired?: string;
  isUnlocked?: boolean;
  isLimited?: boolean;
  brand?: 'noir' | 'sasso' | 'both';
  onRedeem?: (id: string) => void;
  className?: string;
}

export function RewardCard({
  id,
  title,
  description,
  pointsCost,
  imageUrl,
  tierRequired,
  isUnlocked = true,
  isLimited = false,
  brand,
  onRedeem,
  className,
}: RewardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        'bg-card border border-border/40',
        'transition-all duration-500',
        'hover:border-primary/30 hover:shadow-[0_8px_40px_-12px_rgba(200,162,74,0.2)]',
        !isUnlocked && 'opacity-60',
        className
      )}
    >
      {/* Image or gradient placeholder */}
      <div className="relative h-40 overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-card flex items-center justify-center">
            <Gift className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        
        {/* Brand badge */}
        {brand && brand !== 'both' && (
          <Badge 
            variant="outline"
            className="absolute top-3 left-3 bg-card/80 backdrop-blur-sm border-border/50 uppercase tracking-widest text-xs"
          >
            {brand}
          </Badge>
        )}
        
        {/* Limited badge */}
        {isLimited && (
          <Badge 
            variant="default"
            className="absolute top-3 right-3 bg-burgundy/80 border-burgundy text-foreground"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Limited
          </Badge>
        )}
        
        {/* Lock overlay for restricted rewards */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-card/60 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground tracking-refined">
                Requires {tierRequired}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-lg text-foreground tracking-crystal mb-1 line-clamp-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground tracking-refined line-clamp-2 mb-4">
            {description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">Points</p>
            <p className="font-display text-xl text-primary tracking-crystal">
              {pointsCost.toLocaleString()}
            </p>
          </div>
          
          <Button
            variant="vip-gold"
            size="sm"
            disabled={!isUnlocked}
            onClick={() => onRedeem?.(id)}
            className="shadow-none"
          >
            Redeem
          </Button>
        </div>
      </div>
      
      {/* Crystal shine effect on hover */}
      <div 
        className={cn(
          'absolute inset-0 pointer-events-none',
          'bg-gradient-to-r from-transparent via-white/5 to-transparent',
          'translate-x-[-200%] group-hover:translate-x-[200%]',
          'transition-transform duration-1000'
        )}
      />
    </motion.div>
  );
}