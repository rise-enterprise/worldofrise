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
import NoirLogo from '@/assets/NOIR_LOGO.png';
import SassoLogo from '@/assets/sasso_logo.png';
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
  'Noir': 'bg-zinc-800 text-zinc-100',
  'Sasso': 'bg-amber-100 text-amber-900',
  'Both': 'bg-gradient-to-r from-zinc-800 to-amber-600 text-white',
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
          toast.success('Note saved');
          setNoteText('');
          setIsNoteDialogOpen(false);
        },
        onError: () => toast.error('Failed to save note'),
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
          toast.success('Visit logged successfully');
          setIsAddVisitOpen(false);
        },
        onError: () => toast.error('Failed to log visit'),
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

  // Parse notes into array for display
  const notesList = guest.notes?.split('\n\n').filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className={cn("h-10 w-10 ring-2 ring-offset-2 ring-offset-background", tierColor.replace('bg-', 'ring-'))}>
                <AvatarImage src={guest.avatarUrl} alt={guest.name} />
                <AvatarFallback className={cn(tierColor, "text-white font-medium")}>
                  {getInitials(guest.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold text-foreground">{guest.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={cn("text-xs", tierColor, "text-white")}>
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
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  {!isMobile && 'Log Visit'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log New Visit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Brand</label>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedBrand === 'noir' ? 'default' : 'outline'}
                        onClick={() => setSelectedBrand('noir')}
                        className="flex-1"
                      >
                        Noir
                      </Button>
                      <Button
                        variant={selectedBrand === 'sasso' ? 'default' : 'outline'}
                        onClick={() => setSelectedBrand('sasso')}
                        className="flex-1"
                      >
                        Sasso
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location (optional)</label>
                    <select 
                      className="w-full p-2 border rounded-md bg-background"
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
                    className="w-full"
                    disabled={createVisit.isPending}
                  >
                    {createVisit.isPending ? 'Logging...' : 'Log Visit'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  {!isMobile && 'Add Note'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Textarea
                    placeholder="Write a note about this guest..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveNote}
                      disabled={!noteText.trim() || updateMember.isPending}
                    >
                      {updateMember.isPending ? 'Saving...' : 'Save Note'}
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
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Total Visits</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{guest.totalVisits}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Star className="h-4 w-4" />
                <span className="text-xs">Points</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{guest.totalPoints?.toLocaleString() || 0}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Last Visit</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {formatDistanceToNow(guest.lastVisit, { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs">Favorite Brand</span>
              </div>
              <div className={cn(
                "mt-1 w-10 h-10 rounded-lg flex items-center justify-center p-1.5",
                guest.favoriteBrand === 'noir' ? 'bg-noir border border-noir-accent/20' : 
                guest.favoriteBrand === 'sasso' ? 'bg-sasso border border-sasso-accent/20' : 
                'bg-gradient-to-r from-noir to-sasso border border-border'
              )}>
                {guest.favoriteBrand === 'both' ? (
                  <div className="flex items-center gap-0.5">
                    <img src={NoirLogo} alt="NOIR" className="h-4 w-4 object-contain" />
                    <img src={SassoLogo} alt="SASSO" className="h-4 w-4 object-contain" />
                  </div>
                ) : (
                  <img 
                    src={guest.favoriteBrand === 'noir' ? NoirLogo : SassoLogo} 
                    alt={guest.favoriteBrand} 
                    className="h-6 w-6 object-contain" 
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              {guest.phone && (
                <a 
                  href={`tel:${guest.phone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>{guest.phone}</span>
                </a>
              )}
              {guest.email && (
                <a 
                  href={`mailto:${guest.email}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>{guest.email}</span>
                </a>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span>{guest.country}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="visits" className="gap-2">
              <Calendar className="h-4 w-4" />
              Visits ({guest.visits.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Notes ({notesList.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visits" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {guest.visits.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="No visits yet"
                    description="This guest hasn't made any visits. Log their first visit to start tracking."
                    action={
                      <Button size="sm" onClick={() => setIsAddVisitOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Log First Visit
                      </Button>
                    }
                  />
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="divide-y divide-border">
                      {guest.visits.map((visit) => (
                        <div key={visit.id} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 p-1.5",
                                visit.brand === 'noir' ? 'bg-noir border border-noir-accent/20' : 'bg-sasso border border-sasso-accent/20'
                              )}>
                                <img 
                                  src={visit.brand === 'noir' ? NoirLogo : SassoLogo} 
                                  alt={visit.brand} 
                                  className="h-6 w-6 object-contain" 
                                />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{visit.brand}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span>{visit.location}</span>
                                </div>
                                {visit.notes && (
                                  <p className="text-sm text-muted-foreground mt-1">{visit.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">
                                {format(visit.date, 'MMM d, yyyy')}
                              </p>
                              <p className="text-xs text-muted-foreground">
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
            <Card>
              <CardContent className="p-0">
                {notesList.length === 0 ? (
                  <EmptyState
                    icon={MessageSquare}
                    title="No notes yet"
                    description="Add notes to remember important details about this guest."
                    action={
                      <Button size="sm" onClick={() => setIsNoteDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add First Note
                      </Button>
                    }
                  />
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="divide-y divide-border">
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
