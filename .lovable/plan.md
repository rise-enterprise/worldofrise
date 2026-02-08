

## Show All Guest Information in Distinguished Guests Card

Currently the VIPGuestCard only shows: name, tier badge, brand, country, visits count, last visit date, and up to 2 tags. The Guest object has many more fields that should be visible.

### Fields to Add

| Field | Display |
|---|---|
| `email` | Email icon + address |
| `phone` | Phone icon + number |
| `totalPoints` | Points counter with star icon |
| `birthday` | Cake icon + formatted date |
| `salutation` | Shown before name (e.g. "Mr. John Doe") |
| `joinedAt` | "Member since" label with formatted date |
| `status` | Small colored dot indicator (green=active, red=blocked) |
| `isVip` | Crown/diamond icon badge next to name |

### Changes

**File: `src/components/dashboard/VIPGuestCard.tsx`**

**Desktop (non-compact) layout:**
- Prepend `salutation` before `guest.name` in the title (e.g., "Mr. John Doe")
- Add a VIP diamond icon next to the name if `isVip` is true
- Add a status dot (green/red) near the name
- Add a second info row below brand/country showing email and phone (with Mail and Phone icons)
- Expand the stats section at the bottom to include:
  - Visits (existing)
  - Last visit (existing)
  - Points (new, with Star icon)
  - Member since (new, with Calendar icon)
- Show birthday with Cake icon if available
- Keep tags display as-is

**Mobile (compact) layout:**
- Add salutation before name
- Add email and phone as small text lines below the name
- Add points next to visits count

### Technical Details

- Import additional icons from `lucide-react`: `Mail`, `Phone`, `Star`, `Cake`, `Calendar`, `Diamond`
- Add a `formatFullDate` helper for birthday and joinedAt formatting
- No new dependencies or data fetching needed -- all fields already exist on the Guest object

