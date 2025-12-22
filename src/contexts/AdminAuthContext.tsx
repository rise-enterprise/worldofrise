import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Admin, AdminRole, AuditAction } from '@/types/admin';
import { logger } from '@/lib/logger';
interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  verify2FA: (code: string) => Promise<{ error: Error | null }>;
  hasPermission: (action: string) => boolean;
  logAudit: (action: AuditAction, entityType: string, entityId?: string, before?: unknown, after?: unknown) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer admin profile fetch
        if (session?.user) {
          setTimeout(() => {
            fetchAdminProfile(session.user.id);
          }, 0);
        } else {
          setAdmin(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAdminProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAdminProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching admin profile:', error);
        setAdmin(null);
      } else {
        setAdmin(data as Admin | null);
      }
    } catch (err) {
      logger.error('Error fetching admin profile:', err);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/admin`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Create admin record after signup
      if (data.user) {
        const { error: adminError } = await supabase
          .from('admins')
          .insert({
            user_id: data.user.id,
            email,
            name,
            role: 'viewer', // Default role, super_admin must upgrade
          });

        if (adminError) {
          logger.error('Error creating admin record:', adminError);
          return { error: adminError };
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    // Log logout action
    if (admin) {
      await logAudit('logout', 'session');
    }
    
    await supabase.auth.signOut();
    setAdmin(null);
  };

  const verify2FA = async (code: string) => {
    // TODO: Implement TOTP verification
    // For now, return success
    return { error: null };
  };

  const hasPermission = (action: string): boolean => {
    if (!admin) return false;
    
    const role = admin.role as AdminRole;
    const permissions: Record<AdminRole, string[]> = {
      super_admin: ['*'],
      admin: ['members', 'visits', 'points', 'rewards', 'redemptions', 'campaigns', 'tiers', 'export', 'import'],
      manager: ['members', 'visits', 'redemptions', 'export'],
      viewer: ['view'],
    };

    const perms = permissions[role];
    return perms.includes('*') || perms.includes(action);
  };

  const logAudit = async (
    action: AuditAction,
    entityType: string,
    entityId?: string,
    before?: unknown,
    after?: unknown
  ) => {
    if (!admin) return;

    try {
      await supabase.from('audit_logs').insert([{
        admin_id: admin.id,
        action_type: action,
        entity_type: entityType,
        entity_id: entityId,
        before_json: before ? JSON.parse(JSON.stringify(before)) : null,
        after_json: after ? JSON.parse(JSON.stringify(after)) : null,
        user_agent: navigator.userAgent,
      }]);
    } catch (err) {
      logger.error('Failed to log audit:', err);
    }
  };

  const value: AdminAuthContextType = {
    user,
    session,
    admin,
    isLoading,
    isAuthenticated: !!user && !!admin,
    signIn,
    signUp,
    signOut,
    verify2FA,
    hasPermission,
    logAudit,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
