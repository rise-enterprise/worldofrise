

## Fix Regional Presence to Use Actual Location Data

The Regional Presence card currently shows 0 for both Qatar and Saudi Arabia because the edge function queries the `country` and `city` columns, which are null for virtually all 335K+ contacts. The real location data lives in the `last_location` column.

### Current Data Distribution (from `last_location`)

| Location | Count |
|---|---|
| NOIR Cafe - Riyadh | 48,944 |
| NOIR Cafe - West Walk (Doha) | 40,110 |
| NOIR Cafe - Al Hazm (Doha) | 30,614 |
| SASSO - West Walk (Doha) | 25,909 |
| SASSO - Al Hazm (Doha) | 25,584 |
| NOIR Cafe - Old Doha Port | 8,717 |
| + legacy variants | ~1,950 |

**Qatar total: ~127,000 | Saudi Arabia total: ~49,000**

### Changes

1. **`supabase/functions/dashboard-metrics/index.ts`** -- Replace the broken `country`/`city` queries with `last_location`-based queries:
   - Qatar count: `ilike("last_location", "%West Walk%")` + `ilike("last_location", "%Al Hazm%")` + `ilike("last_location", "%Old Doha Port%")` + `ilike("last_location", "%Tennis%")`
   - Saudi count: `ilike("last_location", "%Riyadh%")`
   - This matches the actual data patterns and removes the 4 broken queries (qatarRes, dohaRes, saudiRes, riyadhRes), replacing them with 2 accurate ones

2. **`src/components/dashboard/CountryMetrics.tsx`** -- Update the display labels:
   - Change "Qatar" subtitle from "Doha" to show the actual branch count (e.g., "4 locations")
   - Change "Saudi Arabia" subtitle from "Riyadh" to "1 location" or keep "Riyadh"
   - Update the metric label from "visits" to "members" since these are contact counts, not visit counts

### Technical Details

In the edge function, remove these 4 queries:
- `qatarRes` (country ilike qatar)
- `dohaRes` (city ilike doha)
- `saudiRes` (country ilike saudi)
- `riyadhRes` (city ilike riyadh)

Replace with 2 queries:
```typescript
// Riyadh - straightforward
serviceClient.from("contacts").select("*", { count: "exact", head: true })
  .ilike("last_location", "%Riyadh%"),

// Qatar - all non-Riyadh locations
serviceClient.from("contacts").select("*", { count: "exact", head: true })
  .not("last_location", "ilike", "%Riyadh%")
  .not("last_location", "is", null),
```

The Qatar query uses a "not Riyadh and not null" approach, which is simpler and future-proof if new Qatar branches are added.

The `visitsByCountry` response shape stays `{ doha: number, riyadh: number }` so no frontend type changes are needed.

