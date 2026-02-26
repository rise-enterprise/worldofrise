import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CursorGlowProps {
  className?: string;
  size?: number;
  color?: string;
}

export function CursorGlow({ className, size = 400, color }: CursorGlowProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setVisible(true);
    };
    const handleLeave = () => setVisible(false);

    const el = ref.current?.parentElement;
    if (!el) return;
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <div ref={ref} className={`absolute inset-0 overflow-hidden pointer-events-none ${className || ''}`}>
      <motion.div
        className="absolute rounded-full"
        animate={{
          x: pos.x - size / 2,
          y: pos.y - size / 2,
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle, ${color || 'hsl(var(--gold) / 0.08)'} 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />
    </div>
  );
}
