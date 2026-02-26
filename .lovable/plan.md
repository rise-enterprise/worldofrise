

## Problem

The Day/Night mode toggle in `SystemStatusBar.tsx` is wrapped in a `hidden sm:flex` container (line ~95), making it invisible on mobile screens.

## Plan

**File: `src/components/admin/vessel/SystemStatusBar.tsx`**

Move the Day/Night toggle button out of the `hidden sm:flex` right section and make it visible on mobile. Two options:

1. Change the right section from `hidden sm:flex` to `flex` so the toggle and clock both show on mobile.
2. Or, keep the clock hidden on mobile but show just the toggle button.

I'll go with option 2 — show the toggle on mobile, keep the clock desktop-only. The right container becomes `flex items-center gap-3` (always visible), and the clock `<span>` gets `hidden sm:inline`.

**Specific change (~line 95-107):**
- Change `"hidden sm:flex items-center gap-3"` → `"flex items-center gap-2 sm:gap-3 shrink-0"`
- Add `hidden sm:inline` to the clock `<span>` (already has it, but verify)
- Make the toggle button slightly smaller on mobile with responsive text/padding

