

# Batman / Iron Man HUD Dashboard Background

## Current State
The 3D background is a cosmic starfield with a central gold orb and orbiting metric rings — feels like deep space. The user wants a tactical tech-HUD aesthetic like the Batcave computer or Jarvis/F.R.I.D.A.Y. interface from Iron Man.

## Visual Direction
Shift from "deep space observatory" to "tactical command HUD":
- **Holographic grid floor** — a glowing wireframe grid plane receding into depth (Iron Man war room feel)
- **HUD ring arcs** — concentric rotating arc segments around the AI core (like Jarvis's circular HUD)
- **Hex grid backdrop** — subtle hexagonal pattern behind the scene
- **Scanning sweepline** — a rotating radar-style scan line
- **Data stream particles** — vertical rising data particles instead of scattered stars (like the Batcave data walls)
- **Cyan + gold palette** — mix cyan (#00d4ff) with the existing gold for that tech-luxury hybrid
- **Ambient scan lines** — subtle horizontal scanlines overlay via CSS

## Files to Change

### 1. `src/components/admin/vessel/StarField.tsx` → Complete rewrite as `HUDGrid.tsx`
Replace the random star scatter with:
- A **wireframe grid floor** (PlaneGeometry with wireframe material) tilted at perspective, glowing cyan/gold
- **Vertical data stream particles** — narrow columns of rising dots (like Matrix rain but subtle and gold/cyan)
- **Floating hex particles** — small hex shapes drifting slowly

### 2. `src/components/admin/vessel/AICoreOrb.tsx` → Add HUD ring arcs
Keep the core sphere but add:
- 3-4 **flat arc segments** (partial torus geometries) at different radii, rotating at different speeds — the Jarvis circular HUD look
- **Bracket markers** — small line segments at cardinal points on rings
- Slightly more **cyan glow** mixed with gold

### 3. `src/components/admin/vessel/InterstellarScene.tsx` → Update lighting + add new components
- Replace `StarField` import with new `HUDGrid`
- Add **more directional lighting** with cyan tones
- Add a **scanning sweep plane** — a thin rotating triangular slice that sweeps 360° like a radar
- Update fog color to darker blue-black

### 4. `src/pages/AdminPanel.tsx` → Add CSS scanline overlay
- Add a CSS-only horizontal scanline overlay (`repeating-linear-gradient`) over the entire viewport for that CRT/holographic monitor feel
- Very subtle opacity (0.02-0.03) so it doesn't interfere with readability

### 5. New file: `src/components/admin/vessel/HUDGrid.tsx`
The replacement for StarField — contains:
- Wireframe grid floor
- Rising data particles
- Ambient floating elements

### 6. New file: `src/components/admin/vessel/ScanSweep.tsx`
A rotating radar sweep plane component

## Technical Details

| Element | Implementation |
|---|---|
| Grid floor | `PlaneGeometry(40,40,40,40)` + `MeshBasicMaterial({ wireframe: true, color: "#00d4ff", opacity: 0.08 })` rotated -90° on X, positioned at y=-3 |
| HUD arcs | `TorusGeometry` partial arcs (0.3-0.8 of full circle) at radii 1.8-3.5 with varying rotation speeds |
| Data streams | `Points` with positions in narrow vertical columns, animated upward with modulo wrap |
| Scan sweep | `PlaneGeometry` shaped as thin wedge, additive blended, rotating on Y axis at ~0.3 rad/s |
| Scanlines CSS | `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,212,255,0.03) 2px, rgba(0,212,255,0.03) 4px)` |
| Color shift | Gold `#C8A24A` stays for core, add cyan `#00d4ff` for grid/arcs/scan elements |

All changes maintain 60fps — wireframe grids and points are GPU-cheap. No new dependencies needed.

