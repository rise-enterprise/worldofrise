

## Add Admin Panel Navigation to the Dashboard

Add a link/button in the Dashboard page that navigates to the `/admin` Master Control Panel, so admins can easily switch between the two interfaces.

---

### Changes

#### 1. `src/components/dashboard/Sidebar.tsx`
- Add a navigation item to the super admin section that links to `/admin` (Master Control)
- Use `useNavigate` from react-router-dom to handle the route change
- Add a new entry with icon `Crown` or `Settings` and label "Master Control" that navigates to `/admin` instead of setting an internal view
- Place it in the `superAdminNavigation` array or as a standalone button below the admin section

#### 2. `src/components/dashboard/DashboardHeader.tsx`
- Add a small icon button (e.g., `ShieldCheck` icon) in the header action bar that links to `/admin`
- Provides quick access from the header without needing the sidebar

---

### Technical Details

| File | Change |
|------|--------|
| `src/components/dashboard/Sidebar.tsx` | Import `useNavigate`, add a "Master Control" button in the admin section that calls `navigate('/admin')` |
| `src/components/dashboard/DashboardHeader.tsx` | Add a `ShieldCheck` icon button linking to `/admin` in the action bar |

No database changes needed. Both additions use standard react-router-dom navigation.
