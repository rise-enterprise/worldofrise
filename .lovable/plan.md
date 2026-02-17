

## Update Distinguished Guests Data Mapping

The Distinguished Guests cards on `/admin/dashboard` are showing incorrect or missing data because the contacts-to-Guest mapping has several bugs.

### Current Issues

1. **Tier always shows "Initiation"** -- The `loyalty_tier` column is null for all VIP contacts, causing every guest to fall back to the default "Initiation" tier
2. **Wrong brand and location** -- Brand is only partially derived from `last_location`, and country/city fields are null, so location display is unreliable
3. **Missing salutation** -- Available in the contacts table (`Ms.`, `Mr`, etc.) but never mapped to the Guest object
4. **Missing birthday** -- Available in contacts but not mapped
5. **Missing VIP flag** -- The `vip` field is queried but `isVip` is never set on the Guest, so the diamond icon does not appear
6. **Poor sort order** -- Sorted by `total_spend` which is null for all VIP contacts; should sort by visits or last_visit instead
7. **Total spend not shown** -- `totalPoints` is hardcoded to `0`; could show `total_spend` as a meaningful metric instead

### Changes

**`src/hooks/useMembers.ts`** -- Update the `fetchVIPGuests` function:

- Add `salutation`, `birthday` to the SELECT query (already selected, just not mapped)
- Map `salutation` and `birthday` to the Guest object
- Set `isVip: true` since these are VIP contacts
- Derive country from `last_location` (if it contains "Riyadh" use `riyadh`, otherwise `doha`)
- Map `total_spend` to `totalPoints` so a meaningful number is shown (or 0 if null)
- Change sort order to `visits DESC, last_visit DESC` instead of `total_spend DESC`
- Handle null `loyalty_tier` by inferring tier from visit count using TIER_CONFIG thresholds

**`src/components/dashboard/VIPGuestCard.tsx`** -- No structural changes needed. The card already supports `salutation`, `birthday`, `isVip`, and `totalPoints` display. Once the data mapping is fixed, these fields will render correctly.

### Technical Details

The key mapping fix in `fetchVIPGuests`:

```typescript
return {
  id: c.id,
  name: fullName,
  salutation: c.salutation || undefined,
  email: c.email || null,
  phone: c.phone || '',
  country: (c.last_location || '').toLowerCase().includes('riyadh') ? 'riyadh' : 'doha',
  tier: mapDbTierToTier(c.loyalty_tier || inferTierFromVisits(c.visits || 0)),
  tierName: c.loyalty_tier || inferTierFromVisits(c.visits || 0),
  totalVisits: c.visits || 0,
  lifetimeVisits: c.visits || 0,
  lastVisit: c.last_visit ? new Date(c.last_visit) : new Date(),
  joinedAt: c.created_date ? new Date(c.created_date) : new Date(),
  favoriteBrand: deriveBrandFromLocation(c.last_location),
  visits: [],
  tags: c.tags ? c.tags.split(',').map(t => t.trim()) : [],
  notes: c.notes || undefined,
  isVip: true,
  birthday: c.birthday || undefined,
  totalPoints: c.total_spend ? Number(c.total_spend) : 0,
  status: 'active' as const,
};
```

A helper `inferTierFromVisits` will use the TIER_CONFIG thresholds (50+ = black, 30+ = inner-circle, 15+ = elite, 5+ = connoisseur, else initiation) to assign a reasonable tier when `loyalty_tier` is null.

Sort order changes to: `.order('visits', { ascending: false }).order('last_visit', { ascending: false })`.

Also add `created_date` and `tags` to the select for `joinedAt` and tag display.

