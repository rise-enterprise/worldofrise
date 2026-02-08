
## Fix Distinguished Guests Card Layout and Typography

### Problems
The desktop VIPGuestCard currently uses a horizontal flex layout (`flex items-start gap-4`) that creates compressed, misaligned content. The stats section uses inline `flex` with dividers that wraps awkwardly. Text is not properly grouped or spaced.

### Solution
Restructure the desktop card to use a clean vertical flex-column layout with consistent spacing and clear visual grouping.

### Changes (single file: `src/components/dashboard/VIPGuestCard.tsx`)

**Desktop (non-compact) card restructure:**

1. **Top section** -- Avatar + Name row side-by-side (keep existing flex row), but tighten alignment:
   - Status dot, display name, VIP diamond, tier badge all on one baseline
   - Remove `items-start`, use `items-center` for the name row

2. **Info row** -- Brand, location, phone in a single horizontal row beneath the name, separated by subtle dividers or spacing (`gap-4`), all left-aligned with consistent icon sizing

3. **Contact row** -- Email below the info row, left-aligned with Mail icon

4. **Stats section** -- Replace the current inline `flex` with wrapping dividers approach with a clean 2x2 or 4-column CSS grid:
   - `grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5`
   - Each cell: uppercase label on top, value below
   - Equal spacing, no manual dividers
   - Cells: VISITS, LAST VISIT, POINTS, MEMBER SINCE

5. **Birthday** -- Below the stats grid, left-aligned with Cake icon, `mt-3`

6. **Tags** -- Below birthday, left-aligned, `mt-3`

7. **Padding and spacing**:
   - CardContent padding increased to `p-6`
   - Section gaps: `space-y-3` between info/contact/stats sections
   - Line height on labels: `leading-relaxed`

**Compact card** -- Minor tweaks only:
- Ensure text is left-aligned (already is)
- No structural changes needed

### Technical Details

- Replace the stats `flex` block (lines 167-191) with a `grid` layout
- Wrap the content below the name in a `div` with `space-y-3` for even vertical distribution
- Change `p-5` to `p-6` on CardContent for breathing room
- Remove manual `w-px h-8 bg-border/30` dividers, use grid gap instead
- Keep all existing icons and data fields
