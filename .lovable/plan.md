

# Plan: Replace Cheap 3D Primitive Head with Enhanced Image-Based Avatar

## Problem
The current `HolographicAvatar3D` component builds a "face" from raw Three.js spheres, boxes, and planes — resulting in a crude, geometric look that feels cheap and amateurish. A realistic humanoid cannot be achieved with primitive shapes alone.

## Solution
Remove the 3D primitive head entirely. Revert to using the **existing AI portrait image** (`ai-avatar.png`) via the proven `AIAvatar` component, which already has polished CSS effects (neon rim lights, scanning rings, breathing animation, mouth glow, holographic overlays, sound-reactive arcs). Then enhance it with additional premium effects.

## Changes

### 1. `src/components/admin/vessel/VesselCommandInterface.tsx`
- Replace all `HolographicAvatar3D` imports/usage with `AIAvatar`
- Both the large centerpiece (empty state) and compact chat-mode avatar switch back to `AIAvatar`
- Pass existing props: `state`, `audioLevel`, `onClick`, `clickLabel`, `size`

### 2. `src/components/admin/ai/AIAvatar.tsx` — Premium Enhancements
- **Holographic frame**: Add a thin futuristic border frame with corner brackets and subtle animated edge glow (neon purple/cyan)
- **Neural particle field**: Increase particle count and add subtle connecting lines between nearby particles for a "neural network" feel
- **Depth layers**: Add a subtle parallax-style secondary glow layer behind the image that shifts slightly with state changes
- **Speaking enhancement**: Improve the mouth glow with a pulsing horizontal light band that widens/narrows with audio level, plus a soft jaw-area illumination
- **Thinking enhancement**: Add rotating scan arcs (partial circles) around the avatar during thinking state
- **Premium glass overlay**: Layered holographic gradient that slowly shifts, giving a "live hologram projection" feel
- **Cursor-reactive glow**: Subtle glow shift based on mouse position over the avatar area

### 3. Delete `src/components/admin/ai/HolographicAvatar3D.tsx`
- Remove the unused crude 3D component entirely

## Result
The avatar will use the high-quality portrait image with sophisticated layered CSS/JS effects — looking premium and alive without the uncanny-valley problem of primitive 3D geometry.

