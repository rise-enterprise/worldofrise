import React, { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useMemberAuth } from '@/hooks/useMemberAuth';

interface MemberInfo {
  id: string;
  memberId: string | null;
  phone: string;
}

interface MemberAuthContextType {
  user: User | null;
  session: Session | null;
  member: MemberInfo | null;
  isLoading: boolean;
  isMember: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, phone: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const MemberAuthContext = createContext<MemberAuthContextType | undefined>(undefined);

export const MemberAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useMemberAuth();

  return (
    <MemberAuthContext.Provider value={auth}>
      {children}
    </MemberAuthContext.Provider>
  );
};

export const useMemberAuthContext = (): MemberAuthContextType => {
  const context = useContext(MemberAuthContext);
  if (context === undefined) {
    throw new Error('useMemberAuthContext must be used within a MemberAuthProvider');
  }
  return context;
};
