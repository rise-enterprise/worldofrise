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
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkAdminsExist: () => Promise<boolean>;
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

  const checkAdminsExist = async (): Promise<boolean> => {
    const { count, error } = await supabase
      .from('admins')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error checking admins:', error);
      return true; // Assume admins exist on error for security
    }
    
    return (count ?? 0) > 0;
  };

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

  const signUp = async (email: string, password: string, name: string): Promise<{ error: Error | null }> => {
    // First check if any admins exist - only allow signup if none exist
    const adminsExist = await checkAdminsExist();
    if (adminsExist) {
      return { error: new Error('Admin accounts already exist. Please contact an existing admin.') };
    }

    // Create the auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      return { error };
    }

    if (!data.user) {
      return { error: new Error('Failed to create user account.') };
    }

    // Insert into admins table with super_admin role
    const { error: adminError } = await supabase
      .from('admins')
      .insert({
        user_id: data.user.id,
        email: email,
        name: name,
        role: 'super_admin',
        is_active: true,
      });

    if (adminError) {
      // If admin insert fails, we should still have the auth user
      // They can be manually added to admins table later
      console.error('Error creating admin record:', adminError);
      return { error: new Error('Account created but failed to set admin role. Please contact support.') };
    }

    // Fetch the admin info
    await fetchAdminInfo(data.user.id);

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
    signUp,
    signOut,
    checkAdminsExist,
  };
};
