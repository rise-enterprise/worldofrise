
-- =====================================================
-- CRITICAL SECURITY FIX: Remove all overly permissive "Public * access" RLS policies
-- =====================================================

-- admins
DROP POLICY IF EXISTS "Public delete access for admins" ON public.admins;
DROP POLICY IF EXISTS "Public insert access for admins" ON public.admins;
DROP POLICY IF EXISTS "Public read access for admins" ON public.admins;
DROP POLICY IF EXISTS "Public update access for admins" ON public.admins;

-- contacts
DROP POLICY IF EXISTS "Public delete access for contacts" ON public.contacts;
DROP POLICY IF EXISTS "Public insert access for contacts" ON public.contacts;
DROP POLICY IF EXISTS "Public read access for contacts" ON public.contacts;
DROP POLICY IF EXISTS "Public update access for contacts" ON public.contacts;

-- locations
DROP POLICY IF EXISTS "Public delete access for locations" ON public.locations;
DROP POLICY IF EXISTS "Public insert access for locations" ON public.locations;
DROP POLICY IF EXISTS "Public read access for locations" ON public.locations;
DROP POLICY IF EXISTS "Public update access for locations" ON public.locations;

-- tiers
DROP POLICY IF EXISTS "Public delete access for tiers" ON public.tiers;
DROP POLICY IF EXISTS "Public insert access for tiers" ON public.tiers;
DROP POLICY IF EXISTS "Public read access for tiers" ON public.tiers;
DROP POLICY IF EXISTS "Public update access for tiers" ON public.tiers;

-- member_tiers
DROP POLICY IF EXISTS "Public delete access for member_tiers" ON public.member_tiers;
DROP POLICY IF EXISTS "Public insert access for member_tiers" ON public.member_tiers;
DROP POLICY IF EXISTS "Public read access for member_tiers" ON public.member_tiers;
DROP POLICY IF EXISTS "Public update access for member_tiers" ON public.member_tiers;

-- visits
DROP POLICY IF EXISTS "Public delete access for visits" ON public.visits;
DROP POLICY IF EXISTS "Public insert access for visits" ON public.visits;
DROP POLICY IF EXISTS "Public read access for visits" ON public.visits;
DROP POLICY IF EXISTS "Public update access for visits" ON public.visits;

-- points_ledger
DROP POLICY IF EXISTS "Public delete access for points_ledger" ON public.points_ledger;
DROP POLICY IF EXISTS "Public insert access for points_ledger" ON public.points_ledger;
DROP POLICY IF EXISTS "Public read access for points_ledger" ON public.points_ledger;
DROP POLICY IF EXISTS "Public update access for points_ledger" ON public.points_ledger;

-- rewards
DROP POLICY IF EXISTS "Public delete access for rewards" ON public.rewards;
DROP POLICY IF EXISTS "Public insert access for rewards" ON public.rewards;
DROP POLICY IF EXISTS "Public read access for rewards" ON public.rewards;
DROP POLICY IF EXISTS "Public update access for rewards" ON public.rewards;

-- redemptions
DROP POLICY IF EXISTS "Public delete access for redemptions" ON public.redemptions;
DROP POLICY IF EXISTS "Public insert access for redemptions" ON public.redemptions;
DROP POLICY IF EXISTS "Public read access for redemptions" ON public.redemptions;
DROP POLICY IF EXISTS "Public update access for redemptions" ON public.redemptions;

-- campaigns
DROP POLICY IF EXISTS "Public delete access for campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Public insert access for campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Public read access for campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Public update access for campaigns" ON public.campaigns;

-- audit_logs
DROP POLICY IF EXISTS "Public delete access for audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Public insert access for audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Public read access for audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Public update access for audit_logs" ON public.audit_logs;

