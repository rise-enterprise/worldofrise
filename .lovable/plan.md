

## Fix: Edge Function Memory and CPU Limits During Contact Import

### Root Cause
The edge function is failing with two distinct errors:
1. **Memory limit exceeded** - 5,000 rows x 45 columns creates a JSON payload too large for the edge function's ~150MB memory limit
2. **CPU Time exceeded** - When a batch insert fails, the fallback logic tries inserting rows one-by-one, which exhausts the CPU time limit

### Changes

#### 1. Reduce client-side chunk size to 500 rows
**File:** `src/components/admin/contacts/ContactsImportView.tsx`
- Change `CHUNK_SIZE` from `5000` to `500`
- With 45 columns per row, 500 rows keeps the payload well under memory limits

#### 2. Simplify edge function - remove one-by-one fallback
**File:** `supabase/functions/import-contacts/index.ts`
- Insert the batch in sub-batches of 500 rows (server-side) to stay within Supabase insert limits
- Remove the row-by-row fallback that causes CPU time exhaustion
- If a sub-batch fails, record all rows in that sub-batch as rejected rather than retrying individually
- Reduce server-side `BATCH_SIZE` from 500,000 to 500 to match

### Technical Details

The edge function memory limit is approximately 150MB. A single row with 45 columns is roughly 1-2KB of JSON. At 500 rows, the payload is ~500KB-1MB which is safe. The previous 5,000 rows created ~5-10MB payloads which, combined with parsing overhead and Supabase client memory, exceeded the limit.

The one-by-one fallback (lines 93-100 in the edge function) is especially dangerous because inserting thousands of individual rows sequentially can take minutes, far exceeding the CPU time budget.

