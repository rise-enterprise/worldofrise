

# Plan: Upgrade AI Look & Feel

## Problem
The AI chat view (RISE AI tab) looks functional but not premium. The empty state orb animation is decent but the overall experience lacks the cinematic, dark-luxury feel you want — more like a basic chat widget than an executive intelligence system.

## Changes

### 1. `src/components/admin/layout/views/AIChatView.tsx` — Cinematic AI Hub
- Remove the plain header with basic text
- Add a full-bleed dark container with subtle ambient background glow (radial gold gradient at low opacity)
- Add a top status bar showing AI model, connection status dot, and conversation count
- Make the wrapper feel immersive — no visible borders, seamless dark background

### 2. `src/components/admin/vessel/VesselCommandInterface.tsx` — Elevated Empty State & Input
- **Empty state**: Enlarge the AI core orb from 200px to 240px, add a second concentric ring with counter-rotation, add a subtle grid pattern behind the orb (like a HUD), intensify gold glow and particle count
- **Title treatment**: Make "RISE ONE" larger with a slow gold gradient sweep animation, add a tagline fade-in effect
- **Example commands**: Redesign from plain text buttons to glass cards with icons and subtle hover glow effects — 2-column grid instead of wrapped inline
- **Input bar**: Add a subtle gold gradient border on focus, increase padding, add a typing indicator glow, make the send button pulse gold when ready
- **Active chat**: Add a thin ambient gold line separator between messages, increase message spacing for breathing room

### 3. `src/components/admin/copilot/CopilotMessage.tsx` — Premium Message Bubbles
- Assistant messages: Add a subtle left gold accent bar (2px), increase padding, add a faint radial gold glow behind the "R" avatar
- User messages: Slightly darker background with cleaner borders
- Streaming indicator: Replace simple pulse with a 3-dot wave animation
- Code blocks: Darker background with gold-tinted border and a copy button
- Add entrance animation (fade-up) for new messages using CSS

### 4. `src/components/admin/copilot/CopilotInsightCards.tsx` — Glass Insight Cards
- Apply dark glass styling (`backdrop-blur`, `bg-white/5`) instead of colored backgrounds
- Add a subtle gold top-edge line on each card
- Make cards slightly larger with better typography hierarchy

### 5. `src/components/admin/copilot/CopilotQuickActions.tsx` — Premium Action Pills
- Dark glass pill style with gold border on hover
- Add subtle icon glow effect
- Stagger entrance animation

## Visual Targets
- Deep black ambient backgrounds with radial gold glow accents
- Glass morphism on all cards and containers
- Gold accent lines and borders throughout
- Smooth 300ms transitions on all interactions
- The AI view should feel like entering an intelligence command center, not opening a chat window

