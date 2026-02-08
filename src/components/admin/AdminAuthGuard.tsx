import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
}

export default function AdminAuthGuard({ children }: Props) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus("unauthorized");
        return;
      }

      const { data, error } = await supabase.rpc("check_admin_email", {
        admin_email: session.user.email ?? "",
      });

      if (error || !data) {
        setStatus("unauthorized");
      } else {
        setStatus("authorized");
      }
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setStatus("unauthorized");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (status === "unauthorized") {
      navigate("/admin/login", { replace: true });
    }
  }, [status, navigate]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "authorized") {
    return <>{children}</>;
  }

  return null;
}
