import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AdminInfo {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'viewer';
}

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  admin: AdminInfo | null;
  isLoading: boolean;
  isAdmin: boolean;
  sendMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const defaultContext: AdminAuthContextType = {
  user: null,
  session: null,
  admin: null,
  isLoading: true,
  isAdmin: false,
  sendMagicLink: async () => ({ error: new Error('Not initialized') }),
  signOut: async () => {},
};

const AdminAuthContext = createContext<AdminAuthContextType>(defaultContext);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminInfo = useCallback(async () => {
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
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

  const value: AdminAuthContextType = {
    user,
    session,
    admin,
    isLoading,
    isAdmin: !!admin,
    sendMagicLink,
    signOut,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuthContext = (): AdminAuthContextType => {
  return useContext(AdminAuthContext);
};
