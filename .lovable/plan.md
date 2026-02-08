

## Optimize UI/UX for iPhone and Tablet Devices

This plan addresses responsive design gaps across the entire application -- the Gate entry page, Member Portal (Salon), and Admin Dashboard -- ensuring pixel-perfect display on iPhones (320-430px) and tablets (768-1024px like iPad).

---

### Core Problem

The app currently uses a single mobile breakpoint at 768px. Devices above 768px (iPads, tablets) are treated as full desktop, causing cramped layouts. Several mobile views also have spacing, overflow, and touch-target issues.

---

### 1. Add Tablet Detection Hook

**File:** `src/hooks/use-mobile.tsx`

- Add a `useIsTablet()` hook (768-1024px range) alongside the existing `useIsMobile()`
- Export both so components can conditionally render tablet-optimized layouts
- Tablet gets its own treatment: sidebar overlay (like mobile), but wider content grids (2 columns instead of 1)

---

### 2. Gate Page (Entry Screen) -- iPhone Fixes

**File:** `src/pages/Gate.tsx`

- Reduce brand logo sizes on small screens (`h-24` to `h-16` on mobile) so logos don't overflow
- Reduce padding on the brand card (`p-10` to `p-6` on mobile)
- Reduce `gap-8` between brand logos to `gap-4` on mobile
- Make "Request an Invitation" button full-width on mobile for better touch target
- Reduce `mb-16` spacing to `mb-10` on mobile to prevent excessive scrolling

---

### 3. Dashboard Layout -- Tablet Optimization

**File:** `src/pages/Dashboard.tsx`

- Use the new `useIsTablet` to give tablets the mobile sidebar treatment (Sheet drawer) but keep the wider content margin
- On tablet: remove `ml-64` fixed sidebar offset, use sheet drawer like mobile

**File:** `src/components/dashboard/Sidebar.tsx`

- Treat tablet as mobile (Sheet drawer) but with wider sheet width (`w-80` instead of `w-72`)

---

### 4. Dashboard Overview -- Responsive Grid Tuning

**File:** `src/components/dashboard/Overview.tsx`

- Top metrics: keep `grid-cols-2` on mobile, add `md:grid-cols-2 lg:grid-cols-4` so tablets show 2 columns cleanly instead of jumping to 4
- Main grid: change `lg:grid-cols-3` to also support `md:grid-cols-2` for tablets (2 columns with the VIP card spanning full width below)

**File:** `src/components/dashboard/MetricCard.tsx`

- Reduce the large `text-4xl` value to `text-2xl` on mobile and `text-3xl` on tablet for better fit
- Reduce icon container padding on mobile (`p-3` to `p-2`)

---

### 5. Dashboard Analytics -- Chart Sizing

**File:** `src/components/dashboard/AnalyticsView.tsx`

- Reduce chart height from fixed `300px` to `200px` on mobile, `250px` on tablet
- KPI cards: ensure `text-3xl` values scale to `text-2xl` on mobile
- Charts grid: `md:grid-cols-1 lg:grid-cols-2` so tablets show one chart per row (avoids squished charts)

---

### 6. Guest Directory -- Touch & Layout

**File:** `src/components/dashboard/GuestsList.tsx`

- Increase touch targets on guest rows: min-height `56px` on mobile
- Ensure the tier filter pills have adequate padding (`px-3 py-2` minimum) for touch
- Guest name: prevent truncation on tablet view

---

### 7. Guest Profile -- Tablet 2-Column Layout

**File:** `src/components/dashboard/GuestProfile.tsx`

- On tablet: display the profile header + insights panel side by side (2 columns) instead of stacked
- On mobile: keep the current stacked layout

---

### 8. Member Portal -- iPhone Polish

**File:** `src/pages/MemberPortal.tsx`

- Add `safe-area-inset` padding for iPhones with notch/Dynamic Island (`pb-safe` via env(safe-area-inset-bottom))
- Tier card: reduce the medallion + info gap from `gap-6` to `gap-4` on small screens
- Progress text: wrap "Progress to [tier]" and "X visits away" on separate lines on small phones
- Navigation buttons grid: keep `grid-cols-3` but ensure minimum touch target of 44x44px

---

### 9. Member Sub-Pages -- Consistent Mobile Headers

**Files:** `src/pages/MemberHistory.tsx`, `src/pages/MemberEvents.tsx`, `src/pages/MemberRewards.tsx`

- **MemberHistory:** Stats summary grid `grid-cols-3` gets tight on small phones -- use `text-2xl` instead of `text-3xl` for the visit count on mobile
- **MemberEvents:** Event cards already look good; ensure the Register button has `min-h-[44px]` for touch accessibility
- **MemberRewards:** 
  - Title `text-4xl md:text-5xl` is too large on iPhone SE -- reduce to `text-2xl md:text-4xl`
  - Category filter pills: ensure horizontal scroll with `overflow-x-auto` and hide scrollbar
  - Rewards grid: `grid-cols-1` on mobile (already done), `md:grid-cols-2` on tablet (already done) -- no changes needed

---

### 10. Safe Area & Touch Targets (Global)

**File:** `src/index.css`

- Add CSS for safe area insets: `padding-bottom: env(safe-area-inset-bottom)` on fixed bottom elements
- Ensure all interactive elements meet 44x44px minimum touch target (Apple HIG)

**File:** `index.html`

- Add `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` to support safe areas

---

### 11. Country Metrics -- Prevent Cramping on Small Screens

**File:** `src/components/dashboard/CountryMetrics.tsx`

- The `grid-cols-2` with `p-5` inner cards can be tight on 320px phones. Reduce inner padding to `p-3` on mobile
- Font size: `text-3xl` value down to `text-2xl` on mobile

---

### 12. Dashboard Header -- Toolbar Overflow

**File:** `src/components/dashboard/DashboardHeader.tsx`

- On small phones (< 375px), the toolbar buttons (theme, language, search, notifications, import, new guest) can overflow. Group import + new guest into a single "+" dropdown menu on very small screens
- Already handles hiding text labels on mobile -- no change needed there

---

### Technical Summary

| Area | Files Changed | Key Changes |
|------|--------------|-------------|
| Hook | `use-mobile.tsx` | Add `useIsTablet` |
| Gate | `Gate.tsx` | Smaller logos, tighter spacing |
| Dashboard Layout | `Dashboard.tsx`, `Sidebar.tsx` | Tablet uses sheet drawer |
| Overview | `Overview.tsx`, `MetricCard.tsx` | Tablet 2-col grid, scaled fonts |
| Analytics | `AnalyticsView.tsx` | Responsive chart heights |
| Guest List | `GuestsList.tsx` | Better touch targets |
| Guest Profile | `GuestProfile.tsx` | Tablet 2-col layout |
| Member Portal | `MemberPortal.tsx` | Safe areas, scaled spacing |
| Member Pages | `MemberHistory/Events/Rewards.tsx` | Font scaling, touch targets |
| Country Metrics | `CountryMetrics.tsx` | Mobile padding/font reduction |
| Header | `DashboardHeader.tsx` | Overflow prevention |
| Global | `index.css`, `index.html` | Safe area CSS, viewport meta |

No new dependencies required. All changes use existing Tailwind responsive prefixes and the new tablet hook.

