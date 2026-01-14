import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CrystalPageWrapper } from '@/components/effects/CrystalPageWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, MapPin, Users, Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Experience {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  spotsLeft: number;
  tier: 'crystal' | 'onyx' | 'obsidian' | 'royal';
  brand: 'noir' | 'sasso' | 'both';
  category: 'dinner' | 'tasting' | 'chefs_table' | 'gala';
}

const mockExperiences: Experience[] = [
  {
    id: '1',
    title: 'Midnight Tasting Ritual',
    description: 'An exclusive after-hours tasting experience featuring rare vintages and secret menu items, hosted by our Master Sommelier.',
    date: '2026-02-15',
    time: '22:00',
    location: 'NOIR Private Cellar',
    capacity: 12,
    spotsLeft: 4,
    tier: 'obsidian',
    brand: 'noir',
    category: 'tasting',
  },
  {
    id: '2',
    title: 'Chef\'s Table: Italian Odyssey',
    description: 'A seven-course journey through the regions of Italy, prepared tableside by Chef Marco Bellini.',
    date: '2026-02-20',
    time: '19:30',
    location: 'SASSO Private Dining',
    capacity: 8,
    spotsLeft: 2,
    tier: 'royal',
    brand: 'sasso',
    category: 'chefs_table',
  },
  {
    id: '3',
    title: 'Members\' Evening Soirée',
    description: 'An intimate gathering for our distinguished members, featuring live jazz, fine spirits, and culinary delights.',
    date: '2026-02-28',
    time: '20:00',
    location: 'RISE Private Lounge',
    capacity: 30,
    spotsLeft: 12,
    tier: 'onyx',
    brand: 'both',
    category: 'dinner',
  },
  {
    id: '4',
    title: 'Spring Gala 2026',
    description: 'Our annual celebration of excellence, featuring a black-tie dinner, world-renowned entertainment, and exclusive announcements.',
    date: '2026-03-21',
    time: '18:00',
    location: 'The Grand Ballroom',
    capacity: 150,
    spotsLeft: 45,
    tier: 'crystal',
    brand: 'both',
    category: 'gala',
  },
];

const tierColors = {
  crystal: 'border-gray-400/30 bg-gray-500/10',
  onyx: 'border-gray-600/30 bg-gray-800/20',
  obsidian: 'border-primary/30 bg-primary/10',
  royal: 'border-yellow-500/30 bg-yellow-500/10',
};

const categoryLabels = {
  dinner: 'Private Dinner',
  tasting: 'Tasting Ritual',
  chefs_table: 'Chef\'s Table',
  gala: 'Exclusive Gala',
};

export default function MemberExperiences() {
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [isRsvpDialogOpen, setIsRsvpDialogOpen] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  const handleRsvp = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsRsvpDialogOpen(true);
  };

  const confirmRsvp = () => {
    setRsvpSuccess(true);
    setTimeout(() => {
      setIsRsvpDialogOpen(false);
      setRsvpSuccess(false);
      setSelectedExperience(null);
    }, 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

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
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground tracking-crystal">
            Private Gatherings
          </h1>
          <p className="text-muted-foreground/60 mt-4 max-w-xl mx-auto">
            Exclusive experiences curated for our most distinguished members
          </p>
        </div>

        {/* Experiences List */}
        <div className="space-y-6">
          {mockExperiences.map((experience, index) => (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card 
                className={cn(
                  "crystal-panel overflow-hidden hover:border-primary/30 transition-all duration-300 cursor-pointer group",
                  tierColors[experience.tier]
                )}
                onClick={() => handleRsvp(experience)}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Date Section */}
                    <div className="md:w-48 p-6 bg-background/50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-primary/10">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground/60">
                        {new Date(experience.date).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="font-display text-4xl text-primary mt-1">
                        {new Date(experience.date).getDate()}
                      </p>
                      <p className="text-sm text-muted-foreground/60 mt-1">
                        {experience.time}
                      </p>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs border-primary/30">
                              {categoryLabels[experience.category]}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize border-primary/30">
                              {experience.tier}+
                            </Badge>
                            {experience.brand !== 'both' && (
                              <Badge variant="outline" className="text-xs uppercase border-primary/30">
                                {experience.brand}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-display text-xl text-foreground group-hover:text-primary transition-colors tracking-crystal">
                            {experience.title}
                          </h3>
                          <p className="text-sm text-muted-foreground/60 mt-2 line-clamp-2">
                            {experience.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground/60">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          {experience.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-primary" />
                          {experience.spotsLeft} of {experience.capacity} spots left
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RSVP Dialog */}
      <Dialog open={isRsvpDialogOpen} onOpenChange={setIsRsvpDialogOpen}>
        <DialogContent className="crystal-panel-gold max-w-lg">
          {!rsvpSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl text-center tracking-crystal">
                  {selectedExperience?.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <p className="text-sm text-muted-foreground/80 text-center">
                  {selectedExperience?.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-primary/20">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{selectedExperience && formatDate(selectedExperience.date)}</p>
                      <p className="text-xs text-muted-foreground/60">{selectedExperience?.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-primary/20">
                    <MapPin className="h-5 w-5 text-primary" />
                    <p className="text-sm">{selectedExperience?.location}</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-primary/20">
                    <Users className="h-5 w-5 text-primary" />
                    <p className="text-sm">{selectedExperience?.spotsLeft} spots remaining</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-primary/30" onClick={() => setIsRsvpDialogOpen(false)}>
                    Perhaps Later
                  </Button>
                  <Button 
                    variant="vip-gold" 
                    className="flex-1"
                    onClick={confirmRsvp}
                  >
                    Confirm Attendance
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <Check className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="font-display text-xl text-foreground tracking-crystal">You're Invited</h3>
              <p className="text-sm text-muted-foreground/60 mt-2">
                A confirmation has been sent to your email. We look forward to welcoming you.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </CrystalPageWrapper>
  );
}
