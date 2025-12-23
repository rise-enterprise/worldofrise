import React, { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkAdminsExist: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAdminAuth();

  return (
    <AdminAuthContext.Provider value={auth}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuthContext = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuthContext must be used within an AdminAuthProvider');
  }
  return context;
};
