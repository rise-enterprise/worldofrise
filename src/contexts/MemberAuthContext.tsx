import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface MemberData {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  total_visits: number;
  total_points: number;
  city: string;
  status: string;
}

interface TierData {
  id: string;
  name: string;
  name_ar: string | null;
  color: string | null;
  min_visits: number;
  benefits_text_en: string | null;
}

interface MemberAuthContextType {
  user: User | null;
  session: Session | null;
  member: MemberData | null;
  tier: TierData | null;
  isLoading: boolean;
  signInWithOtp: (phone: string) => Promise<{ error: Error | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  registerMember: (name: string, phone: string, email?: string) => Promise<{ error: Error | null }>;
}

const MemberAuthContext = createContext<MemberAuthContextType | undefined>(undefined);

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<MemberData | null>(null);
  const [tier, setTier] = useState<TierData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMemberData = async (userId: string) => {
    try {
      // Get member_auth record
      const { data: authData, error: authError } = await supabase
        .from('member_auth')
        .select('member_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (authError) {
        logger.error('Error fetching member auth:', authError);
        return;
      }

      if (authData?.member_id) {
        // Get member data
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('id', authData.member_id)
          .single();

        if (memberError) {
          logger.error('Error fetching member:', memberError);
          return;
        }

        setMember(memberData);

        // Get tier data
        const { data: tierData, error: tierError } = await supabase
          .from('member_tiers')
          .select('tier_id')
          .eq('member_id', authData.member_id)
          .maybeSingle();

        if (!tierError && tierData?.tier_id) {
          const { data: tierInfo } = await supabase
            .from('tiers')
            .select('*')
            .eq('id', tierData.tier_id)
            .single();

          if (tierInfo) {
            setTier(tierInfo);
          }
        }
      }
    } catch (err) {
      logger.error('Error in fetchMemberData:', err);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchMemberData(session.user.id);
          }, 0);
        } else {
          setMember(null);
          setTier(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchMemberData(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithOtp = async (phone: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          channel: 'sms'
        }
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      });
      return { error: error as Error | null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setMember(null);
    setTier(null);
  };

  const registerMember = async (name: string, phone: string, email?: string) => {
    try {
      // First sign up with phone
      const { error: signUpError } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          channel: 'sms'
        }
      });

      if (signUpError) {
        return { error: signUpError as Error };
      }

      // Note: Member record and member_auth link will be created after OTP verification
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  return (
    <MemberAuthContext.Provider value={{
      user,
      session,
      member,
      tier,
      isLoading,
      signInWithOtp,
      verifyOtp,
      signOut,
      registerMember
    }}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const context = useContext(MemberAuthContext);
  if (!context) {
    throw new Error('useMemberAuth must be used within a MemberAuthProvider');
  }
  return context;
}