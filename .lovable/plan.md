

## Add Progress Bar to Contact Import View

Replace the text-only batch progress with a visual progress bar and percentage during the import step.

### Changes

**File: `src/components/admin/contacts/ContactsImportView.tsx`**

1. Import the `Progress` component from `@/components/ui/progress`
2. Add a `progressPercent` state (number, default 0)
3. Update the batch insert loop to calculate and set `progressPercent` after each batch: `Math.round(((i + batch.length) / processedRows.length) * 100)`
4. Replace the importing step UI to include:
   - The existing spinner
   - A `<Progress value={progressPercent} />` bar
   - Text showing `"{progressPercent}% -- Batch {batchNum} of {totalBatches}"`
   - The existing "This may take a moment" note

### Technical Details

| Detail | Value |
|--------|-------|
| File | `src/components/admin/contacts/ContactsImportView.tsx` |
| New state | `progressPercent: number` (default 0) |
| Calculation | `Math.round(((i + batch.length) / totalRows) * 100)` after each batch |
| Component | `<Progress>` from existing `src/components/ui/progress.tsx` |
| Lines affected | ~5 lines for state + calculation, ~5 lines for UI |

No new dependencies or database changes needed.

