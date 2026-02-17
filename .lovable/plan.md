

# Draggable & Resizable Dashboard Widgets

## Overview
Add the ability to drag, move, and resize all dashboard widgets in the Overview section, with snap-to-grid behavior so everything stays aligned and tidy.

## Approach
We'll use `react-grid-layout`, a well-established library for grid-based drag-and-drop layouts. Each widget (metric cards, tier distribution, brand metrics, country metrics, VIP guests) becomes a grid item that can be freely repositioned and resized while snapping to grid cells.

## What You'll See
- An "Edit Layout" toggle button in the dashboard header area
- When editing is enabled, widgets show drag handles and resize corners
- Dragging a widget snaps it to the nearest grid position
- Resizing snaps to grid increments
- Your custom layout is saved and remembered between sessions (stored in browser local storage)
- A "Reset Layout" button to return to the default arrangement

## Technical Details

### 1. Install dependency
- Add `react-grid-layout` (includes TypeScript types)

### 2. Create a layout configuration file
- `src/components/dashboard/dashboardLayoutConfig.ts`
- Define default grid positions and sizes for each widget
- Define min/max width/height constraints per widget
- Store layout in localStorage for persistence

### 3. Create an EditableGridLayout wrapper component
- `src/components/dashboard/EditableGridLayout.tsx`
- Wraps `react-grid-layout`'s `ResponsiveGridLayout`
- Props: `isEditing`, `onLayoutChange`, `children`
- Handles responsive breakpoints (lg, md, sm)
- Adds visual indicators when in edit mode (dashed borders, drag handles)
- Snaps to a 12-column grid

### 4. Refactor Overview component
- Wrap each widget in a grid item `<div key="widget-id">`
- Replace the current CSS grid with the `EditableGridLayout`
- Add an "Edit Layout" toggle button and "Reset" button
- Pass `isEditing` state to control drag/resize capability
- When not editing, layout is fully locked (no accidental moves)

### 5. Import required CSS
- Import `react-grid-layout/css/styles.css` and `react-resizable/css/styles.css`
- Add custom styling overrides to match the dark obsidian theme (gold accent drag handles, subtle grid lines when editing)

### 6. Default widget layout (12-column grid)

```text
Row 0-2:  [Metric1 w=3] [Metric2 w=3] [Metric3 w=3] [Metric4 w=3]
Row 2-8:  [TierDist w=4] [Brand+Country w=4] [VIP Guests w=4]
```

Each widget will have constraints:
- Metric cards: min 2 cols wide, max 6
- Larger widgets: min 3 cols wide, max 12

