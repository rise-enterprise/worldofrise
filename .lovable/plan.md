

## Fix: Dashboard Still Timing Out After Indexes

### Root Cause

The trigram indexes were applied successfully, but the queries still time out. The problem is not the indexes -- it's the **RLS policy evaluation**. The `is_admin(auth.uid())` function in the contacts RLS policy is being evaluated per-row by the Postgres query planner across 186,000 rows, even though the result is the same for every row. This causes each of the 15 HEAD count queries to exceed the statement timeout.

### Solution: Move Dashboard Metrics to a Server-Side Edge Function

Replace the 15 client-side Supabase queries with a single call to a new edge function that:
1. Validates the caller is an authenticated admin (JWT check)
2. Runs all counts server-side using the service role (bypasses RLS)
3. Returns the aggregated metrics as JSON

This is both faster (single HTTP call, no RLS overhead) and more secure (admin check happens once, explicitly).

### Changes

#### 1. New Edge Function: `supabase/functions/dashboard-metrics/index.ts`

- Accepts GET requests with an Authorization header
- Verifies the JWT and checks `is_admin` via a direct query to the `admins` table
- Runs a single SQL query with conditional aggregation (one query instead of 15):

```sql
SELECT
  count(*) as total,
  count(*) FILTER (WHERE vip = true) as vip_count,
  count(*) FILTER (WHERE last_visit < $1) as churn_old,
  count(*) FILTER (WHERE last_visit IS NULL) as churn_null,
  count(*) FILTER (WHERE last_visit >= $2) as visits_month,
  count(*) FILTER (WHERE last_location ILIKE '%noir%') as noir,
  count(*) FILTER (WHERE last_location ILIKE '%sasso%') as sasso,
  count(*) FILTER (WHERE country ILIKE '%qatar%') as qatar,
  count(*) FILTER (WHERE city ILIKE '%doha%') as doha,
  count(*) FILTER (WHERE country ILIKE '%saudi%') as saudi,
  count(*) FILTER (WHERE city ILIKE '%riyadh%') as riyadh,
  count(*) FILTER (WHERE loyalty_tier ILIKE '%black%') as black,
  count(*) FILTER (WHERE loyalty_tier ILIKE '%inner%') as inner_circle,
  count(*) FILTER (WHERE loyalty_tier ILIKE '%elite%') as elite,
  count(*) FILTER (WHERE loyalty_tier ILIKE '%connoisseur%') as connoisseur
FROM contacts
```

This does a single sequential scan of the table instead of 15 separate scans, and avoids RLS entirely.

- Returns the computed `DashboardMetrics` JSON object

#### 2. Update `src/hooks/useDashboardMetrics.ts`

- Replace the 15 parallel Supabase client queries with a single `supabase.functions.invoke('dashboard-metrics')` call
- Parse the response into the existing `DashboardMetrics` type
- No changes to the React Query wrapper or any consuming components

### Impact
- Dashboard will load in under 1 second (single optimized query, no RLS overhead)
- No UI changes -- all existing components continue to work as-is
- More secure: admin verification happens explicitly in the function, not via per-row RLS evaluation

