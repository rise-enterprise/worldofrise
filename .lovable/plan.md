

## Fix: Ensure Accurate Metrics for Large Contact Databases

### Problem
All dashboard widgets already query the `contacts` table, but the `useDashboardMetrics` hook fetches a maximum of 1,000 rows (Supabase default limit). For databases with more than 1,000 contacts, metrics like VIP count, churn risk, tier distribution, brand performance, and regional presence will be undercounted and inaccurate.

### Solution
Replace the client-side approach (fetch all rows, compute in JS) with server-side counting using Supabase queries. This removes the 1,000-row ceiling and makes metrics accurate regardless of database size.

### Changes

#### 1. Rewrite `useDashboardMetrics` to use server-side counts
**File:** `src/hooks/useDashboardMetrics.ts`

Instead of fetching all contacts and computing in JavaScript, run separate targeted queries:

- **Total Members**: `select('*', { count: 'exact', head: true })` -- already done, keep it
- **VIP Count**: `select('*', { count: 'exact', head: true }).eq('vip', true)`
- **Visits This Month**: `select('visits').gte('last_visit', monthStart)` then sum client-side (still limited to 1000 but only for the sum -- or use multiple pages)
- **Churn Risk**: `select('*', { count: 'exact', head: true }).or('last_visit.is.null,last_visit.lt.{thirtyDaysAgo}')`
- **Tier Distribution**: Fetch `loyalty_tier` column only (lightweight), paginate if needed
- **Brand Performance**: Use count queries filtered by `last_location`
- **Regional Presence**: Use count queries filtered by `country`/`city`

This approach uses `head: true` count queries where possible (no row data transferred, no row limit) and only fetches actual row data when aggregation (like summing visits) is required.

#### 2. No changes needed to other files
The following are already correctly sourced from contacts:
- `useVIPGuests` (Distinguished Guests) -- queries contacts with `vip = true`, limit 10
- `useTopContacts` -- queries contacts ordered by `total_spend`, limit 5
- `useTierSpendMetrics` -- queries contacts for tier/spend aggregation
- `AnalyticsView` -- consumes the above hooks
- `Overview` component -- consumes `useDashboardMetrics` and `useVIPGuests`

### Technical Details

| Metric | Current Approach | New Approach |
|--------|-----------------|--------------|
| Total Members | Count query (correct) | Keep as-is |
| VIP Count | Filter 1000 rows client-side | Count query with `.eq('vip', true)` |
| Churn Risk | Filter 1000 rows client-side | Count query with date filter |
| Visits This Month | Sum from 1000 rows | Paginated fetch of visits field only |
| Tier Distribution | Group 1000 rows | Fetch `loyalty_tier` column only, paginate beyond 1000 |
| Brand Performance | Filter 1000 rows by last_location | Count queries per brand |
| Regional Presence | Filter 1000 rows by city/country | Count queries per region |

The count queries (`head: true`) are the most efficient as they return only a number with no row limit. For tier distribution, we still need to fetch and group the `loyalty_tier` values, but fetching a single column is much lighter than 45 columns.

