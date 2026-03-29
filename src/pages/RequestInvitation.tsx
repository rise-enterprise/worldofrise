import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import PublicLayout from '@/components/public/PublicLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function RequestInvitation() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '',
    preferredBrand: '' as 'noir' | 'sasso' | 'both' | '',
    referralSource: '', message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) {
      toast.error('Please provide your name and email');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data: insertedRequest, error } = await supabase
        .from('invitation_requests')
        .insert({
          full_name: formData.fullName, email: formData.email,
          phone: formData.phone || null, preferred_brand: formData.preferredBrand || null,
          referral_source: formData.referralSource || null, message: formData.message || null
        })
        .select('id').single();

      if (error) throw error;

      await supabase.functions.invoke('notify-invitation-request', {
        body: {
          requestId: insertedRequest.id, fullName: formData.fullName,
          email: formData.email, phone: formData.phone || undefined,
          preferredBrand: formData.preferredBrand || undefined,
          referralSource: formData.referralSource || undefined,
          message: formData.message || undefined
        }
      });
      setIsSubmitted(true);
    } catch {
      toast.error('Unable to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <PublicLayout showFooter={false}>
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="text-center max-w-md">
            <div className="w-14 h-14 mx-auto mb-8 rounded-full border border-border flex items-center justify-center">
              <Check className="w-6 h-6 text-foreground" />
            </div>
            <h1 className="text-2xl font-display font-light text-foreground mb-4">Request Received</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
              We review each application with care. If approved, you will receive an invitation to join.
            </p>
            <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
              Return Home
            </button>
          </motion.div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout showFooter={false}>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          <div className="text-center mb-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-4">Membership</p>
            <h1 className="text-2xl md:text-3xl font-display font-light text-foreground mb-3">Request an Invitation</h1>
            <p className="text-sm text-muted-foreground">Membership is by invitation. Share your interest below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Your name" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" required />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Phone <span className="text-muted-foreground/50">(optional)</span></Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+974 XXXX XXXX" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground mb-3 block">Preferred Experience</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['noir', 'sasso', 'both'] as const).map((brand) => (
                  <button key={brand} type="button"
                    onClick={() => setFormData({ ...formData, preferredBrand: brand })}
                    className={`py-3 text-xs tracking-[0.1em] uppercase rounded-md border transition-all duration-300 ${
                      formData.preferredBrand === brand
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-transparent border-border text-muted-foreground hover:border-foreground/30'
                    }`}>
                    {brand === 'both' ? 'Both' : brand}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">How did you hear about us? <span className="text-muted-foreground/50">(optional)</span></Label>
              <Input value={formData.referralSource} onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })} placeholder="A friend, social media, visit..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Message <span className="text-muted-foreground/50">(optional)</span></Label>
              <Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="min-h-[100px] resize-none" placeholder="Tell us about yourself..." />
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full py-3.5 text-[11px] tracking-[0.15em] uppercase font-body bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors duration-300 disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
          <p className="text-xs text-muted-foreground/50 text-center mt-8">
            All information is kept strictly confidential.
          </p>
        </motion.div>
      </div>
    </PublicLayout>
  );
}