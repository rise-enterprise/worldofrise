import { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  MessageSquare,
  Plus,
  Clock,
  TrendingUp,
  CalendarDays,
  Globe,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { Guest } from '@/types/loyalty';
import { useUpdateMember } from '@/hooks/useMembers';
import { useCreateVisit } from '@/hooks/useVisits';
import { useLocations } from '@/hooks/useLocations';
import { GuestInsightsPanel } from '@/components/insights/GuestInsightsPanel';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface GuestProfileProps {
  guest: Guest;
  onBack: () => void;
}

const tierColors: Record<string, string> = {
  'Initiation': 'bg-slate-500',
  'Bronze': 'bg-amber-600',
  'Silver': 'bg-slate-400',
  'Gold': 'bg-yellow-500',
  'Platinum': 'bg-purple-500',
  'Diamond': 'bg-cyan-400',
};

const brandColors: Record<string, string> = {
  'Noir': 'bg-[#0B0D11] text-foreground border border-[rgba(217,222,231,0.12)]',
  'Sasso': 'bg-primary/10 text-primary border border-primary/20',
  'Both': 'bg-gradient-to-r from-[#0B0D11] to-primary/20 text-foreground',
};

export function GuestProfile({ guest, onBack }: GuestProfileProps) {
  const isMobile = useIsMobile();
  const [noteText, setNoteText] = useState('');
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<'noir' | 'sasso'>('noir');
  
  const updateMember = useUpdateMember();
  const createVisit = useCreateVisit();
  const { data: locations } = useLocations();
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    
    const existingNotes = guest.notes || '';
    const timestamp = format(new Date(), 'MMM d, yyyy HH:mm');
    const newNote = `[${timestamp}] ${noteText.trim()}`;
    const updatedNotes = existingNotes ? `${newNote}\n\n${existingNotes}` : newNote;
    
    updateMember.mutate(
      { id: guest.id, updates: { notes: updatedNotes } },
      {
        onSuccess: () => {
          toast.success('Observation saved');
          setNoteText('');
          setIsNoteDialogOpen(false);
        },
        onError: () => toast.error('Failed to save observation'),
      }
    );
  };

  const handleAddVisit = () => {
    createVisit.mutate(
      {
        member_id: guest.id,
        brand: selectedBrand,
        location_id: selectedLocationId || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Presence recorded successfully');
          setIsAddVisitOpen(false);
        },
        onError: () => toast.error('Failed to record presence'),
      }
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const tierColor = tierColors[guest.tierName] || tierColors['Initiation'];
  const isTopTier = guest.tier === 'black' || guest.tier === 'inner-circle';

  // Parse notes into array for display
  const notesList = guest.notes?.split('\n\n').filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-[#07080A]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[#07080A]/95 backdrop-blur-xl border-b border-[rgba(217,222,231,0.08)]">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-muted-foreground hover:text-foreground hover:bg-[#151921]">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className={cn(
                "h-10 w-10 ring-2 ring-offset-2 ring-offset-[#07080A]",
                isTopTier ? "ring-primary" : tierColor.replace('bg-', 'ring-')
              )}>
                <AvatarImage src={guest.avatarUrl} alt={guest.name} />
                <AvatarFallback className={cn("text-white font-medium", isTopTier ? "bg-primary" : tierColor)}>
                  {getInitials(guest.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-display font-medium text-foreground tracking-wide">{guest.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={cn("text-xs", isTopTier ? "bg-primary/20 text-primary" : cn(tierColor, "text-white"))}>
                    {guest.tierName}
                  </Badge>
                  {guest.status === 'blocked' && (
                    <Badge variant="destructive" className="text-xs">Blocked</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Dialog open={isAddVisitOpen} onOpenChange={setIsAddVisitOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground">
                  <Plus className="h-4 w-4" />
                  {!isMobile && 'Record Presence'}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0E1116] border-[rgba(217,222,231,0.12)]">
                <DialogHeader>
                  <DialogTitle className="font-display text-foreground">Record Presence</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 block">Brand</label>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedBrand === 'noir' ? 'default' : 'outline'}
                        onClick={() => setSelectedBrand('noir')}
                        className={cn(
                          "flex-1",
                          selectedBrand === 'noir' 
                            ? "bg-foreground text-background" 
                            : "bg-transparent border-[rgba(217,222,231,0.12)]"
                        )}
                      >
                        Noir
                      </Button>
                      <Button
                        variant={selectedBrand === 'sasso' ? 'default' : 'outline'}
                        onClick={() => setSelectedBrand('sasso')}
                        className={cn(
                          "flex-1",
                          selectedBrand === 'sasso' 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-transparent border-[rgba(217,222,231,0.12)]"
                        )}
                      >
                        Sasso
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 block">Location (optional)</label>
                    <select 
                      className="w-full p-2 border rounded-md bg-[#0B0D11] border-[rgba(217,222,231,0.12)] text-foreground focus:border-primary/50 focus:outline-none"
                      value={selectedLocationId}
                      onChange={(e) => setSelectedLocationId(e.target.value)}
                    >
                      <option value="">Select location...</option>
                      {locations?.filter(l => l.brand === selectedBrand || l.brand === 'both').map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button 
                    onClick={handleAddVisit} 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
                    disabled={createVisit.isPending}
                  >
                    {createVisit.isPending ? 'Recording...' : 'Confirm Presence'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5 bg-transparent border-[rgba(217,222,231,0.12)] hover:border-primary/30 hover:bg-[#151921]">
                  <MessageSquare className="h-4 w-4" />
                  {!isMobile && 'Add Observation'}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0E1116] border-[rgba(217,222,231,0.12)]">
                <DialogHeader>
                  <DialogTitle className="font-display text-foreground">Add Observation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Textarea
                    placeholder="Record observations about this guest..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[120px] bg-[#0B0D11] border-[rgba(217,222,231,0.12)] focus:border-primary/50"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)} className="bg-transparent border-[rgba(217,222,231,0.12)]">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveNote}
                      disabled={!noteText.trim() || updateMember.isPending}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
                    >
                      {updateMember.isPending ? 'Saving...' : 'Save Observation'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-[#0E1116] border-[rgba(217,222,231,0.08)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground/60 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs uppercase tracking-widest">Total Visits</span>
              </div>
              <p className="text-2xl font-display font-medium text-primary">{guest.totalVisits}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0E1116] border-[rgba(217,222,231,0.08)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground/60 mb-1">
                <Star className="h-4 w-4" />
                <span className="text-xs uppercase tracking-widest">Points</span>
              </div>
              <p className="text-2xl font-display font-medium text-foreground">{guest.totalPoints?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0E1116] border-[rgba(217,222,231,0.08)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground/60 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs uppercase tracking-widest">Last Visit</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {formatDistanceToNow(guest.lastVisit, { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0E1116] border-[rgba(217,222,231,0.08)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground/60 mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs uppercase tracking-widest">Favorite</span>
              </div>
              <Badge className={cn("mt-1", brandColors[guest.favoriteBrand])}>
                {guest.favoriteBrand}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <Card className="bg-[#0E1116] border-[rgba(217,222,231,0.08)]">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              {guest.phone && (
                <a 
                  href={`tel:${guest.phone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>{guest.phone}</span>
                </a>
              )}
              {guest.email && (
                <a 
                  href={`mailto:${guest.email}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>{guest.email}</span>
                </a>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
                <Globe className="h-4 w-4" />
                <span>{guest.country}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
                <CalendarDays className="h-4 w-4" />
                <span>Joined {format(guest.joinedAt, 'MMM d, yyyy')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <GuestInsightsPanel guest={guest} />

        {/* Tabbed Content */}
        <Tabs defaultValue="visits" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-[#0B0D11] border border-[rgba(217,222,231,0.08)]">
            <TabsTrigger value="visits" className="gap-2 data-[state=active]:bg-[#151921] data-[state=active]:text-primary">
              <Calendar className="h-4 w-4" />
              Visits ({guest.visits.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2 data-[state=active]:bg-[#151921] data-[state=active]:text-primary">
              <MessageSquare className="h-4 w-4" />
              Notes ({notesList.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visits" className="mt-4">
            <Card className="bg-[#0E1116] border-[rgba(217,222,231,0.08)]">
              <CardContent className="p-0">
                {guest.visits.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="No visits yet"
                    description="This guest hasn't made any visits. Record their first presence to begin tracking."
                    action={
                      <Button size="sm" onClick={() => setIsAddVisitOpen(true)} className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                        <Plus className="h-4 w-4 mr-1" />
                        Record First Visit
                      </Button>
                    }
                  />
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="divide-y divide-[rgba(217,222,231,0.08)]">
                      {guest.visits.map((visit) => (
                        <div key={visit.id} className="p-4 hover:bg-[#151921]/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                visit.brand === 'noir' ? 'bg-[#0B0D11] border border-[rgba(217,222,231,0.12)]' : 'bg-primary/10 border border-primary/20'
                              )}>
                                <span className={cn(
                                  "text-xs font-medium",
                                  visit.brand === 'noir' ? 'text-foreground' : 'text-primary'
                                )}>
                                  {visit.brand[0].toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground capitalize">{visit.brand}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground/60">
                                  <MapPin className="h-3 w-3" />
                                  <span>{visit.location}</span>
                                </div>
                                {visit.notes && (
                                  <p className="text-sm text-muted-foreground/50 mt-1">{visit.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">
                                {format(visit.date, 'MMM d, yyyy')}
                              </p>
                              <p className="text-xs text-muted-foreground/50">
                                {format(visit.date, 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <Card className="bg-[#0E1116] border-[rgba(217,222,231,0.08)]">
              <CardContent className="p-0">
                {notesList.length === 0 ? (
                  <EmptyState
                    icon={MessageSquare}
                    title="No observations yet"
                    description="Add observations to remember important details about this guest."
                    action={
                      <Button size="sm" onClick={() => setIsNoteDialogOpen(true)} className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                        <Plus className="h-4 w-4 mr-1" />
                        Add First Observation
                      </Button>
                    }
                  />
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="divide-y divide-[rgba(217,222,231,0.08)]">
                      {notesList.map((note, index) => (
                        <div key={index} className="p-4">
                          <p className="text-sm text-foreground whitespace-pre-wrap">{note}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
