import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Guest } from '@/types/loyalty';

interface HeroIdentityProps {
  member: Guest;
}

export function HeroIdentity({ member }: HeroIdentityProps) {
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const tierLabel = member.tierName || 'Member';

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col items-center text-center pt-16 pb-10 px-6 relative"
    >
      {/* Ambient glow behind avatar */}
      <div className="absolute top-12 w-40 h-40 rounded-full bg-primary/10 blur-[60px]" />

      {/* Avatar */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative mb-6"
      >
        <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-primary/30 to-transparent blur-sm" />
        <Avatar className="h-20 w-20 border-2 border-primary/20 relative">
          <AvatarImage src={member.avatarUrl || undefined} alt={member.name} />
          <AvatarFallback className="bg-card text-foreground font-display text-lg tracking-wider">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
      </motion.div>

      {/* Name */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="font-display text-3xl md:text-4xl text-foreground tracking-[0.08em] font-light"
      >
        {member.name}
      </motion.h1>

      {/* Tier badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
        className="mt-3 flex items-center gap-3"
      >
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary/40" />
        <span className="text-[11px] text-primary tracking-[0.3em] uppercase font-body">
          {tierLabel}
        </span>
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary/40" />
      </motion.div>

      {/* Subtle animated light line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="mt-8 h-px w-32 bg-gradient-to-r from-transparent via-primary/30 to-transparent origin-center"
      />
    </motion.section>
  );
}
