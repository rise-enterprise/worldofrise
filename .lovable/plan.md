

## Optimize Admin Panel (RISE Intelligence Chamber) for Mobile

From the mobile screenshot, I can see several issues:

1. **SystemStatusBar** — The metrics (MEMBERS, VISITS/MO, VIP, RETENTION, CHURN RISK) overflow horizontally and get cut off. The "RISE INTELLIGENCE CHAMBER" label wraps awkwardly.
2. **VesselCommandInterface** — The empty state has oversized text ("COMMAND CHAMBER" heading) and status indicators that could be tighter. The example command buttons don't wrap well.
3. **Input bar** — Generally okay but the bottom padding needs safe-area consideration.

### Changes

#### 1. `src/components/admin/vessel/SystemStatusBar.tsx`
- Make the status bar stack vertically on mobile: identity label on top, metrics scrollable below
- Hide the time display on mobile (not critical)
- On mobile, show only the 3 most important metrics (MEMBERS, VIP, CHURN RISK) and hide VISITS/MO and RETENTION
- Reduce the "RISE INTELLIGENCE CHAMBER" text size on mobile
- Use `flex-wrap` or horizontal scroll for metrics

#### 2. `src/components/admin/vessel/VesselCommandInterface.tsx`
- Reduce "COMMAND CHAMBER" heading size on mobile (`text-xl` instead of `text-2xl`)
- Reduce status indicator row to wrap or use smaller gaps on mobile
- Shrink example command button text and padding slightly
- Add `pb-safe` (safe-area) to the input bar container for iPhone notch devices
- Reduce the empty state vertical padding on mobile

#### 3. `src/pages/AdminPanel.tsx`
- Add safe-area padding to the outer container for notch devices

### Technical Details
- Using Tailwind responsive prefixes (`sm:`, `md:`) and the existing `hidden`/`block` patterns
- Using the existing `pb-safe` utility class defined in `src/index.css`
- No database or backend changes needed
- Only 3 frontend files modified

