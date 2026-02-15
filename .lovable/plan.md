

## Fix: Dashboard Timing Out on 186K Contact Queries

### Root Cause
The security hardening migration added RLS policies to the `contacts` table that use `is_admin(auth.uid())`. While the function itself is efficient, the combination of RLS evaluation + unindexed `ILIKE` filters on 186K rows causes the database to time out (all the 500 errors in the network tab are "statement timeout" errors).

The specific problematic queries filter on `loyalty_tier`, `last_location`, `country`, `city` using `ILIKE '%term%'`, and `last_visit` using date comparisons -- none of which have proper indexes.

### Solution

Two changes are needed:

#### 1. Add database indexes (SQL migration)

Add a `pg_trgm` trigram extension and GIN indexes for the `ILIKE` pattern-match queries, plus a btree index on `last_visit` for date range filters:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_contacts_last_visit ON public.contacts USING btree (last_visit);
CREATE INDEX idx_contacts_loyalty_tier_trgm ON public.contacts USING gin (loyalty_tier gin_trgm_ops);
CREATE INDEX idx_contacts_last_location_trgm ON public.contacts USING gin (last_location gin_trgm_ops);
CREATE INDEX idx_contacts_country_trgm ON public.contacts USING gin (country gin_trgm_ops);
CREATE INDEX idx_contacts_city_trgm ON public.contacts USING gin (city gin_trgm_ops);
```

Trigram (GIN) indexes support `ILIKE '%pattern%'` queries efficiently, unlike standard btree indexes which only work for prefix matches. This will bring query times from timeout (8+ seconds) down to milliseconds.

#### 2. No code changes needed

The `useDashboardMetrics.ts` hook is correctly structured with server-side count queries. The queries themselves are fine -- they just need proper indexes to perform well on 186K rows with RLS enabled.

### Impact
- Dashboard will load in under 1-2 seconds instead of timing out
- No visual or functional changes
- All existing queries benefit from the new indexes (contacts list, analytics, etc.)

