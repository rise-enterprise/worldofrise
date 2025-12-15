export type Brand = 'noir' | 'sasso' | 'all';
export type Country = 'qatar' | 'riyadh';
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
  email: string;
  phone?: string;
  country: Country;
  tier: Tier;
  totalVisits: number;
  lifetimeVisits: number;
  lastVisit: Date;
  joinedAt: Date;
  favoriteBrand: Brand;
  visits: Visit[];
  tags: string[];
  notes?: string;
  avatarUrl?: string;
}

export interface TierConfig {
  name: string;
  displayName: string;
  arabicName: string;
  minVisits: number;
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
    qatar: number;
    riyadh: number;
  };
  tierDistribution: Record<Tier, number>;
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
