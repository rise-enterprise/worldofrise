

# Add Futuristic Ripple Animation to Mic Button

## Overview

Add concentric ripple rings that emanate outward from the mic button while listening, creating a cinematic "active voice" effect. This is a CSS-only approach using keyframe animations — no new dependencies.

## What Changes

### 1. `src/index.css` — Add ripple keyframes

Add a `@keyframes micRipple` animation that scales up and fades out concentric rings. Three rings at staggered delays create a sonar/pulse effect.

### 2. `src/components/admin/hud/AICommandCenter.tsx` — Wrap mic button with ripple rings

When `isListening` is true, render 3 absolutely-positioned `<span>` elements behind the mic button icon. Each span is a ring (border-only circle) that scales outward and fades using the `micRipple` keyframe at staggered `animation-delay` values (0s, 0.4s, 0.8s). When not listening, the spans are not rendered.

## Technical Details

| Aspect | Detail |
|---|---|
| Animation | 3 concentric rings scale from 100% to 250% while fading from 0.6 to 0 opacity, 1.6s infinite loop |
| Stagger | Ring 1: 0s delay, Ring 2: 0.4s, Ring 3: 0.8s — creates continuous sonar pulse |
| Color | `border-primary/40` (gold tint) when listening, matching the HUD aesthetic |
| Positioning | `absolute inset-0` inside the mic button wrapper with `overflow-visible` so rings extend beyond the button bounds |
| Files modified | `src/index.css` (keyframe), `src/components/admin/hud/AICommandCenter.tsx` (3 span elements + relative wrapper) |

