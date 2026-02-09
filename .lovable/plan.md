

## Fix: Contact Database Upload Failing

The import fails because hundreds of HTTP requests are being fired simultaneously, exhausting the browser's connection pool. All requests fail with "Load failed" (network-level failure).

### Root Cause

When a 200-row batch insert fails, the fallback loop fires individual insert requests for every row in the batch. Although the code uses `await`, the browser's HTTP/2 multiplexing queues many requests at once, overwhelming the connection limit to Supabase. This cascades -- once connections start failing, all subsequent requests also fail.

### Fix (in `ContactsImportView.tsx`)

1. **Reduce batch size from 200 to 50** -- smaller payloads are more reliable and less likely to trigger initial batch failures
2. **Add a yield/delay between batches** -- `await new Promise(resolve => setTimeout(resolve, 50))` after each batch to prevent connection saturation
3. **Add progress tracking** -- show which batch is being processed (e.g., "Inserting batch 3 of 20...")
4. **Sequential fallback with delay** -- when a batch fails and individual inserts are attempted, add a small delay between each one to avoid flooding connections

### Technical Details

| Change | Detail |
|--------|--------|
| File | `src/components/admin/contacts/ContactsImportView.tsx` |
| Batch size | 200 -> 50 |
| Inter-batch delay | 50ms `setTimeout` after each batch |
| Fallback delay | 20ms between individual row inserts |
| Progress UI | Show "Inserting batch X of Y..." during the importing step |
| State | Add `progressText` state to display current batch progress |

No database or RLS changes needed -- the policies are correct. The issue is purely client-side connection exhaustion.
