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
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export const useAdminAuth = (): UseAdminAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminInfo = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('admins')
      .select('id, name, email, role')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      setAdmin(null);
      return null;
    }

    const adminInfo: AdminInfo = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
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
            fetchAdminInfo(session.user.id);
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
        fetchAdminInfo(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchAdminInfo]);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    if (data.user) {
      const adminInfo = await fetchAdminInfo(data.user.id);
      if (!adminInfo) {
        await supabase.auth.signOut();
        return { error: new Error('You do not have admin access. Please contact your administrator.') };
      }
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
    signIn,
    signOut,
  };
};
