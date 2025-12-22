// Admin Dashboard Types

export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'viewer';
export type BrandType = 'noir' | 'sasso' | 'both';
export type LocationCity = 'doha' | 'riyadh';
export type LanguagePref = 'ar' | 'en';
export type MemberStatus = 'active' | 'blocked';
export type VisitSource = 'manual' | 'qr' | 'pos' | 'import';
export type PointsRefType = 'visit' | 'redemption' | 'manual' | 'import' | 'campaign' | 'birthday' | 'bonus';
export type RedemptionStatus = 'requested' | 'approved' | 'declined' | 'fulfilled' | 'cancelled';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type AuditAction = 
  | 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import'
  | 'approve' | 'decline' | 'fulfill' | 'cancel' | 'block' | 'unblock' | 'merge'
  | 'tier_override' | 'points_adjust' | 'password_change' | 'role_change';

export interface Location {
  id: string;
  name: string;
  name_ar?: string;
  city: LocationCity;
  brand: BrandType;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: AdminRole;
  brand_scope?: BrandType;
  location_scope?: string;
  is_active: boolean;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  last_login_at?: string;
  session_token?: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  city: LocationCity;
  preferred_language: LanguagePref;
  brand_affinity: BrandType;
  status: MemberStatus;
  notes?: string;
  total_visits: number;
  total_points: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  tier?: Tier;
  member_tier?: MemberTier;
}

export interface Tier {
  id: string;
  name: string;
  name_ar?: string;
  min_visits: number;
  min_points: number;
  benefits_text_en?: string;
  benefits_text_ar?: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemberTier {
  id: string;
  member_id: string;
  tier_id: string;
  assigned_at: string;
  assigned_by?: string;
  override_flag: boolean;
  override_reason?: string;
  tier?: Tier;
}

export interface Visit {
  id: string;
  member_id: string;
  brand: BrandType;
  location_id?: string;
  visit_datetime: string;
  source: VisitSource;
  notes?: string;
  is_voided: boolean;
  void_reason?: string;
  voided_by?: string;
  voided_at?: string;
  created_at: string;
  created_by?: string;
  location?: Location;
  member?: Member;
}

export interface PointsLedgerEntry {
  id: string;
  member_id: string;
  points_delta: number;
  reason: string;
  reference_type: PointsRefType;
  reference_id?: string;
  balance_after: number;
  created_at: string;
  created_by?: string;
  admin?: Admin;
}

export interface Reward {
  id: string;
  title_en: string;
  title_ar?: string;
  description_en?: string;
  description_ar?: string;
  points_cost: number;
  brand_scope: BrandType;
  validity_start?: string;
  validity_end?: string;
  is_active: boolean;
  stock_limit?: number;
  per_member_limit: number;
  terms_en?: string;
  terms_ar?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Redemption {
  id: string;
  member_id: string;
  reward_id: string;
  points_spent: number;
  status: RedemptionStatus;
  code_or_qr?: string;
  notes?: string;
  requested_at: string;
  approved_at?: string;
  approved_by?: string;
  declined_at?: string;
  declined_by?: string;
  decline_reason?: string;
  fulfilled_at?: string;
  fulfilled_by?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancel_reason?: string;
  created_at: string;
  member?: Member;
  reward?: Reward;
}

export interface Campaign {
  id: string;
  name: string;
  name_ar?: string;
  segment_rules_json: Record<string, unknown>;
  start_date?: string;
  end_date?: string;
  bonus_points_rules: Record<string, unknown>;
  message_en?: string;
  message_ar?: string;
  status: CampaignStatus;
  members_reached: number;
  visits_generated: number;
  points_issued: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AuditLog {
  id: string;
  admin_id?: string;
  action_type: AuditAction;
  entity_type: string;
  entity_id?: string;
  before_json?: Record<string, unknown>;
  after_json?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin?: Admin;
}

export interface Setting {
  id: string;
  key: string;
  value: unknown;
  description?: string;
  updated_at: string;
  updated_by?: string;
}

export interface PointsRule {
  id: string;
  name: string;
  brand?: BrandType;
  points_per_visit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Dashboard stats
export interface DashboardStats {
  totalMembers: number;
  membersByCity: { doha: number; riyadh: number };
  membersByBrand: { noir: number; sasso: number; both: number };
  activeMembers7d: number;
  activeMembers30d: number;
  activeMembers90d: number;
  visitsToday: number;
  visitsWeek: number;
  visitsMonth: number;
  pointsIssued: number;
  pointsRedeemed: number;
  tierDistribution: { tier: string; count: number; color: string }[];
  topLocations: { name: string; visits: number }[];
  recentActivity: ActivityItem[];
  alerts: AlertItem[];
}

export interface ActivityItem {
  id: string;
  type: 'visit' | 'redemption' | 'member' | 'points' | 'tier';
  description: string;
  timestamp: string;
  admin?: string;
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
}

// Permission helpers
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: ['*'],
  admin: ['members', 'visits', 'points', 'rewards', 'redemptions', 'campaigns', 'tiers', 'export'],
  manager: ['members', 'visits', 'redemptions', 'export'],
  viewer: ['view_only'],
};

export function canPerformAction(role: AdminRole, action: string): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms.includes('*') || perms.includes(action);
}
