import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMemberAuth } from '@/contexts/MemberAuthContext';
import { ArrowLeft, Phone, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MemberLogin() {
  const navigate = useNavigate();
  const { signInWithOtp, verifyOtp } = useMemberAuth();
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setIsLoading(true);
    const { error } = await signInWithOtp(phone);
    setIsLoading(false);

    if (error) {
      toast.error(error.message || 'Failed to send verification code');
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
      toast.success('Welcome back!');
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
            <h1 className="font-display text-3xl font-semibold text-gradient-gold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to access your RISE membership</p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
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
                  Enter the phone number linked to your membership
                </p>
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
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
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
                    'Verify & Sign In'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setStep('phone')}
                >
                  Use Different Number
                </Button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Not a member yet?{' '}
              <Link to="/join" className="text-primary hover:underline">
                Join RISE
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}