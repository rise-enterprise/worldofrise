

# Fix Member Login and Portal Access

## Problem

The `member_auth` table is empty -- no user accounts are linked to member profiles. This means:
- No one can log in as a member
- The `MemberAuthGuard` always rejects access to `/member/*` routes
- The member portal is completely inaccessible

## Solution

### Step 1: Link the admin user as a member (for testing)

Create a `member_auth` record linking `ibrahim@rise.qa` (user ID: `3efc4a20-8d48-4bc3-bab6-d46973e00d79`) to an existing member in the `members` table. This allows you to log in and see the member experience.

Since the unified login prioritizes admin access (checks admin first), we also need to update the login form to let dual-role users choose their destination.

### Step 2: Update the login flow for dual-role users

Modify `UnifiedLoginForm.tsx` so that when a user is **both** an admin and a member, they see a choice screen instead of being auto-routed to admin. This way you can choose to enter either the Admin panel or the Member Salon.

### Step 3: Fix MemberPortal data fetching for real members

The `MemberPortal` currently uses `useDemoMember()` which fetches the first member in the table (not the logged-in user's member). Update it to fetch the **authenticated member's own data** using `get_member_id()` so each member sees their own profile.

## Technical Details

### Database change
- Insert a row into `member_auth` linking user `3efc4a20-8d48-4bc3-bab6-d46973e00d79` to the first member record (e.g., Mr. Hamad / Alssada, ID `f1d3caa7-2d69-4939-bbe4-02e255ee9576`)

### Files to modify

1. **`src/components/auth/UnifiedLoginForm.tsx`**
   - After login, check both admin and member status
   - If user is both, show a role selection UI (two buttons: "Admin Panel" and "Member Salon")
   - If only one role, auto-navigate as before

2. **`src/hooks/useMembers.ts`** (the `useDemoMember` function)
   - Update to accept an optional `memberId` parameter
   - When called from member pages, fetch the logged-in user's own member record instead of a random first member

3. **`src/pages/MemberPortal.tsx`**
   - Use the authenticated member's ID (from `MemberAuthContext` or `get_member_id` RPC) instead of `useDemoMember()`

4. **`src/pages/MemberWelcome.tsx`**, **`src/pages/MemberHistory.tsx`**, **`src/pages/MemberRewards.tsx`**, **`src/pages/MemberProfileEdit.tsx`**
   - Same pattern: use the authenticated member's data instead of demo data

### Flow after fix

```text
User logs in as ibrahim@rise.qa
  -> System detects: admin = true, member = true
  -> Shows role picker: "Admin Panel" | "Member Salon"
  -> User picks "Member Salon"
  -> Navigates to /member
  -> MemberAuthGuard: is_member() = true (member_auth row exists)
  -> MemberPortal fetches OWN member data via get_member_id()
  -> Portal renders with real member profile
```