-- settings
DROP POLICY IF EXISTS "Public delete access for settings" ON public.settings;
DROP POLICY IF EXISTS "Public insert access for settings" ON public.settings;
DROP POLICY IF EXISTS "Public read access for settings" ON public.settings;
DROP POLICY IF EXISTS "Public update access for settings" ON public.settings;

-- points_rules
DROP POLICY IF EXISTS "Public delete access for points_rules" ON public.points_rules;
DROP POLICY IF EXISTS "Public insert access for points_rules" ON public.points_rules;
DROP POLICY IF EXISTS "Public read access for points_rules" ON public.points_rules;
DROP POLICY IF EXISTS "Public update access for points_rules" ON public.points_rules;

-- members
DROP POLICY IF EXISTS "Public delete access for members" ON public.members;
DROP POLICY IF EXISTS "Public insert access for members" ON public.members;
DROP POLICY IF EXISTS "Public read access for members" ON public.members;
DROP POLICY IF EXISTS "Public update access for members" ON public.members;

-- member_auth
DROP POLICY IF EXISTS "Public delete access for member_auth" ON public.member_auth;
DROP POLICY IF EXISTS "Public insert access for member_auth" ON public.member_auth;
DROP POLICY IF EXISTS "Public read access for member_auth" ON public.member_auth;
DROP POLICY IF EXISTS "Public update access for member_auth" ON public.member_auth;

-- sevenrooms_sync
DROP POLICY IF EXISTS "Public delete access for sevenrooms_sync" ON public.sevenrooms_sync;
DROP POLICY IF EXISTS "Public insert access for sevenrooms_sync" ON public.sevenrooms_sync;
DROP POLICY IF EXISTS "Public read access for sevenrooms_sync" ON public.sevenrooms_sync;
DROP POLICY IF EXISTS "Public update access for sevenrooms_sync" ON public.sevenrooms_sync;

-- sevenrooms_sync_logs
DROP POLICY IF EXISTS "Public delete access for sevenrooms_sync_logs" ON public.sevenrooms_sync_logs;
DROP POLICY IF EXISTS "Public insert access for sevenrooms_sync_logs" ON public.sevenrooms_sync_logs;
DROP POLICY IF EXISTS "Public read access for sevenrooms_sync_logs" ON public.sevenrooms_sync_logs;
DROP POLICY IF EXISTS "Public update access for sevenrooms_sync_logs" ON public.sevenrooms_sync_logs;

-- member_notification_preferences
DROP POLICY IF EXISTS "Public delete access for member_notification_preferences" ON public.member_notification_preferences;
DROP POLICY IF EXISTS "Public insert access for member_notification_preferences" ON public.member_notification_preferences;
DROP POLICY IF EXISTS "Public read access for member_notification_preferences" ON public.member_notification_preferences;
DROP POLICY IF EXISTS "Public update access for member_notification_preferences" ON public.member_notification_preferences;

-- notification_history
DROP POLICY IF EXISTS "Public delete access for notification_history" ON public.notification_history;
DROP POLICY IF EXISTS "Public insert access for notification_history" ON public.notification_history;
DROP POLICY IF EXISTS "Public read access for notification_history" ON public.notification_history;
DROP POLICY IF EXISTS "Public update access for notification_history" ON public.notification_history;

-- invitation_requests
DROP POLICY IF EXISTS "Public delete access for invitation_requests" ON public.invitation_requests;
DROP POLICY IF EXISTS "Public insert access for invitation_requests" ON public.invitation_requests;
DROP POLICY IF EXISTS "Public read access for invitation_requests" ON public.invitation_requests;
DROP POLICY IF EXISTS "Public update access for invitation_requests" ON public.invitation_requests;

-- member_brand_circles
DROP POLICY IF EXISTS "Public delete access for member_brand_circles" ON public.member_brand_circles;
DROP POLICY IF EXISTS "Public insert access for member_brand_circles" ON public.member_brand_circles;
DROP POLICY IF EXISTS "Public read access for member_brand_circles" ON public.member_brand_circles;
DROP POLICY IF EXISTS "Public update access for member_brand_circles" ON public.member_brand_circles;

