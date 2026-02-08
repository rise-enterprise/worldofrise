

## Fix Day Mode: Replace All Hardcoded Dark Colors with Theme-Aware Variables

The dashboard has hundreds of hardcoded dark hex colors (`#0B0D11`, `#0E1116`, `#07080A`, etc.) scattered across ~11 component files and CSS utility classes. These don't respond to the light/dark theme toggle, causing black areas to persist in day mode.

### Strategy

Replace all hardcoded dark colors with CSS variable-based equivalents that automatically adapt to the active theme.

### Color Mapping

| Hardcoded Dark Color | Replacement |
|---|---|
| `#07080A` / `hsl(220 14% 4%)` | `bg-background` or `hsl(var(--background))` |
| `#0B0D11` / `hsl(220 12% 5%)` | `bg-muted` or `hsl(var(--muted))` |
| `#0E1116` / `hsl(220 12% 7%)` | `bg-card` or `hsl(var(--card))` |
| `rgba(217,222,231,0.08)` borders | `border-border/30` or similar |

### Files to Update

**1. CSS Utility Classes (`src/index.css`)**
- `.obsidian-panel` -- replace hardcoded `hsl(220 12% 9%)` / `hsl(220 12% 6%)` with `hsl(var(--card))` 
- `.bg-gradient-luxury` -- replace with CSS variable-based gradient
- `.bg-gradient-card` -- replace with CSS variable-based gradient
- `.bg-gradient-crystal` -- replace with CSS variable-based gradient
- `.noir-gradient` / `.noir-gradient-radial` -- replace with CSS variable-based equivalents

**2. Dashboard Components (replace `bg-[#0B0D11]`, `bg-[#0E1116]`, `bg-[#07080A]`, `from-[#0B0D11]`, `to-[#0E1116]` with theme tokens):**
- `MetricCard.tsx` -- icon container gradient
- `TierDistribution.tsx` -- progress bar background
- `GuestsList.tsx` -- search input, avatar fallback
- `GuestProfile.tsx` -- page background, header, badges, dialog, tabs, cards (~30+ instances)
- `AnalyticsView.tsx` -- icon containers, list items
- `CMSView.tsx` -- tabs, inputs, settings rows, upload areas
- `RewardsManagement.tsx` -- dialog, inputs, selects
- `NotificationsView.tsx` -- hardcoded dark backgrounds
- `SettingsView.tsx` -- hardcoded dark backgrounds
- `EventsView.tsx` -- hardcoded dark backgrounds
- `PrivilegesView.tsx` -- hardcoded dark backgrounds
- `AdminsView.tsx` -- hardcoded dark backgrounds

**3. CrystalBackground.tsx**
- The base gradient layer uses `from-background` which is good, but `to-accent/20` may need checking

### Approach

- All `bg-[#0B0D11]` becomes `bg-muted` (adapts per theme)
- All `bg-[#0E1116]` becomes `bg-card` (adapts per theme)
- All `bg-[#07080A]` becomes `bg-background` (adapts per theme)
- All `from-[#0B0D11] to-[#0E1116]` gradients become `from-muted to-card`
- All `border-[rgba(217,222,231,0.08)]` becomes `border-border/30`
- CSS gradient utilities get updated to use `hsl(var(--card))` and `hsl(var(--background))` instead of hardcoded HSL values

This is a systematic find-and-replace across all affected files. The light mode CSS variables are already defined in `index.css` and will provide proper light colors automatically once the hardcoded values are removed.

