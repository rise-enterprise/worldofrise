import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMemberAuth } from '@/contexts/MemberAuthContext';
import { ArrowLeft, User, Phone, Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MemberJoin() {
  const navigate = useNavigate();
  const { registerMember, verifyOtp } = useMemberAuth();
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    const { error } = await registerMember(name, phone, email || undefined);
    setIsLoading(false);

    if (error) {
      toast.error(error.message || 'Failed to register');
    } else {
      toast.success('Verification code sent');
      setStep('verify');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    const { error } = await verifyOtp(phone, otp);
    setIsLoading(false);

    if (error) {
      toast.error(error.message || 'Invalid verification code');
    } else {
      toast.success('Welcome to RISE!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-luxury flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-luxury">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-semibold text-gradient-gold mb-2">Join RISE</h1>
            <p className="text-muted-foreground">Begin your journey of distinction</p>
          </div>

          {step === 'details' ? (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+974 5555 1234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    autoComplete="tel"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You'll receive a verification code via SMS
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="luxury" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Registering...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10 text-center tracking-widest"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Code sent to {phone}
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  variant="luxury" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Join'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setStep('details')}
                >
                  Go Back
                </Button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Already a member?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}