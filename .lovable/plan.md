

## Remove Placeholder Sections -- Keep Only Loyalty Program

Strip out the 8 placeholder sidebar categories (Floorplan, People, Guest-Facing Language, General, Integrations, Availability, Widget Settings, Ordering) so the admin panel shows only the Loyalty Program section.

---

### Changes

#### 1. `src/components/admin/adminNavConfig.ts`
- Remove all 8 non-loyalty entries from the `NAV_SECTIONS` array (Floorplan, People, Language, General, Integrations, Availability, Widget Settings, Ordering)
- Remove unused icon imports (`Map`, `Users`, `Globe`, `Settings`, `Plug`, `Clock`, `Layout`, `ShoppingBag`)
- Only the Loyalty Program section with `Crown` icon and its 10 sub-items remains

#### 2. `src/pages/AdminPanel.tsx`
- Remove the `AdminPlaceholder` import (no longer needed since all placeholder sections are gone)
- Remove the placeholder fallback branch in the render logic (the `activeInfo` / `AdminPlaceholder` block)
- Keep only the `LOYALTY_VIEWS` rendering path and the "Select a section" fallback

#### 3. `src/components/admin/AdminPlaceholder.tsx`
- Delete this file entirely -- it is no longer used by any component

---

### Technical Details

| File | Action |
|------|--------|
| `src/components/admin/adminNavConfig.ts` | Edit: keep only Loyalty section |
| `src/pages/AdminPanel.tsx` | Edit: remove placeholder import and render branch |
| `src/components/admin/AdminPlaceholder.tsx` | Delete |

No other files are affected. The sidebar, header, activity log, and all 10 loyalty views remain unchanged.
