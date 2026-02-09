

## Speed Up Contact Import: Server-Side Batch Insertion

### The Problem

The current code inserts rows directly from the browser using `supabase.from("contacts").insert(batch)`. With 335,566 rows and a batch size of 500, that's **672 separate HTTPS requests** from your browser to the database, each taking ~2 seconds due to network latency. Total: ~22 hours.

### The Fix

Send rows in large chunks (10,000 at a time) to the **backend function** that already exists (`import-contacts`). That function runs right next to the database, so each 500-row insert takes milliseconds instead of seconds. This turns a 22-hour import into roughly 5-10 minutes.

### How It Works

1. Browser parses the file (already working fine)
2. Browser sends 10,000 rows per request to the backend function
3. Backend function inserts in 500-row batches with near-zero latency
4. Browser tracks progress across chunks and shows ETA

### Changes

| File | What Changes |
|------|-------------|
| `src/components/admin/contacts/ContactsImportView.tsx` | Replace direct DB inserts with calls to the `import-contacts` edge function. Send rows in chunks of 10,000. Track progress across chunks. |
| `supabase/functions/import-contacts/index.ts` | Remove the "delete all" step (only the first chunk should delete). Accept a `clearFirst` flag so only the first chunk clears the table. Return inserted/rejected counts per chunk. |

### Technical Details

- Each edge function call receives up to 10,000 rows + a `clearFirst` boolean flag
- The edge function inserts in internal batches of 500 (already implemented)
- The first chunk sends `clearFirst: true` to delete existing contacts; subsequent chunks send `false`
- Progress bar updates after each 10,000-row chunk completes
- ETA is calculated based on chunks completed so far
- The audit log is written only on the final chunk
- Expected speed improvement: **~100-200x faster** (same-datacenter DB calls vs cross-internet round-trips)

