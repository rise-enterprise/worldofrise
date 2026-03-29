import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  useEffect(() => {
    if (dbEvents.length > 0) setEvents(dbEvents);
  }, [dbEvents]);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);

  const handleRegister = (eventId: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id !== eventId) return event;
      if (event.isRegistered) {
        toast.info('Registration cancelled');
        return { ...event, isRegistered: false, registered: event.registered - 1 };
      }
      if (event.registered >= event.capacity) {
        toast.error('Fully booked');
        return event;
      }
      toast.success('Successfully registered!');
      return { ...event, isRegistered: true, registered: event.registered + 1 };
    }));
  };

  const registeredEvents = events.filter(e => e.isRegistered);
  const availableEvents = events.filter(e => !e.isRegistered);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  const EventCard = ({ event, registered = false }: { event: MemberEvent; registered?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border backdrop-blur-sm overflow-hidden transition-all duration-200',
        registered ? 'bg-card/60 border-primary/20' : 'bg-card/40 border-border/15 hover:border-primary/15'
      )}
    >
      <div className={cn('h-0.5', event.brand === 'noir' ? 'bg-foreground/40' : 'bg-primary/60')} />
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border',
            event.brand === 'noir' ? 'bg-foreground/5 border-foreground/10' : 'bg-primary/5 border-primary/10'
          )}>
            {event.brand === 'noir' ? <Coffee className="h-5 w-5 text-foreground/70" /> : <UtensilsCrossed className="h-5 w-5 text-primary/70" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-base text-foreground tracking-crystal">{event.title}</h3>
              {!registered && <Badge variant="outline" className="text-[10px] shrink-0 border-border/20 text-muted-foreground">{event.tier}</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-primary/60" />{formatDate(event.date)}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-primary/60" />{event.time}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary/60" />{event.location}</span>
              {!registered && <span className="flex items-center gap-1"><Users className="h-3 w-3 text-primary/60" />{event.registered}/{event.capacity}</span>}
            </div>
          </div>
        </div>
        <button onClick={() => handleRegister(event.id)}
          disabled={!registered && event.registered >= event.capacity}
          className={cn(
            'w-full mt-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px]',
            registered
              ? 'bg-card border border-border/20 text-muted-foreground hover:text-foreground hover:border-border/40'
              : event.registered >= event.capacity
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'text-primary-foreground'
          )}
          style={!registered && event.registered < event.capacity
            ? { background: 'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-shadow)))' }
            : undefined}
        >
          {registered ? 'Cancel Registration' : event.registered >= event.capacity ? 'Fully Booked' : 'Register Now'}
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/15">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/member')} className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <h1 className="font-display text-lg font-medium text-foreground tracking-crystal">Events</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {registeredEvents.length > 0 && (
          <div>
            <h2 className="font-display text-base font-medium text-foreground mb-4 flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />Your Registrations
            </h2>
            <div className="space-y-3">{registeredEvents.map(e => <EventCard key={e.id} event={e} registered />)}</div>
          </div>
        )}

        <div>
          <h2 className="font-display text-base font-medium text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />Upcoming Events
          </h2>
          {availableEvents.length === 0 && events.length === 0 && (
            <div className="rounded-xl border border-border/15 bg-card/40 p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-primary/20 mb-4" />
              <p className="text-muted-foreground">No upcoming events</p>
            </div>
          )}
          <div className="space-y-3">{availableEvents.map(e => <EventCard key={e.id} event={e} />)}</div>
        </div>
      </div>
    </div>
  );
}
