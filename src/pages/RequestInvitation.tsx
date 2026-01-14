import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { CrystalPageWrapper } from '@/components/effects/CrystalPageWrapper';
import { Button } from '@/components/ui/button';
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
    fullName: '',
    email: '',
    phone: '',
    preferredBrand: '' as 'noir' | 'sasso' | 'both' | '',
    referralSource: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email) {
      toast.error('Please provide your name and email');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('invitation_requests')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          preferred_brand: formData.preferredBrand || null,
          referral_source: formData.referralSource || null,
          message: formData.message || null
        });

      if (error) throw error;
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting invitation request:', error);
      toast.error('Unable to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <CrystalPageWrapper variant="tiffany" sparkleCount={25}>
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center max-w-md"
          >
            <div className="w-16 h-16 mx-auto mb-8 rounded-full border-2 border-primary/30 flex items-center justify-center">
              <Check className="w-8 h-8 text-primary" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-display tracking-crystal text-foreground mb-4">
              Request Received
            </h1>
            
            <p className="text-muted-foreground/80 mb-8 leading-relaxed">
              Your request for invitation has been noted. We review each application with care. 
              If approved, you will receive an invitation to join our circle.
            </p>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground/60 hover:text-primary"
            >
              Return to Gate
            </Button>
          </motion.div>
        </div>
      </CrystalPageWrapper>
    );
  }

  return (
    <CrystalPageWrapper variant="tiffany" sparkleCount={20}>
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 z-20 flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-primary transition-colors duration-300"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="tracking-wider">Back</span>
      </motion.button>

      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-primary/40" />
              <span className="text-primary/60 text-xs tracking-[0.3em] uppercase">
                RISE
              </span>
              <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-primary/40" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-display tracking-crystal text-foreground mb-3">
              Request an Invitation
            </h1>
            
            <p className="text-sm text-muted-foreground/60 leading-relaxed">
              Membership is by invitation. Share your interest below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-muted-foreground/80 text-sm tracking-wide">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-2 bg-background/50 border-primary/20 focus:border-primary/50 text-foreground"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-muted-foreground/80 text-sm tracking-wide">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2 bg-background/50 border-primary/20 focus:border-primary/50 text-foreground"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-muted-foreground/80 text-sm tracking-wide">
                  Phone <span className="text-muted-foreground/40">(optional)</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-2 bg-background/50 border-primary/20 focus:border-primary/50 text-foreground"
                  placeholder="+974 XXXX XXXX"
                />
              </div>

              <div>
                <Label className="text-muted-foreground/80 text-sm tracking-wide mb-3 block">
                  Preferred Experience
                </Label>
                <div className="flex gap-3">
                  {(['noir', 'sasso', 'both'] as const).map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setFormData({ ...formData, preferredBrand: brand })}
                      className={`
                        flex-1 py-3 px-4 text-xs tracking-wider uppercase
                        border rounded-lg transition-all duration-300
                        ${formData.preferredBrand === brand
                          ? 'bg-primary/10 border-primary/40 text-foreground'
                          : 'bg-background/30 border-primary/10 text-muted-foreground/60 hover:border-primary/20'
                        }
                      `}
                    >
                      {brand === 'both' ? 'Both' : brand}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="referral" className="text-muted-foreground/80 text-sm tracking-wide">
                  How did you hear about us? <span className="text-muted-foreground/40">(optional)</span>
                </Label>
                <Input
                  id="referral"
                  value={formData.referralSource}
                  onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                  className="mt-2 bg-background/50 border-primary/20 focus:border-primary/50 text-foreground"
                  placeholder="A friend, social media, visit..."
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-muted-foreground/80 text-sm tracking-wide">
                  Message <span className="text-muted-foreground/40">(optional)</span>
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="mt-2 bg-background/50 border-primary/20 focus:border-primary/50 text-foreground min-h-[100px] resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="vip-gold"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground/40 text-center mt-8 leading-relaxed">
            By submitting, you agree to our privacy practices. 
            All information is kept strictly confidential.
          </p>
        </motion.div>
      </div>
    </CrystalPageWrapper>
  );
}
