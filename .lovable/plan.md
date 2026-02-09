

## Fix: "Failed to send a request to the Edge Function"

### Root Cause

Each chunk sends 10,000 rows with ~40 fields each, producing a JSON payload of 10-20MB per request. This causes the browser's `fetch` to fail before the request even reaches the server. The edge function logs confirm it boots but never receives the request.

### Fix

Reduce `CHUNK_SIZE` from 10,000 to **2,000** rows per request. This keeps each payload under 2-3MB, well within limits, while still being far faster than the old direct-insert approach (only ~168 requests for 335K rows instead of 672).

### Technical Details

| File | Change |
|------|--------|
| `src/components/admin/contacts/ContactsImportView.tsx` | Change `CHUNK_SIZE` from `10000` to `2000` on line 275. Add a `try/catch` around each chunk call with a retry (1 attempt) for transient network failures. |

### Why This Works

- 2,000 rows x ~1KB/row = ~2MB payload per request (safe margin)
- 335K rows / 2,000 = ~168 requests, each taking ~1-3 seconds server-side
- Total estimated time: ~5-8 minutes (vs hours with old approach)
- Adding a single retry per chunk handles transient network hiccups gracefully

