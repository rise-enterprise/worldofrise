import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2 } from "lucide-react";
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
      const { data: isAdmin, error: checkError } = await supabase.rpc(
        "check_admin_email",
        { admin_email: email.trim() }
      );

      if (checkError || !isAdmin) {
        toast({ title: "Access Denied", description: "This email is not registered as an admin.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

      if (error) {
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
        setIsLoading(false);
        return;
      }

      navigate("/admin");
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 50% 30% at 50% 20%, hsl(var(--neon-purple) / 0.04) 0%, transparent 60%),
          radial-gradient(ellipse 30% 25% at 70% 70%, hsl(var(--gold) / 0.03) 0%, transparent 50%)
        `,
      }} />
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.01]" style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.3) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--foreground) / 0.3) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="relative p-8 md:p-10 rounded-2xl border border-border/15 bg-card/30 backdrop-blur-xl"
          style={{ boxShadow: "0 16px 64px -16px rgba(0,0,0,0.4)" }}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-neon-purple/20 to-transparent" />

          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 flex items-center justify-center mb-5">
              <img src={riseLogo} alt="Rise Holding" className="w-full h-full object-contain opacity-80" />
            </div>
            <h1 className="text-lg font-display tracking-[0.15em] uppercase text-foreground mb-1">
              RISE AI Panel
            </h1>
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/40">
              Administrative Access
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50">Email</Label>
              <Input
                type="email"
                placeholder="admin@rise.qa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading}
                className="bg-background/50 border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/50">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
                className="bg-background/50 border-border/20"
              />
            </div>
            <Button type="submit" className="w-full mt-3" size="lg" disabled={isLoading || !email.trim() || !password.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogIn className="w-4 h-4 mr-2" />}
              Sign In
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
