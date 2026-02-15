import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface MemberInfo {
  id: string;
  memberId: string | null;
  phone: string;
}

interface UseMemberAuthReturn {
  user: User | null;
  session: Session | null;
  member: MemberInfo | null;
  isLoading: boolean;
  isMember: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, phone: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export function useMemberAuth(): UseMemberAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMemberInfo = async (userId: string) => {
    const { data, error } = await supabase
      .from('member_auth')
      .select('id, member_id, phone')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching member info:', error);
      return null;
    }

    if (data) {
      return {
        id: data.id,
        memberId: data.member_id,
        phone: data.phone,
      };
    }

    return null;
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer member info fetch
        if (session?.user) {
          setTimeout(() => {
            fetchMemberInfo(session.user.id).then(setMember);
          }, 0);
        } else {
          setMember(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchMemberInfo(session.user.id).then(info => {
          setMember(info);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        // Check if user is a member
        const memberInfo = await fetchMemberInfo(data.user.id);
        if (!memberInfo) {
          await supabase.auth.signOut();
          return { error: new Error('This account is not registered as a member. Please sign up first.') };
        }
        setMember(memberInfo);
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    phone: string,
    fullName: string
  ): Promise<{ error: Error | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/member`;
      
      // Create auth user
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (signUpError) return { error: signUpError };

      if (data.user) {
        // Use server-side edge function for member creation
        const { data: result, error: fnError } = await supabase.functions.invoke('create-member', {
          body: { phone, fullName },
        });

        if (fnError) {
          await supabase.auth.signOut();
          return { error: new Error('Failed to create member profile. Please try again.') };
        }

        if (result?.error) {
          await supabase.auth.signOut();
          return { error: new Error(result.error) };
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setMember(null);
  };

  return {
    user,
    session,
    member,
    isLoading,
    isMember: !!member,
    signIn,
    signUp,
    signOut,
  };
}
