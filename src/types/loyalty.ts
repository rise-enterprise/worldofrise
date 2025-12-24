import { Database } from '@/integrations/supabase/types';

// Database types
export type DbMember = Database['public']['Tables']['members']['Row'];
export type DbVisit = Database['public']['Tables']['visits']['Row'];
export type DbTier = Database['public']['Tables']['tiers']['Row'];
export type DbLocation = Database['public']['Tables']['locations']['Row'];
export type DbMemberTier = Database['public']['Tables']['member_tiers']['Row'];

export type Brand = 'noir' | 'sasso' | 'both' | 'all';
export type Country = 'doha' | 'riyadh';
export type Tier = 'initiation' | 'connoisseur' | 'elite' | 'inner-circle' | 'black';

export interface Visit {
  id: string;
  date: Date;
  brand: Brand;
  country: Country;
  location: string;
  notes?: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone?: string;
  country: Country;
  tier: Tier;
  tierName?: string;
  totalVisits: number;
  lifetimeVisits: number;
  lastVisit: Date;
  joinedAt: Date;
  favoriteBrand: Brand;
  visits: Visit[];
  tags: string[];
  notes?: string;
  avatarUrl?: string;
  totalPoints?: number;
  status?: 'active' | 'blocked';
  isVip?: boolean;
  birthday?: string;
  salutation?: string;
}

export interface TierConfig {
  id?: string;
  name: string;
  displayName: string;
  arabicName: string;
  minVisits: number;
  minPoints?: number;
  color: string;
  privileges: string[];
}

export interface DashboardMetrics {
  totalMembers: number;
  activeMembers: number;
  totalVisitsThisMonth: number;
  visitsByBrand: {
    noir: number;
    sasso: number;
  };
  visitsByCountry: {
    doha: number;
    riyadh: number;
  };
  tierDistribution: Record<string, number>;
  churnRiskCount: number;
  vipGuestsCount: number;
}

export interface GuestInsightPatterns {
  visitFrequency: 'increasing' | 'stable' | 'declining';
  averageDaysBetweenVisits: number;
  preferredDayOfWeek: string;
  preferredTimeSlot: 'morning' | 'afternoon' | 'evening';
}

export interface GuestInsight {
  guestId: string;
  patterns: GuestInsightPatterns;
  churnRisk: 'low' | 'medium' | 'high' | 'critical';
  churnScore: number;
  recommendations: string[];
  suggestedMessage: {
    subject: string;
    body: string;
    tone: 'noir' | 'sasso' | 'rise';
    channel: 'email' | 'whatsapp' | 'sms';
  };
  generatedAt: string;
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  initiation: {
    name: 'initiation',
    displayName: 'Initiation',
    arabicName: 'البداية',
    minVisits: 0,
    color: 'tier-initiation',
    privileges: [
      'Welcome ritual experience',
      'Birthday acknowledgment',
      'Newsletter & event updates',
    ],
  },
  connoisseur: {
    name: 'connoisseur',
    displayName: 'Connoisseur',
    arabicName: 'الخبير',
    minVisits: 5,
    color: 'tier-connoisseur',
    privileges: [
      'All Initiation privileges',
      'Priority seating',
      'Complimentary signature welcome drink',
      'Early access to seasonal menus',
    ],
  },
  elite: {
    name: 'elite',
    displayName: 'Élite',
    arabicName: 'النخبة',
    minVisits: 15,
    color: 'tier-elite',
    privileges: [
      'All Connoisseur privileges',
      'Secret menu access',
      'Complimentary dessert on visits',
      'Invitation to exclusive tastings',
    ],
  },
  'inner-circle': {
    name: 'inner-circle',
    displayName: 'Inner Circle',
    arabicName: 'الدائرة الخاصة',
    minVisits: 30,
    color: 'tier-inner-circle',
    privileges: [
      'All Élite privileges',
      'Chef table experiences',
      'Cross-brand VIP treatment',
      'Personal host assigned',
      'Surprise seasonal gifts',
    ],
  },
  black: {
    name: 'black',
    displayName: 'RISE Black',
    arabicName: 'رايز بلاك',
    minVisits: 50,
    color: 'tier-black',
    privileges: [
      'All Inner Circle privileges',
      'Invite-only events',
      'Global RISE experiences',
      'Personal concierge',
      'Bespoke dining experiences',
      'Priority reservations at any location',
    ],
  },
};

// Helper to map database tier name to Tier type
export function mapDbTierToTier(tierName: string): Tier {
  const normalized = tierName.toLowerCase().replace(/\s+/g, '-');
  if (normalized === 'rise-black' || normalized === 'black') return 'black';
  if (normalized === 'inner-circle') return 'inner-circle';
  if (normalized === 'elite' || normalized === 'élite') return 'elite';
  if (normalized === 'connoisseur') return 'connoisseur';
  return 'initiation';
}

// Helper to map database brand to Brand type
export function mapDbBrandToBrand(brand: string | null): Brand {
  if (!brand) return 'both';
  if (brand === 'noir') return 'noir';
  if (brand === 'sasso') return 'sasso';
  return 'both';
}

// Helper to map database city to Country type
export function mapDbCityToCountry(city: string): Country {
  if (city === 'riyadh') return 'riyadh';
  return 'doha';
}
