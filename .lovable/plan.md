

# Plan: Add Dark & Day Mode to RISE ONE

## Overview

The entire admin dashboard and gate currently use hardcoded light colors (`#faf8f5`, `#1a1510`, `#ffffff`, etc.). This plan makes all components theme-aware so toggling dark/light mode applies consistently everywhere.

## Approach

Use a CSS class-based theme (`dark`/`light` on `<html>`) with CSS custom properties. The existing `.light` and `.dark` CSS variable definitions in `index.css` already exist. We'll add a `ThemeToggle` button to the admin status bar and replace all hardcoded hex colors with CSS variable references or conditional logic.

## Dark Mode Palette (for admin/vessel components)

```text
DAY (default):     Background #faf8f5 · Surface #ffffff · Text #1a1510 · Muted #8a7d6a · Gold #C8A24A
DARK (velvet noir): Background #0c0b10 · Surface #16151c · Text #f0ece4 · Muted #8a8578 · Gold #C8A24A
```

## Files to Edit

### 1. `src/index.css` — Update dark mode variables
- Update `:root` and `.dark` block to use velvet noir palette (`#0c0b10` background, `#16151c` surface, `#f0ece4` foreground)
- Keep `.light` block as the pearl/sand palette (already correct)
- Add `--vessel-bg`, `--vessel-surface`, `--vessel-text`, `--vessel-muted`, `--vessel-gold` custom properties in both modes for the admin vessel components

### 2. `src/components/admin/vessel/SystemStatusBar.tsx` — Theme toggle + dark support
- Import and add `ThemeToggle` button between model selector and metrics
- Replace hardcoded `backgroundColor: "rgba(255,255,255,0.85)"` with theme-aware value
- Replace hardcoded text colors (`#1a1510`, `#8a7d6a`) with CSS variables
- Use `document.documentElement.classList.contains('dark')` or a small hook to detect theme

### 3. `src/pages/AdminPanel.tsx` — Theme-aware backgrounds
- Replace hardcoded `#faf8f5` background with `var(--vessel-bg)`
- Replace gradient colors with CSS variable references
- Adjust particle opacity for dark mode (brighter gold particles on dark)

### 4. `src/components/admin/vessel/VesselCommandInterface.tsx` — Dark mode support
- Replace all hardcoded inline colors with CSS variable references:
  - `#1a1510` text → `var(--vessel-text)`
  - `#8a7d6a` muted → `var(--vessel-muted)`
  - `#ffffff` surfaces → `var(--vessel-surface)`
  - Input bar background adapts to dark
- AI core glow intensifies slightly in dark mode (more visible gold glow on dark surface)

### 5. `src/components/admin/copilot/CopilotMessage.tsx` — Dark message panels
- Assistant bubble: `#ffffff` → `var(--vessel-surface)` with appropriate border
- Code block background: `#f3efe8` → theme-aware sand/dark surface
- Bold text color: `#1a1510` → `var(--vessel-text)`
- Body text: `#3a3530` → `var(--vessel-text)` with slight opacity

### 6. `src/pages/Gate.tsx` — Dark gate background
- Replace `#faf8f5` with `var(--vessel-bg)`
- Gradient adapts: dark mode uses velvet black gradients with champagne gold glow
- CTA buttons adjust for dark background (gold on dark = more contrast)
- Login form background adapts

### 7. `src/components/ui/theme-toggle.tsx` — Default to light
- Change default from `'dark'` to `'light'` to match RISE ONE bright executive identity

## Implementation Detail

Create a small `useThemeMode()` hook or use inline detection (`typeof window !== 'undefined' && document.documentElement.classList.contains('dark')`) with a state listener for reactivity. This avoids adding a new context — the CSS variables handle most of the work, and only components with inline `style={}` props need JS-level awareness.

## Motion

Dark mode: particles glow brighter, AI core gold glow more prominent. Day mode: subtle, calm as current. Transition between modes: 300ms CSS transition on background/color properties (already set in `index.css` body transition).

