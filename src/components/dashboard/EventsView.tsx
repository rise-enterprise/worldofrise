import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, MapPin, Users, Clock, Plus, Coffee, UtensilsCrossed, X, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { mockGuests } from '@/data/mockData';

interface Event {
  id: string;
  title: string;
  titleArabic: string;
  date: Date;
  time: string;
  location: string;
  country: 'qatar' | 'riyadh';
  brand: 'noir' | 'sasso';
  tier: string;
  capacity: number;
  registered: number;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'draft';
  attendees: string[];
}

const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Literary Evening with Local Authors',
    titleArabic: 'أمسية أدبية مع كتاب محليين',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    time: '7:00 PM',
    location: 'NOIR Café, The Pearl',
    country: 'qatar',
    brand: 'noir',
    tier: 'Élite+',
    capacity: 30,
    registered: 24,
    description: 'An intimate evening of poetry and prose with celebrated Qatari authors.',
    status: 'upcoming',
    attendees: ['1', '3', '7'],
  },
  {
    id: '2',
    title: 'SASSO Chef Table Experience',
    titleArabic: 'تجربة طاولة الشيف في ساسو',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    time: '8:00 PM',
    location: 'SASSO, Riyadh',
    country: 'riyadh',
    brand: 'sasso',
    tier: 'Inner Circle+',
    capacity: 12,
    registered: 10,
    description: 'Exclusive 8-course tasting menu crafted by our Executive Chef.',
    status: 'upcoming',
    attendees: ['2', '6'],
  },
  {
    id: '3',
    title: 'Coffee Origins: Ethiopia',
    titleArabic: 'أصول القهوة: إثيوبيا',
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    time: '10:00 AM',
    location: 'NOIR Café, Lusail',
    country: 'qatar',
    brand: 'noir',
    tier: 'Connoisseur+',
    capacity: 20,
    registered: 8,
    description: 'A curated tasting journey through Ethiopian coffee varieties.',
    status: 'upcoming',
    attendees: ['1', '8'],
  },
  {
    id: '4',
    title: 'Italian Wine Pairing Dinner',
    titleArabic: 'عشاء مع النبيذ الإيطالي',
    date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    time: '7:30 PM',
    location: 'SASSO, The Pearl',
    country: 'qatar',
    brand: 'sasso',
    tier: 'RISE Black',
    capacity: 16,
    registered: 16,
    description: 'An exclusive evening featuring rare Italian wines paired with signature dishes.',
    status: 'upcoming',
    attendees: ['1', '8'],
  },
  {
    id: '5',
    title: 'Barista Masterclass',
    titleArabic: 'دورة باريستا',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    time: '3:00 PM',
    location: 'NOIR Café, The Pearl',
    country: 'qatar',
    brand: 'noir',
    tier: 'All Members',
    capacity: 15,
    registered: 15,
    description: 'Learn the art of specialty coffee from our expert baristas.',
    status: 'completed',
    attendees: [],
  },
  {
    id: '6',
    title: 'Summer Garden Party',
    titleArabic: 'حفلة الحديقة الصيفية',
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    time: '6:00 PM',
    location: 'TBD',
    country: 'qatar',
    brand: 'sasso',
    tier: 'Inner Circle+',
    capacity: 50,
    registered: 0,
    description: 'An outdoor celebration of Italian summer cuisine.',
    status: 'draft',
    attendees: [],
  },
];

