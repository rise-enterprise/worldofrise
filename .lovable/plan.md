

# Fix Admin Dashboard: Routing and Performance

## Problem Summary

Two issues prevent the admin dashboard from working:

1. **Broken routing**: The admin sidebar's "Loyalty Dashboard" link navigates to `/admin/dashboard`, which loads the OLD `Dashboard` page (a completely different component) instead of showing the `LoyaltyDashboard` within the admin panel.

2. **Database timeout**: The old `Dashboard` page imports `DashboardHeader`, which calls `useMembers()` -- a query that fetches ALL rows from the `members` table with joins. On 335K+ rows with RLS, this always times out (the repeated 500 errors you see).

## Plan

### Step 1: Fix AdminPanel routing

Remove the `navigate("/admin/dashboard")` redirect from `AdminPanel.tsx` so clicking "Loyalty Dashboard" stays in the admin panel and renders `LoyaltyDashboard` inline like all other sections.

**File**: `src/pages/AdminPanel.tsx`
- Remove the special case `if (id === "loyalty-dashboard") { navigate("/admin/dashboard"); return; }` from `handleNavigate`
- This makes "Loyalty Dashboard" render inside the admin panel like every other view

### Step 2: Consolidate admin routes

Update `App.tsx` to redirect `/admin/dashboard` to `/admin` so both paths land on the new admin panel.

**File**: `src/App.tsx`  
- Change `/admin/dashboard` route to redirect to `/admin`
- Or point both routes to `AdminPanel`

### Step 3: Fix the members timeout in old Dashboard (safety net)

Even though the old Dashboard will no longer be the primary view, fix `DashboardHeader` to stop calling `useMembers()` (which fetches all 335K rows). Replace with a lightweight query or remove the dependency entirely.

**File**: `src/components/dashboard/DashboardHeader.tsx`
- Remove or limit the `useMembers()` call that loads all members just for the header search

## Technical Details

### Root cause of "no changes visible"

```text
User clicks "Loyalty Dashboard" in admin sidebar
  -> AdminPanel.handleNavigate("loyalty-dashboard")
  -> navigate("/admin/dashboard")  // Leaves AdminPanel entirely!
  -> Loads old Dashboard component
  -> Dashboard calls useMembers() via DashboardHeader
  -> Query times out on 335K rows
  -> Blank screen / loading skeleton forever
```

### After fix

```text
User clicks "Loyalty Dashboard" in admin sidebar
  -> AdminPanel.handleNavigate("loyalty-dashboard")
  -> setActiveView("loyalty-dashboard")
  -> Renders LoyaltyDashboard inline (uses optimized edge function)
  -> Dashboard loads in under 1 second
```

### Files to modify
1. `src/pages/AdminPanel.tsx` -- remove the navigate redirect
2. `src/App.tsx` -- consolidate `/admin/dashboard` route  
3. `src/components/dashboard/DashboardHeader.tsx` -- remove expensive `useMembers()` call

