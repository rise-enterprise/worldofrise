import { useState } from 'react';
import { Guest, TIER_CONFIG } from '@/types/loyalty';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Coffee, 
  UtensilsCrossed, 
  MapPin,
  Calendar,
  Gift,
  MessageSquare,
  Phone,
  Mail,
  Star,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { GuestInsightsPanel } from '@/components/insights/GuestInsightsPanel';

interface GuestProfileProps {
  guest: Guest;
  onBack: () => void;
}

export function GuestProfile({ guest, onBack }: GuestProfileProps) {
  const isMobile = useIsMobile();
  const [noteOpen, setNoteOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<string[]>(guest.notes ? [guest.notes] : []);
  const [privilegesOpen, setPrivilegesOpen] = useState(!isMobile);
  const [notesOpen, setNotesOpen] = useState(!isMobile);
  const tierConfig = TIER_CONFIG[guest.tier];
  const initials = guest.name.split(' ').map(n => n[0]).join('');
  
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [newNote, ...prev]);
    toast.success('Note added');
    setNewNote('');
    setNoteOpen(false);
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: isMobile ? 'short' : 'long', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const recentVisits = guest.visits.slice(0, isMobile ? 5 : 8);

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="gap-2 animate-fade-in h-9"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Guests</span>
        <span className="sm:hidden">Back</span>
      </Button>

      {/* Profile Header */}
      <Card 
        variant="luxury" 
        className={cn(
          'animate-slide-up',
          guest.tier === 'black' && 'border-primary/30 shadow-gold'
        )}
      >
        <CardContent className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center md:items-start gap-3 md:gap-4">
              <Avatar className="h-20 w-20 md:h-28 md:w-28 border-4 border-border shadow-luxury">
                <AvatarImage src={guest.avatarUrl} alt={guest.name} />
                <AvatarFallback className="bg-muted text-muted-foreground font-display text-2xl md:text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center md:text-left">
                <h2 className="font-display text-xl md:text-2xl font-medium text-foreground">{guest.name}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                  <Badge variant={guest.tier as any} className="text-xs md:text-sm px-3 md:px-4 py-1">
                    {tierConfig.displayName}
                  </Badge>
                  <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">{tierConfig.arabicName}</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                {guest.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stats Grid - 2x2 on mobile, 4 cols on desktop */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="p-3 md:p-4 rounded-xl bg-muted/50 border border-border/50 text-center">
                <p className="font-display text-2xl md:text-3xl font-medium text-foreground">{guest.totalVisits}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Total Visits</p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-muted/50 border border-border/50 text-center">
                <p className="font-display text-2xl md:text-3xl font-medium text-foreground">{guest.lifetimeVisits}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Lifetime</p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-muted/50 border border-border/50 text-center">
                <div className="flex items-center justify-center gap-2">
                  {guest.favoriteBrand === 'noir' ? (
                    <Coffee className="h-5 w-5 text-foreground" />
                  ) : (
                    <UtensilsCrossed className="h-5 w-5 text-sasso-accent" />
                  )}
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Favorite</p>
              </div>
              <div className="p-3 md:p-4 rounded-xl bg-muted/50 border border-border/50 text-center">
                <p className="flex items-center justify-center gap-1 text-lg">
                  {guest.country === 'doha' ? '🇶🇦' : '🇸🇦'}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{guest.country === 'doha' ? 'Qatar' : 'Saudi'}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 mt-6 md:mt-8 pt-4 md:pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{guest.email}</span>
            </div>
            {guest.phone && (
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                {guest.phone}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Member since</span> {formatDate(guest.joinedAt)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Panel */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <GuestInsightsPanel guest={guest} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Privileges - Collapsible on mobile */}
        <Card variant="luxury" className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Collapsible open={privilegesOpen} onOpenChange={setPrivilegesOpen}>
            <CardHeader className="pb-3 md:pb-6">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <Gift className="h-5 w-5 text-primary" />
                    Active Privileges
                  </CardTitle>
                  <div className="md:hidden">
                    {privilegesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-2 md:space-y-3">
                {tierConfig.privileges.map((privilege, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-2.5 md:p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <Star className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-xs md:text-sm text-foreground">{privilege}</p>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Notes - Collapsible on mobile */}
        <Card variant="luxury" className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
            <CardHeader className="pb-3 md:pb-6">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Guest Notes
                  </CardTitle>
                  <div className="md:hidden">
                    {notesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                {notes.length > 0 ? (
                  <div className="space-y-2 md:space-y-3">
                    {notes.map((note, index) => (
                      <div key={index} className="p-2.5 md:p-3 rounded-lg bg-muted/50 border border-border/50">
                        <p className="text-xs md:text-sm text-foreground leading-relaxed">{note}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs md:text-sm text-muted-foreground italic">No notes added for this guest.</p>
                )}
                <Button variant="outline" className="mt-4 w-full h-9 md:h-10" onClick={() => setNoteOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>

      {/* Add Note Dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Add Note for {guest.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Textarea 
              placeholder="Enter your note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setNoteOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleAddNote}>
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Visit History - Compact on mobile */}
      <Card variant="luxury" className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-base md:text-lg">Visit Timeline</CardTitle>
          <p className="text-xs text-muted-foreground">Recent experiences across RISE brands</p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-border" />
            
            <div className="space-y-3 md:space-y-4">
              {recentVisits.map((visit, index) => (
                <div 
                  key={visit.id}
                  className="relative flex items-start gap-3 md:gap-4 pl-8 md:pl-12 animate-slide-up"
                  style={{ animationDelay: `${400 + index * 50}ms` }}
                >
                  {/* Timeline dot */}
                  <div className={cn(
                    'absolute left-2 md:left-4 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-background',
                    visit.brand === 'noir' ? 'bg-foreground' : 'bg-sasso-accent'
                  )} />
                  
                  <div className="flex-1 p-3 md:p-4 rounded-lg bg-muted/50 border border-border/50">
                    <div className="flex items-center justify-between mb-1 md:mb-2 gap-2">
                      <div className="flex items-center gap-2">
                        {visit.brand === 'noir' ? (
                          <Coffee className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        ) : (
                          <UtensilsCrossed className="h-3.5 w-3.5 md:h-4 md:w-4 text-sasso-accent" />
                        )}
                        <span className="font-medium text-xs md:text-sm text-foreground">
                          {visit.brand === 'noir' ? 'NOIR' : 'SASSO'}
                        </span>
                      </div>
                      <span className="text-[10px] md:text-xs text-muted-foreground shrink-0">
                        {formatDate(visit.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{visit.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
