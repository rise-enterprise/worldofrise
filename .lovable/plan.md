
## Master Control Admin Panel -- New `/admin` Route

Build a separate SevenRooms-style "Master Control" admin panel at `/admin` with a fully expandable sidebar and placeholder views for all sections. The existing `/dashboard` remains untouched.

---

### Architecture

- **New route**: `/admin` in `App.tsx` (lazy-loaded)
- **New page**: `src/pages/AdminPanel.tsx` -- layout shell with sidebar + content area
- **New sidebar**: `src/components/admin/AdminSidebar.tsx` -- expandable, collapsible sections with the SevenRooms-style navigation structure
- **New placeholder**: `src/components/admin/AdminPlaceholder.tsx` -- reusable placeholder component for unbuilt sections
- **New header**: `src/components/admin/AdminHeader.tsx` -- top bar with global search, publish button, activity log trigger, theme/language toggles

---

### Sidebar Structure (Expandable Sections)

Each top-level section is a collapsible group. Clicking a sub-item sets the active view.

```text
RISE (Logo)
-----
FLOORPLAN
  Floorplan Layouts
  Rooms
  Seating Areas
  Tables
  Table Combinations
  Reservation Statuses

PEOPLE
  User Accounts
  Booked By Names
  Server Names

GUEST-FACING LANGUAGE
  Widgets
  Pages
  Emails
  Text Content
  Policies
  Language Settings

GENERAL
  Venue Settings
  Client Tags
  Reservation Tags
  Tax Rates

INTEGRATIONS
  Payment Processors
  Email Service Providers
  Point of Sale
  Messaging Providers

AVAILABILITY
  Shifts
  Access Rules
  Daily Program
  Blackout Dates
  Availability Quick View
  Shift Reporting Periods

WIDGET SETTINGS
  Reservation Widget
  Event Widget
  Waitlist Widget
  Subscription Widget
  Landing Page Settings
  Custom Audiences

ORDERING
  Ordering Sites
  Menu Management
  Product Inventory
```

---

### Design Approach

- **Crystal DNA aesthetic** -- same luxury glass morphism, gold accents, `CrystalPageWrapper` with `ambient` variant
- **Dark + Light mode** -- inherits the existing theme system via `ThemeToggle`
- **Responsive** -- uses `useIsMobile` / `useIsTablet` hooks; sidebar becomes a Sheet drawer on mobile/tablet
- **RTL support** -- mirrors layout direction using existing `useLanguage` hook
- **Expandable groups** -- each section uses Radix `Collapsible` with smooth accordion animation; active section auto-expands
- **Icons** -- each section gets a distinct Lucide icon (Map for Floorplan, Users for People, Globe for Language, Settings for General, Plug for Integrations, Clock for Availability, Layout for Widgets, ShoppingBag for Ordering)

---

### Placeholder Page Component

Each sub-section renders a shared `AdminPlaceholder` component that displays:
- Section title + parent group name
- "Coming Soon" badge
- Description of what this section will control
- Luxury card with glass border styling

---

### Admin Header

- Hamburger menu (mobile/tablet)
- "Master Control" title
- **Global Search bar** -- searches across all section names to jump to any setting instantly
- **Instant Publish** button (gold accent)
- **Activity Log** button
- Theme toggle + Language switcher (reuses existing components)

---

### Global Admin Powers (Placeholders)

- **Global Search**: Filters sidebar items in real time. Matching items highlight; non-matching sections collapse.
- **Activity Log**: Opens a Sheet/Dialog showing recent changes (placeholder data for now).
- **Version History**: Listed as a sub-feature inside each placeholder ("Restore previous version" button, non-functional).
- **Publish Button**: Gold accent button in the header, shows a toast confirmation.

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/AdminPanel.tsx` | Layout shell: sidebar + header + content |
| `src/components/admin/AdminSidebar.tsx` | Expandable sidebar with all 8 sections and 35+ sub-items |
| `src/components/admin/AdminHeader.tsx` | Top bar with search, publish, activity log |
| `src/components/admin/AdminPlaceholder.tsx` | Reusable placeholder for unbuilt sections |
| `src/components/admin/AdminActivityLog.tsx` | Activity log side panel (placeholder data) |

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/admin` route (lazy-loaded) |

---

### Technical Details

- Sidebar navigation state is a single `activeView` string (e.g., `"floorplan-layouts"`, `"people-user-accounts"`)
- Each section group tracks its own `open` boolean for expand/collapse
- Global search filters the navigation config array and auto-expands matching sections
- The sidebar width is `w-72` on desktop, full Sheet drawer on mobile/tablet
- All components use existing Tailwind theme tokens (`bg-card`, `text-primary`, `border-primary/10`) for automatic dark/light mode
- No database changes needed -- this is a pure UI scaffold
