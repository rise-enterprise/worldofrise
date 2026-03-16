

# Plan: Apply Champagne Gold to Landing Page + Remaining Files

## Scope

Two parts: (1) infuse the Gate landing page with warm champagne gold accents alongside the existing purple/neon, and (2) update ~10 remaining files that still use old gold values.

## Changes

### 1. Landing Page — `src/pages/Gate.tsx`
- Add a subtle champagne gold radial gradient layer to the ambient background (alongside existing purple/magenta)
- Change the "RISE" title shimmer gradient to blend gold with foreground instead of neon-purple-light
- Add gold accents to the brand divider lines (purple → gold gradient)
- Give the "Enter" button a gold-infused gradient: `from gold to gold-dark` instead of purple→magenta
- Add a warm gold glow to the logo block's radial background
- Update floating particles: mix in gold-toned particles (every 4th particle)

### 2. Gate Components
- **`src/components/gate/AICoreOrb.tsx`** — Replace all `rgba(200,162,74,...)` → `rgba(212,168,67,...)`
- **`src/components/gate/GateBrandPortal.tsx`** — Shift accent lines and borders from pure neon-purple to gold-tinted (use `--gold` variable alongside purple)

### 3. Remaining Old Gold References
- **`src/components/admin/layout/views/AnalyticsView.tsx`** — `hsl(42 50% 54%)` → `hsl(40 62% 56%)`
- **`src/components/admin/loyalty/LoyaltyAnalytics.tsx`** — 2 remaining `hsl(42 50% 54%)` in chart strokes
- **`src/components/dashboard/DashboardHeader.tsx`** — `rgba(200,162,74,0.15)` → `rgba(212,168,67,0.15)`
- **`src/components/dashboard/GuestsList.tsx`** — 2 shadow references
- **`src/components/dashboard/MetricCard.tsx`** — 2 shadow references
- **`src/components/ui/crystal-medallion.tsx`** — 2 glow shadow references
- **`src/components/ui/reward-card.tsx`** — 1 hover shadow
- **`src/components/ui/input.tsx`** — focus ring `hsl(42 50% 54%)` → `hsl(40 62% 56%)`

## Files to Edit (11 files)
1. `src/pages/Gate.tsx`
2. `src/components/gate/AICoreOrb.tsx`
3. `src/components/gate/GateBrandPortal.tsx`
4. `src/components/admin/layout/views/AnalyticsView.tsx`
5. `src/components/admin/loyalty/LoyaltyAnalytics.tsx`
6. `src/components/dashboard/DashboardHeader.tsx`
7. `src/components/dashboard/GuestsList.tsx`
8. `src/components/dashboard/MetricCard.tsx`
9. `src/components/ui/crystal-medallion.tsx`
10. `src/components/ui/reward-card.tsx`
11. `src/components/ui/input.tsx`