export function EventsView() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [guestListOpen, setGuestListOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    titleArabic: '',
    date: '',
    time: '',
    location: '',
    country: 'qatar' as 'qatar' | 'riyadh',
    brand: 'noir' as 'noir' | 'sasso',
    tier: 'All Members',
    capacity: 20,
    description: '',
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
    }).format(date);
  };

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status === 'completed');
  const draftEvents = events.filter(e => e.status === 'draft');

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      ...newEvent,
      date: new Date(newEvent.date),
      registered: 0,
      status: 'upcoming',
      attendees: [],
    };

    setEvents(prev => [...prev, event]);
    toast.success('Event created successfully!');
    setCreateOpen(false);
    setNewEvent({
      title: '',
      titleArabic: '',
      date: '',
      time: '',
      location: '',
      country: 'qatar',
      brand: 'noir',
      tier: 'All Members',
      capacity: 20,
      description: '',
    });
  };

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event);
    setDetailsOpen(true);
  };

  const handleManageGuestList = (event: Event) => {
    setSelectedEvent(event);
    setGuestListOpen(true);
  };

  const handleAddAttendee = (guestId: string) => {
    if (!selectedEvent) return;
    
    if (selectedEvent.attendees.includes(guestId)) {
      toast.error('Guest already registered');
      return;
    }

    if (selectedEvent.attendees.length >= selectedEvent.capacity) {
      toast.error('Event is at full capacity');
      return;
    }

    setEvents(prev => prev.map(e => {
      if (e.id === selectedEvent.id) {
        return {
          ...e,
          attendees: [...e.attendees, guestId],
          registered: e.registered + 1,
        };
      }
      return e;
    }));

    setSelectedEvent(prev => prev ? {
      ...prev,
      attendees: [...prev.attendees, guestId],
      registered: prev.registered + 1,
    } : null);

    toast.success('Guest added to event');
  };

  const handleRemoveAttendee = (guestId: string) => {
    if (!selectedEvent) return;

    setEvents(prev => prev.map(e => {
      if (e.id === selectedEvent.id) {
        return {
          ...e,
          attendees: e.attendees.filter(id => id !== guestId),
          registered: e.registered - 1,
        };
      }
      return e;
    }));

    setSelectedEvent(prev => prev ? {
      ...prev,
      attendees: prev.attendees.filter(id => id !== guestId),
      registered: prev.registered - 1,
    } : null);

    toast.success('Guest removed from event');
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    toast.success('Event deleted');
    setDetailsOpen(false);
  };

  const handlePublishDraft = (eventId: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return { ...e, status: 'upcoming' as const };
      }
      return e;
    }));
    toast.success('Event published!');
  };

  const renderEventCard = (event: Event, index: number) => (
    <Card 
      key={event.id}
      variant="luxury"
      className="animate-slide-up overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={cn(
        'h-2',
        event.brand === 'noir' ? 'bg-foreground' : 'bg-sasso-accent'
      )} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {event.brand === 'noir' ? (
              <Coffee className="h-5 w-5" />
            ) : (
              <UtensilsCrossed className="h-5 w-5 text-sasso-accent" />
            )}
            <CardTitle className="font-display text-lg">{event.title}</CardTitle>
          </div>
          <Badge variant="outline">{event.tier}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{event.titleArabic}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{event.description}</p>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {event.time}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {event.location}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            {event.registered}/{event.capacity} registered
          </div>
        </div>

        {/* Capacity Bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Registration</span>
            <span>{Math.round((event.registered / event.capacity) * 100)}% full</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full rounded-full transition-all',
                event.registered === event.capacity ? 'bg-primary' : 'bg-primary/70'
              )}
              style={{ width: `${(event.registered / event.capacity) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(event)}>
            View Details
          </Button>
          <Button size="sm" className="flex-1" onClick={() => handleManageGuestList(event)}>
            Manage Guest List
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            Events & Experiences
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Curate exclusive events for RISE members
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Create Event</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="past">Past Events ({pastEvents.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 md:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {upcomingEvents.map((event, index) => renderEventCard(event, index))}
          </div>
          {upcomingEvents.length === 0 && (
            <Card variant="luxury">
              <CardContent className="pt-6 text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming events</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 md:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {pastEvents.map((event, index) => (
              <Card 
                key={event.id}
                variant="luxury"
                className="animate-slide-up overflow-hidden opacity-75"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  'h-2',
                  event.brand === 'noir' ? 'bg-foreground/50' : 'bg-sasso-accent/50'
                )} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {event.brand === 'noir' ? (
                        <Coffee className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <UtensilsCrossed className="h-5 w-5 text-sasso-accent/50" />
                      )}
                      <CardTitle className="font-display text-lg text-muted-foreground">{event.title}</CardTitle>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.registered} attended
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {pastEvents.length === 0 && (
            <Card variant="luxury">
              <CardContent className="pt-6 text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No past events to display</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="mt-4 md:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {draftEvents.map((event, index) => (
              <Card 
                key={event.id}
                variant="luxury"
                className="animate-slide-up overflow-hidden border-dashed"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  'h-2',
                  event.brand === 'noir' ? 'bg-foreground/30' : 'bg-sasso-accent/30'
                )} />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {event.brand === 'noir' ? (
                        <Coffee className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <UtensilsCrossed className="h-5 w-5 text-sasso-accent/50" />
                      )}
                      <CardTitle className="font-display text-lg">{event.title}</CardTitle>
                    </div>
                    <Badge variant="outline">Draft</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(event)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => handlePublishDraft(event.id)}>
                      Publish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {draftEvents.length === 0 && (
            <Card variant="luxury">
              <CardContent className="pt-6 text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No draft events</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Event Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Create New Event</DialogTitle>
            <DialogDescription>
              Create an exclusive experience for RISE members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Event Title *</Label>
                <Input 
                  placeholder="e.g., Coffee Tasting Experience"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Arabic Title</Label>
                <Input 
                  placeholder="العنوان بالعربية"
                  dir="rtl"
                  value={newEvent.titleArabic}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, titleArabic: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input 
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Time *</Label>
                <Input 
                  placeholder="e.g., 7:00 PM"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select 
                  value={newEvent.brand} 
                  onValueChange={(value: 'noir' | 'sasso') => setNewEvent(prev => ({ ...prev, brand: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="noir">NOIR Café</SelectItem>
                    <SelectItem value="sasso">SASSO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select 
                  value={newEvent.country} 
                  onValueChange={(value: 'qatar' | 'riyadh') => setNewEvent(prev => ({ ...prev, country: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qatar">Qatar</SelectItem>
                    <SelectItem value="riyadh">Saudi Arabia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Location *</Label>
                <Input 
                  placeholder="e.g., NOIR Café, The Pearl"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tier Requirement</Label>
                <Select 
                  value={newEvent.tier} 
                  onValueChange={(value) => setNewEvent(prev => ({ ...prev, tier: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Members">All Members</SelectItem>
                    <SelectItem value="Connoisseur+">Connoisseur+</SelectItem>
                    <SelectItem value="Élite+">Élite+</SelectItem>
                    <SelectItem value="Inner Circle+">Inner Circle+</SelectItem>
                    <SelectItem value="RISE Black">RISE Black Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input 
                  type="number"
                  min={1}
                  value={newEvent.capacity}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, capacity: parseInt(e.target.value) || 20 }))}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Describe the event experience..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCreateEvent}>
                Create Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {selectedEvent.brand === 'noir' ? (
                    <Coffee className="h-5 w-5" />
                  ) : (
                    <UtensilsCrossed className="h-5 w-5 text-sasso-accent" />
                  )}
                  <DialogTitle className="font-display">{selectedEvent.title}</DialogTitle>
                </div>
                <DialogDescription>{selectedEvent.titleArabic}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedEvent.date)}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {selectedEvent.time}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {selectedEvent.location}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {selectedEvent.registered}/{selectedEvent.capacity}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedEvent.tier}</Badge>
                  <Badge variant={selectedEvent.status === 'upcoming' ? 'default' : 'secondary'}>
                    {selectedEvent.status}
                  </Badge>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setDetailsOpen(false);
                      handleManageGuestList(selectedEvent);
                    }}
                  >
                    Manage Guest List
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Guest List Dialog */}
      <Dialog open={guestListOpen} onOpenChange={setGuestListOpen}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-lg">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display">Guest List</DialogTitle>
                <DialogDescription>
                  {selectedEvent.title} - {selectedEvent.registered}/{selectedEvent.capacity} registered
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {/* Current Attendees */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Registered Guests</h4>
                  {selectedEvent.attendees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No guests registered yet</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedEvent.attendees.map(guestId => {
                        const guest = mockGuests.find(g => g.id === guestId);
                        if (!guest) return null;
                        return (
                          <div 
                            key={guestId}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                          >
                            <div>
                              <p className="text-sm font-medium">{guest.name}</p>
                              <p className="text-xs text-muted-foreground">{guest.email}</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleRemoveAttendee(guestId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add Guests */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Add Guests</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {mockGuests
                      .filter(g => !selectedEvent.attendees.includes(g.id))
                      .map(guest => (
                        <div 
                          key={guest.id}
                          className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium">{guest.name}</p>
                            <p className="text-xs text-muted-foreground">{guest.tier}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAddAttendee(guest.id)}
                            disabled={selectedEvent.registered >= selectedEvent.capacity}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
