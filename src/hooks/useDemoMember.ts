import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DemoMemberVisit {
  id: string;
  brand: string;
  date: Date;
  location: string;
}

export interface DemoMember {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  city: string;
  favoriteBrand: string;
  totalVisits: number;
  totalPoints: number;
  lastVisit: Date;
  isVIP: boolean;
  status: string;
  tierName: string;
  tierColor: string;
  visits: DemoMemberVisit[];
}

async function fetchDemoMember(): Promise<DemoMember | null> {
  const { data, error } = await supabase.functions.invoke('get-demo-member');
  
  if (error) {
    console.error('Error fetching demo member:', error);
    throw error;
  }
  
  if (!data?.member) {
    return null;
  }
  
  // Parse dates
  const member = data.member;
  return {
    ...member,
    lastVisit: new Date(member.lastVisit),
    visits: member.visits.map((v: any) => ({
      ...v,
      date: new Date(v.date),
    })),
  };
}

export function useDemoMember() {
  return useQuery({
    queryKey: ['demo-member'],
    queryFn: fetchDemoMember,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
