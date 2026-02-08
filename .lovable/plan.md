
## Show Full Guest Name

### Problem
The guest name is truncated because of the `truncate` CSS class on the name element and `min-w-0` on the parent container, which clips long names with an ellipsis instead of displaying them fully.

### Fix (single file: `src/components/dashboard/VIPGuestCard.tsx`)

1. **Line 126**: Remove the `truncate` class from the `<h4>` element so the full name is always visible. Allow it to wrap naturally instead.
2. **Line 120**: Change `min-w-0` to `min-w-0 flex-1` so the name container takes available space and wraps text instead of clipping.

This ensures names like "Mr. Alessandro Lombardi" display fully rather than being cut off.
