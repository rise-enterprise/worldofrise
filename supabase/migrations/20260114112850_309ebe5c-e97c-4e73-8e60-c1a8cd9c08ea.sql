-- Add public access policies to all tables for open demo access

-- Members table - public access
CREATE POLICY "Public read access for members"
ON public.members FOR SELECT
USING (true);

CREATE POLICY "Public insert access for members"
ON public.members FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for members"
ON public.members FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for members"
ON public.members FOR DELETE
USING (true);

-- Tiers table - public access
CREATE POLICY "Public read access for tiers"
ON public.tiers FOR SELECT
USING (true);

CREATE POLICY "Public insert access for tiers"
ON public.tiers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for tiers"
ON public.tiers FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for tiers"
ON public.tiers FOR DELETE
USING (true);

-- Member tiers table - public access
CREATE POLICY "Public read access for member_tiers"
ON public.member_tiers FOR SELECT
USING (true);

CREATE POLICY "Public insert access for member_tiers"
ON public.member_tiers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for member_tiers"
ON public.member_tiers FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for member_tiers"
ON public.member_tiers FOR DELETE
USING (true);

-- Visits table - public access
CREATE POLICY "Public read access for visits"
ON public.visits FOR SELECT
USING (true);

CREATE POLICY "Public insert access for visits"
ON public.visits FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for visits"
ON public.visits FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for visits"
ON public.visits FOR DELETE
USING (true);

-- Locations table - public access
CREATE POLICY "Public read access for locations"
ON public.locations FOR SELECT
USING (true);

CREATE POLICY "Public insert access for locations"
ON public.locations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for locations"
ON public.locations FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for locations"
ON public.locations FOR DELETE
USING (true);

-- Rewards table - public access
CREATE POLICY "Public read access for rewards"
ON public.rewards FOR SELECT
USING (true);

CREATE POLICY "Public insert access for rewards"
ON public.rewards FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for rewards"
ON public.rewards FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for rewards"
ON public.rewards FOR DELETE
USING (true);

-- Redemptions table - public access
CREATE POLICY "Public read access for redemptions"
ON public.redemptions FOR SELECT
USING (true);

CREATE POLICY "Public insert access for redemptions"
ON public.redemptions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for redemptions"
ON public.redemptions FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for redemptions"
ON public.redemptions FOR DELETE
USING (true);

-- Experiences table - public access
CREATE POLICY "Public read access for experiences"
ON public.experiences FOR SELECT
USING (true);

CREATE POLICY "Public insert access for experiences"
ON public.experiences FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for experiences"
ON public.experiences FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for experiences"
ON public.experiences FOR DELETE
USING (true);

-- Experience invitations table - public access
CREATE POLICY "Public read access for experience_invitations"
ON public.experience_invitations FOR SELECT
USING (true);

CREATE POLICY "Public insert access for experience_invitations"
ON public.experience_invitations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for experience_invitations"
ON public.experience_invitations FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for experience_invitations"
ON public.experience_invitations FOR DELETE
USING (true);

-- Points ledger table - public access
CREATE POLICY "Public read access for points_ledger"
ON public.points_ledger FOR SELECT
USING (true);

CREATE POLICY "Public insert access for points_ledger"
ON public.points_ledger FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for points_ledger"
ON public.points_ledger FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for points_ledger"
ON public.points_ledger FOR DELETE
USING (true);

-- Admins table - public access
CREATE POLICY "Public read access for admins"
ON public.admins FOR SELECT
USING (true);

CREATE POLICY "Public insert access for admins"
ON public.admins FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for admins"
ON public.admins FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for admins"
ON public.admins FOR DELETE
USING (true);

-- Campaigns table - public access
CREATE POLICY "Public read access for campaigns"
ON public.campaigns FOR SELECT
USING (true);

CREATE POLICY "Public insert access for campaigns"
ON public.campaigns FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for campaigns"
ON public.campaigns FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for campaigns"
ON public.campaigns FOR DELETE
USING (true);

-- Brand circles table - public access
CREATE POLICY "Public read access for brand_circles"
ON public.brand_circles FOR SELECT
USING (true);

