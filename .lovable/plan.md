

# Redesign Metric Data Display — Static HUD Panels Instead of Orbiting Rings

## Problem
The 7 metric arcs orbit around the AI core and individually rotate, making them hard to read. The data is constantly moving, which kills readability and feels more like a screensaver than a command dashboard.

## Solution
Replace the orbiting 3D `MetricRings` with a **fixed holographic HUD panel layout** — metrics arranged in a clean semicircular arc below the AI core, facing the camera (billboard), with subtle breathing animations but **no rotation**. Think Iron Man's Jarvis readouts: stationary, glowing, always readable.

## Visual Design

```text
              ╭── AI Core Orb ──╮
              │    ◉ (sphere)    │
              ╰─────────────────╯
                                    
    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
    │ MEM │ │ VIS │ │ VIP │ │ RET │ │ CHR │
    │ 245 │ │  38 │ │  12 │ │ 78% │ │   5 │
    │ ═══ │ │ ═══ │ │ ═══ │ │ ═══ │ │ ═══ │
    └─────┘ └─────┘ └─────┘ └─────┘ └─────┘
                 ┌─────┐ ┌─────┐
                 │NOIR │ │SASSO│
                 │  22 │ │  16 │
                 └─────┘ └─────┘
```

Each metric panel:
- A small **progress bar** (horizontal line) instead of a torus arc — much clearer at a glance
- **Billboard text** (always faces camera) via drei's `<Billboard>` wrapper
- Gentle **vertical float** (breathing) animation — no rotation
- Additive blended glow backing for the holographic feel
- Crisis mode turns all bars red with a pulse

## File Changes

### 1. Rewrite `src/components/admin/vessel/MetricRings.tsx`

**Remove**: Orbiting torus arcs, per-item rotation, circular layout at radius 4.

**New layout**:
- 7 metrics arranged in **two rows**: top row of 5, bottom row of 2, centered below the orb
- Each metric is a `<Billboard>` group containing:
  - A label (`<Text>` — small caps, muted color)
  - A value (`<Text>` — larger, colored)
  - A thin horizontal bar background (dark `<mesh>` plane)
  - A filled bar foreground (colored `<mesh>` plane, width = percentage)
- Positioned at y = -2 to -3 range (below the orb)
- Subtle vertical sine-wave breathing per card (amplitude 0.05, no rotation)
- The parent group does **not rotate**

### 2. No other file changes needed
`InterstellarScene.tsx` already renders `<MetricRings>` — the component signature stays the same (`metrics` array + `isCrisis`).

## Technical Details

| Aspect | Detail |
|---|---|
| Layout | 2 rows: 5 top + 2 bottom, evenly spaced horizontally |
| Position | y = -2 (top row), y = -3 (bottom row), z = 0 |
| Billboarding | `<Billboard>` from drei — always faces camera |
| Bar size | 0.8 wide × 0.04 tall planes |
| Animation | Gentle y-axis sine float (0.05 amplitude), no rotation |
| Text | drei `<Text>` — label at 0.08 size, value at 0.14 size |
| Crisis | All bar colors → `#ff4444`, value text pulses opacity |
| Performance | Fewer draw calls than current (no torus geometries) |

