import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CrystalPageWrapper } from '@/components/effects/CrystalPageWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, MapPin, Clock, Users, Coffee, UtensilsCrossed, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useMemberEvents, MemberEvent } from '@/hooks/useExperiences';

export default function MemberEvents() {
  const navigate = useNavigate();
  const { data: dbEvents = [], isLoading } = useMemberEvents();
  const [events, setEvents] = useState<MemberEvent[]>([]);

  // Sync database events with local state for registration tracking
  useEffect(() => {
    if (dbEvents.length > 0) {
      setEvents(dbEvents);
    }
  }, [dbEvents]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
    }).format(date);
  };

  const handleRegister = (eventId: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        if (event.isRegistered) {
          toast.info('Registration cancelled');
          return { ...event, isRegistered: false, registered: event.registered - 1 };
        } else {
          if (event.registered >= event.capacity) {
            toast.error('This event is fully booked');
            return event;
          }
          toast.success('Successfully registered!');
          return { ...event, isRegistered: true, registered: event.registered + 1 };
        }
      }
      return event;
    }));
  };

  const registeredEvents = events.filter(e => e.isRegistered);
  const availableEvents = events.filter(e => !e.isRegistered);

  if (isLoading) {
    return (
      <CrystalPageWrapper variant="subtle" sparkleCount={15}>
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-primary/10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-6 w-24" />
            <div className="w-16" />
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </CrystalPageWrapper>
    );
  }

  return (
    <CrystalPageWrapper variant="subtle" sparkleCount={15}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-primary/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/member')}
            className="text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="font-display text-lg font-semibold text-foreground tracking-crystal">Events</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Registered Events */}
        {registeredEvents.length > 0 && (
          <div className="animate-fade-in">
            <h2 className="font-display text-lg font-medium text-foreground mb-4 flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              Your Registrations
            </h2>
            <div className="space-y-4">
              {registeredEvents.map((event) => (
                <Card 
                  key={event.id}
                  className="crystal-panel-gold overflow-hidden"
                >
                  <div className={cn(
                    'h-1',
                    event.brand === 'noir' ? 'bg-foreground' : 'bg-primary'
                  )} />
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border',
                        event.brand === 'noir' 
                          ? 'bg-foreground/10 border-foreground/20' 
                          : 'bg-primary/10 border-primary/20'
                      )}>
                        {event.brand === 'noir' ? (
                          <Coffee className="h-6 w-6 text-foreground" />
                        ) : (
                          <UtensilsCrossed className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{event.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                        <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-primary" />
                            {formatDate(event.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary" />
                            {event.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-primary" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4 border-primary/30"
                      onClick={() => handleRegister(event.id)}
                    >
                      Cancel Registration
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Events */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="font-display text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Events
          </h2>
          {availableEvents.length === 0 && events.length === 0 && (
            <Card className="crystal-panel">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-primary/40 mb-4" />
                <p className="text-muted-foreground">No upcoming events at the moment</p>
              </CardContent>
            </Card>
          )}
          <div className="space-y-4">
            {availableEvents.map((event, index) => (
              <Card 
                key={event.id}
                className="crystal-panel overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  'h-1',
                  event.brand === 'noir' ? 'bg-foreground' : 'bg-primary'
                )} />
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border',
                      event.brand === 'noir' 
                        ? 'bg-foreground/10 border-foreground/20' 
                        : 'bg-primary/10 border-primary/20'
                    )}>
                      {event.brand === 'noir' ? (
                        <Coffee className="h-6 w-6 text-foreground" />
                      ) : (
                        <UtensilsCrossed className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-foreground">{event.title}</h3>
                        <Badge variant="outline" className="text-xs shrink-0 border-primary/30">{event.tier}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-primary" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-primary" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-primary" />
                          {event.registered}/{event.capacity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="vip-gold" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => handleRegister(event.id)}
                    disabled={event.registered >= event.capacity}
                  >
                    {event.registered >= event.capacity ? 'Fully Booked' : 'Register Now'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </CrystalPageWrapper>
  );
}
