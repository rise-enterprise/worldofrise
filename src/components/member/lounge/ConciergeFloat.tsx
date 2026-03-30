import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, Mail, X } from 'lucide-react';

export function ConciergeFloat() {
  const [open, setOpen] = useState(false);

  const actions = [
    { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/97450000000' },
    { icon: Phone, label: 'Call', href: 'tel:+97450000000' },
    { icon: Mail, label: 'Email', href: 'mailto:concierge@rise.com' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mb-2 p-4 rounded-xl border border-border/50 bg-card/90 backdrop-blur-xl shadow-2xl min-w-[200px]"
          >
            <p className="text-[9px] text-primary/60 tracking-[0.3em] uppercase mb-3">
              Your Concierge
            </p>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Request assistance anytime
            </p>
            <div className="space-y-1.5">
              {actions.map(action => (
                <a
                  key={action.label}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground
                           hover:bg-secondary/50 transition-colors duration-200"
                >
                  <action.icon className="h-4 w-4 text-primary/60" />
                  <span className="font-body text-xs tracking-wide">{action.label}</span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="h-12 w-12 rounded-full bg-card border border-primary/20 shadow-lg
                   flex items-center justify-center transition-all duration-300
                   hover:border-primary/40 hover:shadow-[0_0_20px_rgba(180,150,80,0.15)]"
      >
        {open ? (
          <X className="h-4 w-4 text-muted-foreground" />
        ) : (
          <MessageCircle className="h-4 w-4 text-primary/70" />
        )}
      </motion.button>
    </div>
  );
}
