

# Plan: Add Live Motion to Dashboard AI Core

## Current State
The AI core has a basic CSS `breathe` animation (scale 1 → 1.04) and static concentric circles. The dashboard background is static with no ambient motion.

## Changes

### 1. `src/components/admin/vessel/VesselCommandInterface.tsx` — Enhanced AI Core Motion

Replace the static CSS-only AI core (lines 418-445) with a richer animated version:

- **Orbiting gold particles**: 6-8 tiny dots orbiting the core circle at different radii and speeds using CSS keyframe animations
- **Concentric pulse rings**: 3 rings that expand outward from the core and fade (like sonar), continuously looping with staggered delays
- **Reactive glow intensification**: When `isLoading` (processing) or `isListening`, increase glow radius and pulse speed
- **Floating status indicators**: The "Online" and "Tools Active" dots get a subtle pulse animation

Add new keyframes:
- `orbitDot` — circular orbit path
- `sonarPulse` — ring expands from core center and fades out  
- `statusPulse` — gentle opacity pulse for status dots
- `shimmer` — subtle gold shimmer sweep across the "RISE ONE" text

### 2. `src/pages/AdminPanel.tsx` — Ambient Background Motion

Add subtle ambient motion to the dashboard background:

- **Floating light particles**: A lightweight CSS-based particle layer (8-12 small champagne gold dots) that drift slowly upward with varying speeds and opacity, using CSS animations (no canvas/JS overhead)
- **Slow gradient drift**: The warm glow radial gradient slowly shifts position using a CSS animation (subtle, 20s cycle)

### 3. Processing & Listening States

When AI is processing (`isLoading=true`):
- Core pulse speeds up (2s instead of 4s)
- Sonar rings pulse faster
- Outer glow intensifies
- Add a thin rotating arc segment around the core (loading indicator feel)

When listening (`isListening=true`):
- Core glow shifts to slightly warmer/brighter gold
- Orbit particles speed up
- Waveform bars already exist — keep those

All animations pure CSS. No Three.js. No heavy dependencies. Matches the bright executive minimalism.

