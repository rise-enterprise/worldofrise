

## Make Brand View Filter the Dashboard Data

Currently, switching between "All Brands", "NOIR Cafe", and "SASSO" in the sidebar has no effect on the dashboard -- all metrics remain global. This plan adds brand filtering so each card reflects only the selected brand's data.

### What Changes

When you select NOIR or SASSO in the sidebar:
- **Total Members** shows only contacts whose last location matches that brand
- **Visits This Month** shows only contacts who visited that brand this month
- **VIP Members** shows only VIP contacts at that brand
- **Re-engagement Needed** shows only churn-risk contacts at that brand
- **Tier Distribution** shows tier breakdown for that brand only
- **Regional Presence** shows location split for that brand only
- **Distinguished Guests** shows top VIP guests from that brand only

When "All Brands" is selected, everything works as it does today (global view).

### Technical Details

#### 1. Edge Function: `supabase/functions/dashboard-metrics/index.ts`

Accept an optional `brand` query parameter (`noir`, `sasso`, or omitted for all).

When a brand is provided, add an `.ilike("last_location", "%noir%")` or `.ilike("last_location", "%sasso%")` filter to every count query. This chains onto each existing query so the counts reflect only that brand's contacts.

The response shape stays identical -- no new fields needed.

#### 2. Hook: `src/hooks/useDashboardMetrics.ts`

- Accept a `brand` parameter (type `Brand`)
- Pass it as a query param to the edge function: `?brand=noir` or `?brand=sasso`
- Include `brand` in the `queryKey` so React Query caches per-brand results separately: `['dashboard-metrics', brand]`

#### 3. Dashboard page: `src/pages/Dashboard.tsx`

- Pass `activeBrand` to `useDashboardMetrics(activeBrand)` so metrics update when the brand filter changes

#### 4. VIP Guests hook: `src/hooks/useMembers.ts`

- `useVIPGuests` accepts an optional `brand` parameter
- When set, add `.ilike('last_location', '%noir%')` or `.ilike('last_location', '%sasso%')` to the contacts query
- Include brand in the query key: `['vip-guests', brand]`

#### 5. Dashboard page: `src/pages/Dashboard.tsx`

- Pass `activeBrand` to `useVIPGuests(activeBrand)`

#### 6. Overview subtitles: `src/components/dashboard/Overview.tsx`

- Update subtitle text dynamically based on `activeBrand`:
  - "All Brands" selected: "Across all regions" / "Combined brands"
  - "NOIR" selected: "NOIR Cafe only" / "NOIR locations"
  - "SASSO" selected: "SASSO only" / "SASSO locations"

No database changes or new tables are needed. The filtering uses the existing `last_location` column which already contains brand names (e.g., "NOIR Cafe - West Walk", "SASSO - Al Hazm").

