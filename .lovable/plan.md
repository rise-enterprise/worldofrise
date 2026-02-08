

## Fix Distinguished Guests Card -- Layout, Spacing, and Alignment

### Problems Identified
1. **Stats grid spacing is off** -- The 2x2 / 4-column grid has inconsistent cell sizing; labels with icons (Points, Member since) are wider than plain labels (Visits, Last visit), creating visual imbalance.
2. **Text still centered/misaligned** -- The name row uses `flex-wrap` with `items-center` causing elements to float awkwardly when they wrap. The avatar + name section doesn't anchor content to the top-left.
3. **Card feels too compressed** -- Sections are packed together without enough breathing room; the `space-y-3` gap is too tight for the amount of content.

### Changes (single file: `src/components/dashboard/VIPGuestCard.tsx`)

**1. Header section (lines 109-133) -- Fix name alignment**
- Change the name/badge area from a single wrapping flex row to a stacked layout:
  - Top line: status dot + name + VIP diamond (horizontal flex, `items-center`)
  - Below: tier badge on its own line
- This prevents awkward wrapping and keeps the name always left-aligned next to the avatar.

**2. Increase vertical spacing (line 135)**
- Change `space-y-3` to `space-y-4` for more breathing room between the info sections.

**3. Stats grid (lines 160-180) -- Fix alignment and consistency**
- Force a consistent `grid-cols-2` layout (remove `sm:grid-cols-4`) so each stat gets equal width in a clean 2x2 grid.
- Increase gap from `gap-4` to `gap-x-6 gap-y-4` for better horizontal separation.
- Remove inline icons from the label text (Star, Calendar icons) -- place them as decorative elements above or remove entirely to keep labels uniform.
- Increase the top margin/padding: change `mt-5 pt-4` to `mt-6 pt-5` for more separation from the content above.

**4. Card padding (line 108)**
- Increase CardContent padding from `p-6` to `p-7` (or `px-6 py-7`) to give more breathing room overall, pushing content to fill the card more naturally.

**5. Birthday and tags spacing (lines 183-199)**
- Increase `mt-3` to `mt-4` on birthday and tags sections for consistent vertical rhythm.

### Technical Summary

All changes are in `src/components/dashboard/VIPGuestCard.tsx`, desktop layout only (lines 87-203). The compact mobile layout remains unchanged. No new dependencies.
