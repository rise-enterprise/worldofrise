

## Move Dashboard Route from `/dashboard` to `/admin/dashboard`

A straightforward route reorganization to place the Dashboard under the `/admin` path namespace.

### Changes

1. **`src/App.tsx`** -- Update the route path from `/dashboard` to `/admin/dashboard`

2. **`src/components/dashboard/Sidebar.tsx`** -- Update the `navigate('/admin')` call for Master Control (already correct) and verify no other hardcoded `/dashboard` references

3. **Search for any other references to `/dashboard`** across the codebase (navigation links, redirects, auth guards) and update them to `/admin/dashboard`

### Technical Details

Files to check for `/dashboard` references:
- `src/components/admin/adminNavConfig.ts` -- may contain a redirect to `/dashboard`
- `src/components/admin/AdminSidebar.tsx` -- the "Dashboard" button that navigates back
- `src/components/auth/UnifiedLoginForm.tsx` -- post-login redirect for admins
- Any other navigation or redirect logic

All instances of `/dashboard` will be updated to `/admin/dashboard`.

