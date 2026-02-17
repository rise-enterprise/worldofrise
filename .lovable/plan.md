

# Replace Brand Performance with Branch Preferences (Brand-Specific)

## What Changes

When viewing **NOIR Cafe** or **SASSO** tabs, the "Brand Performance" widget in the grid will be replaced with the "Branch Preferences" widget, showing only the specific branches for that brand.

On the **All Brands** tab, "Brand Performance" remains as-is.

### Branch Filtering

**NOIR Cafe tab** shows only:
- NOIR Cafe - Riyadh
- NOIR Cafe - West Walk
- NOIR Cafe - Al Hazm
- NOIR Cafe - Old Doha Port

**SASSO tab** shows only:
- SASSO - West Walk
- SASSO - Al Hazm

## Technical Details

### 1. Add `allowedBranches` prop to BranchPreferences
- Add an optional `allowedBranches?: string[]` prop
- When provided, client-side filter the results to only show branches whose names match (case-insensitive) the allowed list
- This keeps the existing RPC call intact and just trims the display

### 2. Update Overview component
- Import `BranchPreferences`
- Define branch name lists for noir and sasso
- In the `BRAND_METRICS` grid slot, conditionally render:
  - `activeBrand === 'all'` --> `BrandMetrics` (existing behavior)
  - `activeBrand === 'noir'` --> `BranchPreferences` with NOIR branches
  - `activeBrand === 'sasso'` --> `BranchPreferences` with SASSO branches

### 3. Remove BranchPreferences from Dashboard sidebar
- Since it now lives inside the grid for brand-specific views, remove the standalone sidebar `BranchPreferences` widget from `Dashboard.tsx` to avoid redundancy
- The sidebar column (`lg:w-80`) will be removed, giving the main content full width

### Files Modified
- `src/components/dashboard/BranchPreferences.tsx` -- add `allowedBranches` prop
- `src/components/dashboard/Overview.tsx` -- conditional widget swap
- `src/pages/Dashboard.tsx` -- remove sidebar BranchPreferences
