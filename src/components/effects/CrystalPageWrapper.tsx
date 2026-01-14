import { CrystalBackground } from './CrystalBackground';
import { DiamondSparkles } from './DiamondSparkles';
import { cn } from '@/lib/utils';

interface CrystalPageWrapperProps {
  children: React.ReactNode;
  variant?: 'full' | 'subtle' | 'tiffany' | 'ambient' | 'intense';
  sparkleCount?: number;
  className?: string;
  showSparkles?: boolean;
}

export function CrystalPageWrapper({
  children,
  variant = 'subtle',
  sparkleCount = 15,
  className,
  showSparkles = true
}: CrystalPageWrapperProps) {
  return (
    <div className={cn("min-h-screen bg-background relative overflow-hidden", className)}>
      <CrystalBackground variant={variant}>
        {showSparkles && <DiamondSparkles count={sparkleCount} className="z-[1]" />}
        <div className="relative z-10">
          {children}
        </div>
      </CrystalBackground>
    </div>
  );
}
