

## Fix: Dashboard Freezing Due to 186K Row Client-Side Download

### Root Cause
The `useDashboardMetrics` hook downloads **all 186,066 contacts** twice (once for visits, once for tier distribution) by paginating 1,000 rows at a time. This means ~372 sequential network requests on every page load, freezing the browser completely.

### Solution
Replace the two `fetchAllColumn` calls with efficient server-side count queries that return only numbers, not row data.

### Changes

**File:** `src/hooks/useDashboardMetrics.ts`

1. **Remove the `fetchAllColumn` helper function entirely** -- it's no longer needed

2. **Visits This Month** (line 74-77): Replace the paginated fetch + client-side sum with a single server-side count query:
   - `select('*', { count: 'exact', head: true }).gte('last_visit', monthStart)` 
   - This returns just the count of contacts who visited this month, with zero row data

3. **Tier Distribution** (lines 80-91): Replace the paginated fetch + client-side grouping with 5 parallel count queries, one per tier:
   - `select('*', { count: 'exact', head: true }).ilike('loyalty_tier', '%black%')`
   - `select('*', { count: 'exact', head: true }).ilike('loyalty_tier', '%inner%')`
   - `select('*', { count: 'exact', head: true }).ilike('loyalty_tier', '%elite%')`
   - `select('*', { count: 'exact', head: true }).ilike('loyalty_tier', '%connoisseur%')`
   - Initiation = totalMembers minus the sum of the other 4 tiers

4. **Add all new queries to the existing `Promise.all`** so everything runs in a single parallel batch (~15 lightweight count queries instead of ~372 paginated data fetches)

### Impact
- Dashboard load: from ~372 sequential requests downloading 186K rows to ~15 parallel count queries returning only numbers
- Page should load in under 1 second instead of freezing indefinitely
- No visual or functional changes -- all metrics remain identical