CREATE POLICY "Public insert access for brand_circles"
ON public.brand_circles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for brand_circles"
ON public.brand_circles FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for brand_circles"
ON public.brand_circles FOR DELETE
USING (true);

-- Member brand circles table - public access
CREATE POLICY "Public read access for member_brand_circles"
ON public.member_brand_circles FOR SELECT
USING (true);

CREATE POLICY "Public insert access for member_brand_circles"
ON public.member_brand_circles FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for member_brand_circles"
ON public.member_brand_circles FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for member_brand_circles"
ON public.member_brand_circles FOR DELETE
USING (true);

-- Points rules table - public access
CREATE POLICY "Public read access for points_rules"
ON public.points_rules FOR SELECT
USING (true);

CREATE POLICY "Public insert access for points_rules"
ON public.points_rules FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for points_rules"
ON public.points_rules FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for points_rules"
ON public.points_rules FOR DELETE
USING (true);

-- Settings table - public access
CREATE POLICY "Public read access for settings"
ON public.settings FOR SELECT
USING (true);

CREATE POLICY "Public insert access for settings"
ON public.settings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for settings"
ON public.settings FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for settings"
ON public.settings FOR DELETE
USING (true);

-- Audit logs table - public access
CREATE POLICY "Public read access for audit_logs"
ON public.audit_logs FOR SELECT
USING (true);

CREATE POLICY "Public insert access for audit_logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for audit_logs"
ON public.audit_logs FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for audit_logs"
ON public.audit_logs FOR DELETE
USING (true);

-- Invitation requests table - public access
CREATE POLICY "Public read access for invitation_requests"
ON public.invitation_requests FOR SELECT
USING (true);

CREATE POLICY "Public insert access for invitation_requests"
ON public.invitation_requests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for invitation_requests"
ON public.invitation_requests FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for invitation_requests"
ON public.invitation_requests FOR DELETE
USING (true);

-- Member auth table - public access
CREATE POLICY "Public read access for member_auth"
ON public.member_auth FOR SELECT
USING (true);

CREATE POLICY "Public insert access for member_auth"
ON public.member_auth FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for member_auth"
ON public.member_auth FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for member_auth"
ON public.member_auth FOR DELETE
USING (true);

-- Member notification preferences table - public access
CREATE POLICY "Public read access for member_notification_preferences"
ON public.member_notification_preferences FOR SELECT
USING (true);

CREATE POLICY "Public insert access for member_notification_preferences"
ON public.member_notification_preferences FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for member_notification_preferences"
ON public.member_notification_preferences FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for member_notification_preferences"
ON public.member_notification_preferences FOR DELETE
USING (true);

-- Notification history table - public access
CREATE POLICY "Public read access for notification_history"
ON public.notification_history FOR SELECT
USING (true);

CREATE POLICY "Public insert access for notification_history"
ON public.notification_history FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for notification_history"
ON public.notification_history FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for notification_history"
ON public.notification_history FOR DELETE
USING (true);

-- SevenRooms sync table - public access
CREATE POLICY "Public read access for sevenrooms_sync"
ON public.sevenrooms_sync FOR SELECT
USING (true);

CREATE POLICY "Public insert access for sevenrooms_sync"
ON public.sevenrooms_sync FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for sevenrooms_sync"
ON public.sevenrooms_sync FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for sevenrooms_sync"
ON public.sevenrooms_sync FOR DELETE
USING (true);

-- SevenRooms sync logs table - public access
CREATE POLICY "Public read access for sevenrooms_sync_logs"
ON public.sevenrooms_sync_logs FOR SELECT
USING (true);

CREATE POLICY "Public insert access for sevenrooms_sync_logs"
ON public.sevenrooms_sync_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public update access for sevenrooms_sync_logs"
ON public.sevenrooms_sync_logs FOR UPDATE
USING (true);

CREATE POLICY "Public delete access for sevenrooms_sync_logs"
ON public.sevenrooms_sync_logs FOR DELETE
USING (true);