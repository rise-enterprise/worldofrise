

# Plan: iOS 26-Level Mobile Optimization for RISE AI Chat

## Problem
At 390px viewport, the admin layout shows a permanent sidebar stealing ~60-224px, the AI chat status bar overflows, the avatar is too large, command cards are cramped, and the input bar lacks proper safe-area padding. None of this matches modern iOS design language.

## Changes

### 1. `AdminDashboardLayout.tsx` — Mobile Bottom Tab Bar
- Hide the sidebar entirely on mobile (`useIsMobile`)
- Add an iOS-style bottom tab bar with frosted glass backdrop, safe-area bottom padding, and a prominent center "RISE AI" brain icon
- Active tab gets a subtle purple pill highlight (like iOS 26 tab bar)
- Tab bar uses `pb-safe` for iPhone home indicator

### 2. `AIChatView.tsx` — Streamlined Mobile Status Bar
- On mobile: condense to just the status dot + state label, hide "Neural Active" and "Stream" labels
- Reduce padding to `px-4 py-2`
- Make the view use `h-[100dvh]` minus tab bar height on mobile for proper viewport handling

### 3. `VesselCommandInterface.tsx` — Full Mobile Redesign
- **Avatar**: `size="md"` (192px) on mobile instead of `lg` (280px), reduce bottom margin
- **Title**: Scale down to `text-xl` on mobile
- **Command cards**: Single column on mobile with compact height, full-width tap targets (44px min)
- **Input bar**: 
  - Bottom-anchored with `pb-safe` padding
  - Hide attachment/TTS buttons behind a "+" expand button to save space
  - Larger touch targets (44x44px minimum) per iOS HIG
  - `env(safe-area-inset-bottom)` padding
- **Chat messages**: Full-width on mobile, reduce side padding to `px-3`
- **Quick actions**: Horizontal scroll with snap behavior
- **Compact avatar in chat mode**: `size="sm"` stays, reduce vertical space

### 4. `AIAvatar.tsx` — Mobile Size Tier
- Add `size="md"` mobile-optimized preset: 160px (between sm and lg)
- Reduce particle count to 18 on mobile for performance
- Scale corner brackets proportionally
- Reduce sound wave arc sizes for smaller viewports

### 5. `CopilotMessage.tsx` — iOS-Style Chat Bubbles
- On mobile: full-width bubbles, slightly larger text (14px), rounded-2xl corners
- Reduce avatar size in messages
- Add haptic-feel active state on touch

## Visual Direction
- Frosted glass (`backdrop-blur-2xl saturate-150`) everywhere — status bar, input bar, tab bar
- System-level transitions: spring-based easing via `cubic-bezier(0.2, 0.8, 0.2, 1)`
- Dynamic Island-inspired status indicator at top
- Large typography hierarchy matching SF Pro spacing
- Safe area respect on all edges
- Smooth keyboard avoidance for input

## Files to Edit
- `src/components/admin/layout/AdminDashboardLayout.tsx`
- `src/components/admin/layout/views/AIChatView.tsx`
- `src/components/admin/vessel/VesselCommandInterface.tsx`
- `src/components/admin/ai/AIAvatar.tsx`
- `src/components/admin/copilot/CopilotMessage.tsx`

