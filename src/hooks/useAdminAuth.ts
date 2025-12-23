import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'viewer';
}

interface UseAdminAuthReturn {
  user: User | null;
  session: Session | null;
  admin: AdminInfo | null;
  isLoading: boolean;
  isAdmin: boolean;
  sendMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminInfo = useCallback(async () => {
    // Use RPC function to bypass RLS and fetch admin info for authenticated user
    const { data, error } = await supabase.rpc('get_my_admin_info');

    if (error || !data || data.length === 0) {
      setAdmin(null);
      return null;
    }

    const adminData = data[0];
    const adminInfo: AdminInfo = {
      id: adminData.id,
      name: adminData.name,
      email: adminData.email,
      role: adminData.role as 'super_admin' | 'admin' | 'manager' | 'viewer',
    };
    setAdmin(adminInfo);
    return adminInfo;
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer admin fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchAdminInfo();
          }, 0);
        } else {
          setAdmin(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchAdminInfo().finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchAdminInfo]);

  const sendMagicLink = async (email: string): Promise<{ error: Error | null }> => {
    // First check if the email belongs to an active admin using RPC (bypasses RLS)
    const { data: isAdmin, error: checkError } = await supabase
      .rpc('check_admin_email', { admin_email: email });

    if (checkError || !isAdmin) {
      return { error: new Error('This email is not registered as an admin. Please contact your administrator.') };
    }

    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      return { error };
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAdmin(null);
  };

  return {
    user,
    session,
    admin,
    isLoading,
    isAdmin: !!admin,
    sendMagicLink,
    signOut,
  };
};
