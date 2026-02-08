

## Add Admin Users Management to the Master Control Panel

Bring the existing admin user management functionality into the `/admin` Loyalty Master Control Panel as a new sidebar section, so you can manage all admin roles (Super Admin, Admin, Manager, Viewer) directly from the same panel.

---

### What Changes

#### 1. New sidebar section: "Administration"
A new top-level category appears below "Loyalty Program" in the sidebar with one item:
- **Admin Users** -- Invite, edit, deactivate, and delete admin accounts with role assignment

#### 2. Reuse existing component
The fully functional `AdminsView` component (currently used in the old dashboard at `/dashboard`) already supports:
- Invite new admins with email + name + role
- Edit admin name and role
- Deactivate / permanently delete admins
- Resend activation links
- Role-based access (only super admins see this section)

This component will be lazy-loaded into the Master Control Panel just like the loyalty views.

---

### Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/adminNavConfig.ts` | Add a second `NavSection` with id `"administration"`, label `"Administration"`, `ShieldCheck` icon, and one item: `{ id: "admin-users", label: "Admin Users", description: "..." }` |
| `src/pages/AdminPanel.tsx` | Add lazy import for `AdminsView`, add `"admin-users"` to the views map, auto-expand the administration section in `openSections` default |

No new files need to be created. No database changes required -- the `admins` table and `invite-admin` edge function already exist and work.

---

### Technical Details

- `adminNavConfig.ts`: Import `ShieldCheck` from lucide-react alongside `Crown`. Add a second entry to `NAV_SECTIONS` array.
- `AdminPanel.tsx`: Add `const AdminUsers = lazy(() => import("@/components/dashboard/AdminsView").then(m => ({ default: m.AdminsView })))` since it uses a named export. Add `"admin-users": AdminUsers` to the views map. Update default `openSections` to include `administration: true`.
