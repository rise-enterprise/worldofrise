import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn, ArrowLeft, BrainCircuit, Crown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

type RoleChoice = { isAdmin: boolean; isMember: boolean };

export default function UnifiedLoginForm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roleChoice, setRoleChoice] = useState<RoleChoice | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
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

      if (!data.user) {
        setIsLoading(false);
        return;
      }

      // Check both roles in parallel
      const [adminResult, memberResult] = await Promise.all([
        supabase.rpc("check_admin_email", { admin_email: data.user.email ?? "" }),
        supabase.from("member_auth").select("id").eq("user_id", data.user.id).maybeSingle(),
      ]);

      const isAdmin = !!adminResult.data;
      const isMember = !!memberResult.data;

      if (isAdmin && isMember) {
        // Dual role - show choice
        setRoleChoice({ isAdmin, isMember });
        setIsLoading(false);
        return;
      }

      if (isAdmin) {
        navigate("/admin");
        return;
      }

      if (isMember) {
        navigate("/member/welcome");
        return;
      }

      // Not admin or member
      await supabase.auth.signOut();
      toast({
        title: "Access Denied",
        description: "This account does not have access. Please request an invitation.",
        variant: "destructive",
      });
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Dual-role selection screen
  if (roleChoice) {
    return (
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="relative p-8 md:p-10"
          style={{
            background: "linear-gradient(135deg, hsl(var(--noir-obsidian)) 0%, hsl(220 25% 9%) 100%)",
            border: "1px solid hsl(var(--gold) / 0.25)",
            boxShadow: "0 0 60px hsl(var(--gold) / 0.08), inset 0 1px 0 hsl(var(--gold) / 0.15)",
          }}
        >
          <div className="relative z-10 text-center">
            <h2
              className="text-lg tracking-[0.15em] uppercase font-light mb-2"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Welcome Back
            </h2>
            <p
              className="text-xs tracking-wide mb-8"
              style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}
            >
              Choose your destination
            </p>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full py-6 gap-3 text-base tracking-refined border-primary/30 hover:border-primary/60 hover:bg-primary/5"
                onClick={() => navigate("/admin")}
              >
                <BrainCircuit className="w-5 h-5 text-primary" />
                RISE AI Panel
              </Button>
              <Button
                variant="vip-gold"
                className="w-full py-6 gap-3 text-base tracking-refined"
                onClick={() => navigate("/member/welcome")}
              >
                <Crown className="w-5 h-5" />
                Member Salon
              </Button>
            </div>

            <button
              onClick={() => { setRoleChoice(null); }}
              className="mt-6 text-xs tracking-widest uppercase transition-colors duration-300"
              style={{ color: "hsl(var(--gold) / 0.5)" }}
            >
              Back
            </button>
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-10 h-[1px]" style={{ background: "hsl(var(--gold) / 0.4)" }} />
          <div className="absolute top-0 left-0 w-[1px] h-10" style={{ background: "hsl(var(--gold) / 0.4)" }} />
          <div className="absolute bottom-0 right-0 w-10 h-[1px]" style={{ background: "hsl(var(--gold) / 0.4)" }} />
          <div className="absolute bottom-0 right-0 w-[1px] h-10" style={{ background: "hsl(var(--gold) / 0.4)" }} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="relative p-8 md:p-10"
        style={{
          background: "linear-gradient(135deg, hsl(var(--noir-obsidian)) 0%, hsl(220 25% 9%) 100%)",
          border: "1px solid hsl(var(--gold) / 0.25)",
          boxShadow: "0 0 60px hsl(var(--gold) / 0.08), inset 0 1px 0 hsl(var(--gold) / 0.15)",
        }}
      >
        {/* Crystal facet overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `
              linear-gradient(135deg, transparent 40%, hsl(var(--gold) / 0.15) 50%, transparent 60%),
              linear-gradient(225deg, transparent 40%, hsl(var(--gold) / 0.1) 50%, transparent 60%)
            `,
          }}
        />

        <div className="relative z-10">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs tracking-widest uppercase mb-6 transition-colors duration-300"
            style={{ color: "hsl(var(--gold) / 0.6)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          {/* Title */}
          <div className="text-center mb-8">
            <h2
              className="text-lg tracking-[0.15em] uppercase font-light mb-2"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Sign In
            </h2>
            <p
              className="text-xs tracking-wide"
              style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}
            >
              Access your exclusive portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="login-email"
                className="text-xs tracking-wider uppercase"
                style={{ color: "hsl(var(--muted-foreground) / 0.8)" }}
              >
                Email
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="login-password"
                className="text-xs tracking-wider uppercase"
                style={{ color: "hsl(var(--muted-foreground) / 0.8)" }}
              >
                Password
              </Label>
              <Input
                id="login-password"
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
              className="w-full mt-2"
              disabled={isLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              Enter
            </Button>
          </form>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-10 h-[1px]" style={{ background: "hsl(var(--gold) / 0.4)" }} />
        <div className="absolute top-0 left-0 w-[1px] h-10" style={{ background: "hsl(var(--gold) / 0.4)" }} />
        <div className="absolute bottom-0 right-0 w-10 h-[1px]" style={{ background: "hsl(var(--gold) / 0.4)" }} />
        <div className="absolute bottom-0 right-0 w-[1px] h-10" style={{ background: "hsl(var(--gold) / 0.4)" }} />
      </div>
    </motion.div>
  );
}
