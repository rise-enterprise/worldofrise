

## Plan: Update Import Chunk Size and Source All Dashboard Widgets from Contacts Database

### 1. Change Client-Side Import Chunk Size to 100,000

**File:** `src/components/admin/contacts/ContactsImportView.tsx`
- Change `CHUNK_SIZE` from `500` to `100000` at line 283 (the upload chunk, not the CSV parse chunk)

### 2. Update `useDashboardMetrics` Hook

**File:** `src/hooks/useDashboardMetrics.ts`

Already sources from `contacts` table. No changes needed -- it already provides:
- Visits This Month (from contacts with `last_visit` this month)
- VIP Members (from `vip` boolean)
- Re-engagement Needed (contacts with `last_visit` > 30 days ago)
- Tier Distribution / Privilege Hierarchy (from `loyalty_tier`)
- Brand Performance (from `last_location`)
- Regional Presence (from `country`/`city`)

These are already wired to the Overview page components (TierDistribution, BrandMetrics, CountryMetrics, MetricCards).

### 3. Source "Distinguished Guests" from Contacts Database

**File:** `src/hooks/useMembers.ts` -- modify `fetchVIPGuests()` function

Currently fetches from the `members` table via tier joins. Will be rewritten to query the `contacts` table instead:
- Select contacts where `vip = true`, ordered by `total_spend` descending, limit 10
- Map contact fields to the `Guest` interface (using `first_name`/`last_name`, `loyalty_tier`, `city`/`country`, `last_visit`, `visits`, `last_location`, etc.)

### 4. Source Analytics Dashboard from Contacts Database

**File:** `src/components/dashboard/AnalyticsView.tsx`

Currently uses hardcoded mock data for all charts (tier spend, retention, brand comparison, top VIPs). Will be updated to:
- Import and use `useDashboardMetrics` for KPI cards (replacing hardcoded 342%, $2,847, etc. with real contact counts)
- Replace the hardcoded `topVIPs` array with a new `useTopContacts` hook that fetches the top 5 contacts by `total_spend` from the `contacts` table
- Replace hardcoded tier spend data with aggregated `total_spend` per `loyalty_tier` from contacts
- Brand comparison will use `last_location`-based counts from contacts
- Retention trend data will remain as-is (historical trend data requires time-series tracking not available in the contacts table)

### 5. New Hook: `useTopContacts`

**File:** `src/hooks/useTopContacts.ts` (new)

A small hook querying:
```sql
SELECT * FROM contacts
WHERE total_spend IS NOT NULL
ORDER BY total_spend DESC
LIMIT 5
```
Returns the top spenders for the Analytics "Top VIP Guests" section and can also serve the "Distinguished Guests" widget.

### 6. New Hook: `useTierSpendMetrics`

**File:** `src/hooks/useTierSpendMetrics.ts` (new)

Aggregates `total_spend` by `loyalty_tier` from the contacts table for the "Spend by Tier" chart in AnalyticsView.

### Summary of Changes

| File | Change |
|------|--------|
| `ContactsImportView.tsx` | Chunk size 500 to 100,000 |
| `useMembers.ts` (fetchVIPGuests) | Query `contacts` table instead of `members` |
| `AnalyticsView.tsx` | Replace hardcoded data with real contact queries |
| `useTopContacts.ts` (new) | Top 5 contacts by spend |
| `useTierSpendMetrics.ts` (new) | Spend aggregation by tier |

### Technical Notes

- The `contacts` table has no foreign keys or joins needed -- all metrics are derived from flat fields (`vip`, `visits`, `total_spend`, `loyalty_tier`, `last_location`, `city`, `country`, `last_visit`)
- The Supabase default 1000-row limit applies to the `useDashboardMetrics` fetch; for datasets larger than 1000 contacts, pagination or server-side aggregation via an Edge Function may be needed in future
- Retention trend chart will keep placeholder data since historical monthly retention requires time-series data not stored in the contacts table

