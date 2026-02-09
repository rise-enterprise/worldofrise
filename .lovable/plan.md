

## Fix Large File Upload (180MB+) for Contact Import

### Problem

The current import reads the entire file into browser memory with `file.arrayBuffer()`, then SheetJS parses it (doubling memory usage), and all rows are stored in React state. For 180MB+ files this causes:

- Browser tab crash / out-of-memory
- UI freezing during parsing
- Very slow insertion with batch size of 50

### Solution

A three-part fix to handle files of any size:

### 1. Move File Parsing to a Web Worker

Offload the heavy SheetJS parsing to a background thread so the browser UI stays responsive and memory pressure on the main thread is reduced.

- Create a new file `src/workers/xlsxWorker.ts` that imports SheetJS, receives the file ArrayBuffer via `postMessage`, parses it, and sends back the JSON rows + headers.
- In `ContactsImportView.tsx`, spawn this worker instead of calling SheetJS directly. Listen for the result message to continue the flow.

### 2. Stream Processing for CSV Files

For CSV files specifically (which are the most common at 180MB+), use a streaming approach:

- Detect file type by extension before processing.
- For `.csv` files: read the file in chunks using `FileReader` + line splitting, processing rows incrementally instead of loading everything at once. This dramatically reduces peak memory usage.
- For `.xlsx` files: continue using the Web Worker approach (SheetJS requires the full file in memory, but the worker prevents UI freezing).

### 3. Increase Batch Size and Optimize Insertion

- Increase `BATCH_SIZE` from 50 to 500 for database inserts -- the current value is overly conservative and makes large imports extremely slow.
- Reduce the inter-batch delay from 50ms to 10ms.
- Add a running count display showing "X of Y rows inserted" alongside the progress bar.
- Add an estimated time remaining calculation based on batches completed so far.

### 4. Add File Size Guardrails

- Show a warning banner when a file exceeds 100MB, informing the user the import may take several minutes.
- Display file size in the UI after selection.
- Prevent double-clicks on the import button during processing.

### Files Changed

| File | Change |
|------|--------|
| `src/workers/xlsxWorker.ts` | New -- Web Worker for SheetJS parsing |
| `src/components/admin/contacts/ContactsImportView.tsx` | Use Web Worker for parsing, streaming CSV reader, increase batch size to 500, add file size display and warnings, add ETA display |

### Technical Notes

- No database changes needed.
- No new dependencies -- SheetJS is already installed, and Web Workers are native browser APIs.
- The Web Worker approach uses `new Worker(new URL(..., import.meta.url))` which Vite supports natively.
- For CSV streaming, rows are accumulated in chunks of 10,000 before being passed to the normalization/dedup step, keeping memory bounded.
- The existing full-replace (delete all then insert) logic remains unchanged.

