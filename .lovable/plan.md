

# Fix Widget Overlapping and Enable Page Scrolling

## Problem
Two issues are causing the broken layout:
1. The `CrystalPageWrapper` component has `overflow-hidden` on its root container, which prevents the page from scrolling when the grid content exceeds the viewport height.
2. The `react-grid-layout` grid may not be calculating height properly, causing widgets to overlap.

## Solution

### 1. Fix page scrolling (CrystalPageWrapper.tsx)
- Change `overflow-hidden` to `overflow-x-hidden overflow-y-auto` on the root div so vertical scrolling works while horizontal overflow is still clipped.

### 2. Fix widget overlapping (EditableGridLayout.tsx)
- Add `autoHeight` prop to the `ResponsiveGridLayout` so the container grows to fit all widgets instead of constraining them.
- Ensure `compactType="vertical"` is working correctly (already set).

### 3. Ensure grid items don't visually overlap (index.css)
- Add `overflow: hidden` to `.react-grid-item` so widget content doesn't bleed outside its allocated grid cell.

## Files Modified
- `src/components/effects/CrystalPageWrapper.tsx` -- fix overflow to allow vertical scrolling
- `src/components/dashboard/EditableGridLayout.tsx` -- add `autoHeight` prop
- `src/index.css` -- add overflow containment to grid items

