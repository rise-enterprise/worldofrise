import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center max-w-2xl">
        <h2 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-6">
          Ready to Begin <br />
          <span className="text-gradient-gold">Your Journey?</span>
        </h2>
        <p className="text-lg text-muted-foreground mb-10">
          Join RISE today and start earning recognition from your very first visit. 
          Your story with us begins here.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="luxury" 
            size="xl"
            onClick={() => navigate('/join')}
            className="gap-3"
          >
            Join the Program
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="xl"
            onClick={() => navigate('/login')}
          >
            Already a Member?
          </Button>
        </div>
      </div>
    </section>
  );
}