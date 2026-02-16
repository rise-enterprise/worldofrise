

## Fix: Dashboard Metrics Edge Function 401 Error

### Root Cause
The edge function uses `anonClient.auth.getClaims(token)` which does not exist in supabase-js v2. This causes the function to fail and return 401 for every request.

### Solution

**File: `supabase/functions/dashboard-metrics/index.ts`**

Replace the `getClaims` JWT verification with `auth.getUser()`, which is the correct supabase-js v2 method:

```typescript
// BEFORE (broken):
const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
const userId = claimsData.claims.sub;

// AFTER (correct):
const { data: { user }, error: userError } = await anonClient.auth.getUser();
if (userError || !user) { return 401; }
const userId = user.id;
```

No other files need changes. The hook (`useDashboardMetrics.ts`) is already correctly passing the Authorization header.

### Separate Issue: "visits" NOT NULL constraint
This is a data import issue unrelated to the dashboard. If you want this fixed too, the `contacts.visits` column should either allow NULL or the import logic should default missing values to 0. This can be addressed separately.