-- brand_circles
DROP POLICY IF EXISTS "Public delete access for brand_circles" ON public.brand_circles;
DROP POLICY IF EXISTS "Public insert access for brand_circles" ON public.brand_circles;
DROP POLICY IF EXISTS "Public read access for brand_circles" ON public.brand_circles;
DROP POLICY IF EXISTS "Public update access for brand_circles" ON public.brand_circles;

-- experiences
DROP POLICY IF EXISTS "Public delete access for experiences" ON public.experiences;
DROP POLICY IF EXISTS "Public insert access for experiences" ON public.experiences;
DROP POLICY IF EXISTS "Public read access for experiences" ON public.experiences;
DROP POLICY IF EXISTS "Public update access for experiences" ON public.experiences;

-- experience_invitations
DROP POLICY IF EXISTS "Public delete access for experience_invitations" ON public.experience_invitations;
DROP POLICY IF EXISTS "Public insert access for experience_invitations" ON public.experience_invitations;
DROP POLICY IF EXISTS "Public read access for experience_invitations" ON public.experience_invitations;
DROP POLICY IF EXISTS "Public update access for experience_invitations" ON public.experience_invitations;

-- rejected_invitation_requests
DROP POLICY IF EXISTS "Public delete access for rejected_invitation_requests" ON public.rejected_invitation_requests;
DROP POLICY IF EXISTS "Public insert access for rejected_invitation_requests" ON public.rejected_invitation_requests;
DROP POLICY IF EXISTS "Public read access for rejected_invitation_requests" ON public.rejected_invitation_requests;
DROP POLICY IF EXISTS "Public update access for rejected_invitation_requests" ON public.rejected_invitation_requests;

-- =====================================================
-- FIX: notification_history policy on wrong table
-- =====================================================
DROP POLICY IF EXISTS "Members can view their notification history" ON public.member_notification_preferences;

CREATE POLICY "Members can view their notification history"
ON public.notification_history FOR SELECT
TO authenticated
USING (member_id = get_member_id(auth.uid()));

-- =====================================================
-- FIX: invitation_requests SELECT policy too permissive
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own requests" ON public.invitation_requests;

CREATE POLICY "Users can view their own requests"
ON public.invitation_requests FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR is_admin(auth.uid())
);

-- =====================================================
-- ADD: Missing member policies for portal functionality
-- =====================================================
CREATE POLICY "Members can view active rewards"
ON public.rewards FOR SELECT
TO authenticated
USING (is_member(auth.uid()) AND is_active = true);

CREATE POLICY "Members can view brand circles"
ON public.brand_circles FOR SELECT
TO authenticated
USING (is_member(auth.uid()));

CREATE POLICY "Members can view own brand circles"
ON public.member_brand_circles FOR SELECT
TO authenticated
USING (member_id = get_member_id(auth.uid()));

CREATE POLICY "Members can view experiences"
ON public.experiences FOR SELECT
TO authenticated
USING (is_member(auth.uid()));

CREATE POLICY "Members can view own invitations"
ON public.experience_invitations FOR SELECT
TO authenticated
USING (member_id = get_member_id(auth.uid()));

CREATE POLICY "Members can view own redemptions"
ON public.redemptions FOR SELECT
TO authenticated
USING (member_id = get_member_id(auth.uid()));

CREATE POLICY "Members can request redemptions"
ON public.redemptions FOR INSERT
TO authenticated
WITH CHECK (member_id = get_member_id(auth.uid()));

CREATE POLICY "Members can view own points"
ON public.points_ledger FOR SELECT
TO authenticated
USING (member_id = get_member_id(auth.uid()));

CREATE POLICY "Authenticated users can view locations"
ON public.locations FOR SELECT
TO authenticated
USING (true);
