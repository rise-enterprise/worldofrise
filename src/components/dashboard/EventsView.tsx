import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Clock, Plus, Coffee, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  status: 'upcoming' | 'ongoing' | 'completed';
}

const mockEvents: Event[] = [
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
  },
];

export function EventsView() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
    }).format(date);
  };

  const upcomingEvents = mockEvents.filter(e => e.status === 'upcoming');

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Events & Experiences
          </h2>
          <p className="text-muted-foreground mt-1">
            Curate exclusive events for RISE members
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcomingEvents.map((event, index) => (
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
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="flex-1">
                      Manage Guest List
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <Card variant="luxury">
            <CardContent className="pt-6 text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No past events to display</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          <Card variant="luxury">
            <CardContent className="pt-6 text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No draft events</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
