

# Add Day/Night Mode Toggle to NOIR AI HUD

## Overview

Add a theme toggle (day/night mode) to the HUD status bar so admins can switch between the dark "Private Viewing Room" aesthetic and the light "Crystal Daylight" mode. The light mode CSS variables already exist in `index.css` -- the HUD just lacks a toggle button.

## What Changes

### 1. Update `HUDStatusBar.tsx`

Add the `ThemeToggle` component (already exists at `src/components/ui/theme-toggle.tsx`) into the status bar's right-side controls, positioned between the status indicators and the clock. This keeps all control in the HUD bar without adding traditional navigation.

The toggle will use the existing Sun/Moon icon animation with smooth transitions.

### 2. No other changes needed

- The light mode CSS variables are already fully defined in `index.css` (lines 159-210+)
- The `ThemeToggle` component already handles `localStorage` persistence and `document.documentElement` class toggling
- All HUD components use theme-aware tokens (`bg-background`, `text-foreground`, `bg-card`, `text-primary`, `border-border`, `text-muted-foreground`) so they will adapt automatically

## Technical Details

### File to modify

| File | Change |
|---|---|
| `src/components/admin/hud/HUDStatusBar.tsx` | Import `ThemeToggle`, render it in the right-side controls area between the status badges and the clock |

### Implementation

Add the ThemeToggle between the "Connected" indicator and the clock, styled to match the HUD's compact aesthetic (`h-6 w-6` icon sizing, muted foreground color). One line import, one line JSX insertion.

