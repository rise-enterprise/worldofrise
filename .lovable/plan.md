
## Add Day/Night Mode Toggle to Dashboard

Add the existing `ThemeToggle` component to the Dashboard header, placed alongside the Language Switcher for easy access.

### What will change

- **DashboardHeader.tsx**: Import and render the `ThemeToggle` component in the header's action bar, positioned right before the Language Switcher
- The toggle will use the existing theme switching logic (already built in `src/components/ui/theme-toggle.tsx`) which handles `light`/`dark` class toggling and `localStorage` persistence

### Technical details

1. **File: `src/components/dashboard/DashboardHeader.tsx`**
   - Add import: `import { ThemeToggle } from '@/components/ui/theme-toggle';`
   - Insert `<ThemeToggle />` before the `<LanguageSwitcher />` on line 154, styled to match the existing header icon buttons

No new components or dependencies needed -- the `ThemeToggle` component already exists and handles everything.
