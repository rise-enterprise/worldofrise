

# Enlarge Metric Panels + Add Holographic Border Glow

## Changes — Single file: `MetricRings.tsx`

### Size Increases
- `BAR_WIDTH`: 0.8 → **1.1**
- `BAR_HEIGHT`: 0.04 → **0.055**
- Glow backdrop: `[1, 0.7]` → **`[1.4, 0.9]`**
- Label fontSize: 0.07 → **0.09**
- Value fontSize: 0.16 → **0.22**
- Label position y: 0.18 → **0.24**
- Value position y: 0.02 → **0.02** (stays)
- Bar position y: -0.15 → **-0.2**
- Row spacing: 1.6 → **1.9** (to accommodate wider panels)

### Border Glow Outline
Add **two layered border rectangles** behind each panel using `EdgesGeometry` on a `PlaneGeometry` — renders as a glowing wireframe outline:

1. **Inner border** — thin bright line matching the metric color, opacity ~0.25
2. **Outer border** — slightly larger, same color, opacity ~0.08, additive blended — creates the "glow halo" effect

Both use `lineBasicMaterial` with the metric's color (or red in crisis mode). The outer glow pulses subtly via `useFrame`.

### Implementation
- Add a `borderRef` for the outer glow mesh to animate its opacity
- Inner border: `EdgesGeometry` on `PlaneGeometry(1.3, 0.8)` at z=-0.005
- Outer glow border: `EdgesGeometry` on `PlaneGeometry(1.4, 0.9)` at z=-0.008, additive blended

No new files or dependencies needed.

