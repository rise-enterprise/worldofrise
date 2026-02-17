

## Fix Brand View Filtering Across the Dashboard

The sidebar brand filter (All Brands / NOIR Cafe / SASSO) is not updating the data because two key data sources query the wrong table. Here's what needs to change:

### Problem

The **Guest Directory** (Guests tab) uses the `usePaginatedMembers` hook, which queries the `members` table -- a table with **zero records**. All 335K+ contacts live in the `contacts` table. Additionally, the brand filter logic uses a `brand_affinity` column that doesn't exist on `contacts`.

The **Dashboard Overview** metrics and VIP guests are correctly wired to `contacts` and the edge function, but the edge function may need redeployment to ensure the latest brand filtering code is active.

### Changes

#### 1. Rewrite `src/hooks/usePaginatedMembers.ts` to query `contacts` table

- Replace `supabase.from('members')` with `supabase.from('contacts')`
- Replace `brand_affinity` brand filter with `.ilike('last_location', '%noir%')` or `'%sasso%'`
- Replace `full_name` search with `first_name`/`last_name` search via `.or()`
- Replace `member_tiers` join with direct use of the `loyalty_tier` column on contacts
- Map contact fields (`first_name`, `last_name`, `loyalty_tier`, `visits`, `total_spend`, `last_visit`, `last_location`) to the Guest type
- Apply tier filter using the `loyalty_tier` column server-side with `.ilike('loyalty_tier', '%black%')` etc.
- Remove the visits sub-query (contacts already have `visits` count and `last_visit` date)

#### 2. Redeploy `supabase/functions/dashboard-metrics/index.ts`

The edge function already has correct brand filtering code, but needs to be redeployed to ensure the latest version is live. This was confirmed during investigation -- the function was returning 404 until redeployed just now.

### What Users Will See

- Selecting **NOIR Cafe** in the sidebar will show only contacts whose last location contains "noir"
- Selecting **SASSO** will show only contacts at SASSO locations
- Selecting **All Brands** shows the full dataset
- This filtering applies consistently to: metric cards, tier distribution, regional presence, brand performance, distinguished guests, and the guest directory

### Technical Details

The `usePaginatedMembers` rewrite maps fields as follows:

| Current (members table) | New (contacts table) |
|---|---|
| `full_name` | `first_name` + `last_name` |
| `brand_affinity` | `last_location` (ilike filter) |
| `member_tiers.tiers.name` | `loyalty_tier` |
| `total_visits` | `visits` |
| `total_points` | `total_spend` |
| `created_at` | `created_date` |

The tier filter changes from client-side post-filtering to server-side `.ilike('loyalty_tier', '%tier_name%')` for better performance with 335K+ records.

