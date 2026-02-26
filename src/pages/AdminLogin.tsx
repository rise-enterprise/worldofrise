import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CrystalPageWrapper } from "@/components/effects/CrystalPageWrapper";
import { BrainCircuit, LogIn, Loader2 } from "lucide-react";
import riseLogo from "@/assets/rise-holding-logo.png";
import { toast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    try {
      // Verify this email is an admin before attempting login
      const { data: isAdmin, error: checkError } = await supabase.rpc(
        "check_admin_email",
        { admin_email: email.trim() }
      );

      if (checkError || !isAdmin) {
        toast({
          title: "Access Denied",
          description: "This email is not registered as an admin.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      navigate("/admin");
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <CrystalPageWrapper variant="ambient" showSparkles={false} className="min-h-screen">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-card/80 backdrop-blur-md border-border/40">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-20 h-20 flex items-center justify-center">
              <img src={riseLogo} alt="Rise Holding" className="w-full h-full object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              RISE AI Panel
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@rise.qa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email.trim() || !password.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </CrystalPageWrapper>
  );
}
