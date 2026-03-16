

# Plan: Warmer, Richer Champagne Gold Across the Entire UI

## What Changes

### `src/index.css` — Shift all gold HSL tokens warmer & richer

**Dark mode (`:root`)**
| Token | Current | New | Effect |
|---|---|---|---|
| `--primary` | `42 50% 54%` | `40 62% 56%` | Warmer hue, higher saturation, slightly brighter |
| `--gold` | `42 50% 54%` | `40 62% 56%` | Match primary |
| `--gold-light` | `42 55% 70%` | `38 65% 72%` | Richer champagne shimmer |
| `--gold-shadow` | `42 60% 26%` | `36 70% 28%` | Deeper warm amber shadow |
| `--gold-foil` | `45 65% 58%` | `42 72% 60%` | More saturated foil |
| `--ring` | `42 50% 54%` | `40 62% 56%` | Match primary |
| `--chart-1` | `42 50% 54%` | `40 62% 56%` | Match primary |
| `--tier-royal` | `42 60% 50%` | `40 68% 52%` | Richer royal gold |
| `--tier-black` | `42 50% 54%` | `40 62% 56%` | Match |
| `--sidebar-primary` | `42 50% 54%` | `40 62% 56%` | Match |
| `--sidebar-ring` | `42 50% 54%` | `40 62% 56%` | Match |

**Light mode (`.light`)**
| Token | Current | New |
|---|---|---|
| `--primary` | `42 60% 42%` | `38 68% 44%` |
| `--ring` | `42 60% 42%` | `38 68% 44%` |
| `--gold` | `42 60% 42%` | `38 68% 44%` |
| `--gold-light` | `42 50% 75%` | `38 60% 76%` |
| `--gold-shadow` | `42 50% 60%` | `36 58% 58%` |
| `--accent` | `42 40% 92%` | `38 50% 92%` |
| `--sidebar-primary` | `42 60% 42%` | `38 68% 44%` |

### `src/contexts/VesselThemeContext.tsx`
- Update `accent` from `#C8A24A` to `#D4A843` (warmer champagne)
- Update `accentLight` from `#d4b86a` to `#E0C06A` (richer light gold)

### `src/components/admin/hud/HUDMetricGauge.tsx`
- Shift gold color map from `hsl(42, 50%, 54%)` to `hsl(40, 62%, 56%)`

**Single-file CSS variable change ripples through every component** — buttons, badges, cards, charts, borders, focus rings, gradients, and shadows all inherit the warmer gold automatically.

## Files to Edit
- `src/index.css` (token updates in `:root` and `.light`)
- `src/contexts/VesselThemeContext.tsx` (2 hex values)
- `src/components/admin/hud/HUDMetricGauge.tsx` (1 color map entry)

