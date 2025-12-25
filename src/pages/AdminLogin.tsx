import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Sparkles, CheckCircle2, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuthContext } from '@/contexts/AdminAuthContext';
import { supabase } from '@/integrations/supabase/client';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const AdminLogin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendMagicLink, isAdmin, isLoading } = useAdminAuthContext();

  const handleForgotPassword = async () => {
    const email = passwordForm.getValues('email');
    if (!email || !z.string().email().safeParse(email).success) {
      toast({
        title: 'Enter your email first',
        description: 'Please enter a valid email address in the email field.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    // Check if email belongs to an active admin using RPC (bypasses RLS)
    const { data: isAdmin } = await supabase
      .rpc('check_admin_email', { admin_email: email });

    if (!isAdmin) {
      toast({
        title: 'Email not found',
        description: 'This email is not registered as an active admin.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (error) {
      toast({
        title: 'Failed to send reset email',
        description: error.message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    setSentEmail(email);
    setResetEmailSent(true);
    toast({
      title: 'Password reset email sent!',
      description: 'Check your email for the reset link.',
    });
    setIsSubmitting(false);
  };

  const magicLinkForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (!isLoading && isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, isLoading, navigate]);

  const onMagicLinkSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    
    const { error } = await sendMagicLink(data.email);
    
    if (error) {
      toast({
        title: 'Failed to send magic link',
        description: error.message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    setSentEmail(data.email);
    setMagicLinkSent(true);
    toast({
      title: 'Magic link sent!',
      description: 'Check your email for the login link.',
    });
    setIsSubmitting(false);
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true);
    
    // First check if email belongs to an active admin using RPC (bypasses RLS)
    const { data: isAdmin, error: adminError } = await supabase
      .rpc('check_admin_email', { admin_email: data.email });

    if (adminError || !isAdmin) {
      toast({
        title: 'Access denied',
        description: 'This email is not registered as an active admin.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    // Sign in with password
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      title: 'Login successful',
      description: 'Redirecting to dashboard...',
    });
    setIsSubmitting(false);
  };

  const handleResend = async () => {
    setIsSubmitting(true);
    const { error } = await sendMagicLink(sentEmail);
    
    if (error) {
      toast({
        title: 'Failed to resend',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Magic link resent!',
        description: 'Check your email for the new login link.',
      });
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <Card className="w-full max-w-md shadow-xl border-border/50">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription className="text-base">
              We sent a magic link to <span className="font-medium text-foreground">{sentEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Click the link in the email to sign in. The link will expire in 1 hour.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                onClick={handleResend}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend magic link'
                )}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setMagicLinkSent(false);
                  magicLinkForm.reset();
                }}
                className="w-full"
              >
                Use a different email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <Card className="w-full max-w-md shadow-xl border-border/50">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
            <CardDescription className="text-base">
              We sent a password reset link to <span className="font-medium text-foreground">{sentEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Click the link in the email to set your password.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setResetEmailSent(false);
                  passwordForm.reset();
                }}
                className="w-full"
              >
                Back to login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
            </TabsList>
            
            <TabsContent value="password">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="admin@example.com" 
                              className="pl-10"
                              type="email"
                              autoComplete="email"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Enter your password" 
                              className="pl-10"
                              type="password"
                              autoComplete="current-password"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Sign In
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button"
                    variant="link" 
                    className="w-full text-sm" 
                    onClick={handleForgotPassword}
                    disabled={isSubmitting}
                  >
                    Forgot password?
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => navigate('/')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="magic-link">
              <Form {...magicLinkForm}>
                <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-4">
                  <FormField
                    control={magicLinkForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="admin@example.com" 
                              className="pl-10"
                              type="email"
                              autoComplete="email"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending magic link...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Magic Link
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => navigate('/')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
