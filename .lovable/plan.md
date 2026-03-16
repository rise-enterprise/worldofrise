

# Plan: Apply Warmer Champagne Gold Everywhere

The previous update only changed CSS variables and two files. There are still **16 files** with the old gold `#C8A24A` / `rgba(200,162,74)` / `hsl(42 50-56%)` hardcoded. This plan replaces all of them with the new warmer champagne gold.

## Color Map

| Old | New | Where |
|---|---|---|
| `#C8A24A` | `#D4A843` | All hardcoded hex references |
| `#d4b86a` | `#E0C06A` | Light gold variant |
| `rgba(200, 162, 74, ...)` | `rgba(212, 168, 67, ...)` | Tailwind shadows, email templates |
| `hsl(42 50% 54%)` | `hsl(40 62% 56%)` | CSS gradient classes |
| `hsl(42 55% 65%)` | `hsl(38 65% 67%)` | Gradient light stops |
| `hsl(42 60% 45%)` | `hsl(40 68% 47%)` | Gradient dark stops |
| `hsl(42 50% 50%)` | `hsl(40 62% 52%)` | bg-gradient-gold |
| `hsl(42 60% 40%)` | `hsl(40 68% 42%)` | bg-gradient-gold dark |
| `--vessel-gold: 42 56% 53%` | `40 62% 56%` | CSS vessel tokens |

## Files to Edit (14 files)

### CSS & Config
1. **`src/index.css`** — `--vessel-gold` tokens (light + dark), `.gold-gradient-text`, `.text-gradient-gold`, `.bg-gradient-gold`
2. **`tailwind.config.ts`** — All `rgba(200, 162, 74, ...)` in boxShadow and keyframes

### Admin Loyalty
3. **`src/components/admin/loyalty/LoyaltyAnalytics.tsx`** — Gold tier color + chart strokes
4. **`src/components/admin/loyalty/LoyaltyTiers.tsx`** — Gold tier color
5. **`src/components/admin/loyalty/LoyaltyMultiBrand.tsx`** — Brand accent strip
6. **`src/components/admin/loyalty/LoyaltyDigitalCard.tsx`** — Default accent color

### 3D Vessel Components
7. **`src/components/admin/vessel/ScanSweep.tsx`** — mesh colors
8. **`src/components/admin/vessel/HUDGrid.tsx`** — wireframe + particle colors
9. **`src/components/admin/vessel/RISECoreEmblem.tsx`** — ring/text colors
10. **`src/components/admin/vessel/GlobalCommandMap.tsx`** — globe + beam colors
11. **`src/components/admin/vessel/AIResponseMetrics.tsx`** — accent + line colors
12. **`src/components/admin/vessel/AICoreOrb.tsx`** — particle base color

### Admin Map
13. **`src/components/admin/map/InteractiveMap.tsx`** — brand color map

### Email Templates (edge functions)
14. **`supabase/functions/handle-invitation-action/index.ts`** — all `#C8A24A` and `rgba(200,162,74,...)`
15. **`supabase/functions/notify-invitation-request/index.ts`** — all `#C8A24A` and `rgba(200,162,74,...)`

## Approach
Global find-and-replace within each file. No logic changes — purely color value swaps.

