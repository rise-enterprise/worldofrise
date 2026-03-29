import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, MapPin, Users, Check, ChevronRight } from 'lucide-react';
import { useExperiences, Experience } from '@/hooks/useExperiences';

const categoryLabels: Record<string, string> = {
  dinner: 'Private Dinner',
  tasting: 'Tasting Ritual',
  chefs_table: "Chef's Table",
  gala: 'Exclusive Gala',
};

export default function MemberExperiences() {
  const { data: experiences = [], isLoading } = useExperiences();
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isRsvpDialogOpen, setIsRsvpDialogOpen] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  const handleRsvp = (exp: Experience) => { setSelectedExperience(exp); setIsRsvpDialogOpen(true); };
  const confirmRsvp = () => { setRsvpSuccess(true); setTimeout(() => { setIsRsvpDialogOpen(false); setRsvpSuccess(false); setSelectedExperience(null); }, 2000); };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-10 w-32" />
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/member">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />Back
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-5xl font-medium text-foreground tracking-crystal">Private Gatherings</h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm">
            Exclusive experiences curated for our most distinguished members
          </p>
        </div>

        {experiences.length === 0 ? (
          <div className="rounded-xl border border-border/15 bg-card/40 p-12 text-center max-w-md mx-auto">
            <Calendar className="h-12 w-12 mx-auto text-primary/20 mb-4" />
            <p className="text-muted-foreground">No upcoming experiences</p>
          </div>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <motion.div key={exp.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                <button onClick={() => handleRsvp(exp)}
                  className="w-full text-left rounded-xl border border-border/15 bg-card/40 backdrop-blur-sm overflow-hidden hover:border-primary/20 transition-all duration-300 group">
                  <div className="flex flex-col md:flex-row">
                    {/* Date */}
                    <div className="md:w-44 p-6 bg-background/30 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/10">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {new Date(exp.date).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="font-display text-4xl text-primary mt-1">{new Date(exp.date).getDate()}</p>
                      <p className="text-sm text-muted-foreground mt-1">{exp.time}</p>
                    </div>
                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="text-[10px] border-border/20 text-muted-foreground">
                              {categoryLabels[exp.category] || exp.category}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] capitalize border-border/20 text-muted-foreground">{exp.tier}+</Badge>
                          </div>
                          <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors tracking-crystal">
                            {exp.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{exp.description}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0 mt-1" />
                      </div>
                      <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary/50" />{exp.location}</span>
                        <span className="flex items-center gap-1"><Users className="h-4 w-4 text-primary/50" />{exp.spotsLeft} spots left</span>
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* RSVP Dialog */}
      <Dialog open={isRsvpDialogOpen} onOpenChange={setIsRsvpDialogOpen}>
        <DialogContent className="max-w-lg bg-card/95 backdrop-blur-2xl border-border/30">
          {!rsvpSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-center tracking-crystal">{selectedExperience?.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <p className="text-sm text-muted-foreground text-center">{selectedExperience?.description}</p>
                <div className="space-y-2">
                  {[
                    { icon: Calendar, label: selectedExperience ? formatDate(selectedExperience.date) : '', sub: selectedExperience?.time },
                    { icon: MapPin, label: selectedExperience?.location || '' },
                    { icon: Users, label: `${selectedExperience?.spotsLeft} spots remaining` },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/15">
                      <item.icon className="h-5 w-5 text-primary/60" />
                      <div>
                        <p className="text-sm">{item.label}</p>
                        {item.sub && <p className="text-xs text-muted-foreground">{item.sub}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-border/30" onClick={() => setIsRsvpDialogOpen(false)}>Perhaps Later</Button>
                  <button className="flex-1 py-2.5 rounded-lg text-primary-foreground font-medium text-sm"
                    style={{ background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-shadow)))' }}
                    onClick={confirmRsvp}>
                    Confirm Attendance
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 border border-success/20">
                <Check className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-display text-xl text-foreground tracking-crystal">You're Invited</h3>
              <p className="text-sm text-muted-foreground mt-2">Confirmation sent to your email.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
