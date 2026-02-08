

## Loyalty Master Control Panel -- Expand `/admin` with 10 Functional Sections

This plan adds 10 new loyalty-focused sections to the existing `/admin` panel. Each section gets a fully designed UI with forms, tables, toggles, and filters -- all using mock/local state for now, ready to be wired to the database later.

---

### Strategy

The existing `/admin` panel already has 8 sidebar categories (Floorplan, People, etc.) with placeholders. This plan:

1. Adds a new **"Loyalty Program"** top-level sidebar section with 10 sub-items
2. Creates 10 new view components, each with functional UI (not placeholders)
3. Updates `AdminPanel.tsx` to render the correct component based on `activeView`
4. Sets the default view to "Members Management" instead of "Floorplan Layouts"

---

### New Sidebar Section: LOYALTY PROGRAM

```text
LOYALTY PROGRAM (Crown icon)
  Members Management
  Points Engine
  Rewards Control
  Tiers System
  Campaigns & Automations
  Customer Segmentation
  Loyalty Analytics
  Digital Card Control
  Multi-Brand Control
  Global Settings
```

---

### Section Details

#### 1. Members Management
- Search bar (name, phone, email)
- Table with columns: Name, Phone, Tier, Points, Visits, Status
- Each row expands or links to a profile card showing:
  - Total spend, visits, points, tier, redemption count
  - Action buttons: Add/Remove Points, Upgrade/Downgrade Tier, Toggle VIP, Block Account
- Uses existing `members` table data via query

#### 2. Points Engine
- Cards for earning rules (points per visit, points per currency)
- Bonus rules section: double-points days toggle, happy hour multipliers
- Points expiration settings (days until expiry, toggle)
- Manual adjustments log table (read from `points_ledger`)
- Fraud detection alerts section (placeholder metrics)

#### 3. Rewards Control
- Reuses patterns from existing `RewardsManagement.tsx`
- Grid of reward cards with: title, points cost, valid dates, redemption limits, brand scope
- Create/Edit dialog with full form
- Toggle active/inactive per reward
- Branch-specific assignment

#### 4. Tiers System
- Visual tier hierarchy display (cards stacked vertically)
- Each tier card shows: name, min visits, min points, color, benefits list
- Edit tier thresholds and benefits inline
- Points multiplier per tier
- Reads from existing `tiers` table

#### 5. Campaigns & Automations
- List of campaign cards with: name, status (draft/active/completed), channel, reach
- Auto-trigger rules: Welcome bonus, Birthday, Tier upgrade, Inactive reactivation
- Template selector per channel (SMS, WhatsApp, Email)
- Simple campaign builder form
- Reads from existing `campaigns` table

#### 6. Customer Segmentation
- Segment builder with filter chips: Tier, City, Brand, Last Visit, Visit Count, Points
- Preview count of matching members
- Save segment with name
- List of saved segments
- "Target This Segment" button (links to campaigns)

#### 7. Loyalty Analytics
- KPI cards: Total Members, Active vs Inactive, Redemption Rate, Points Issued vs Redeemed
- Charts: Member growth (line), Top spenders (bar), ROI per reward (bar), Tier distribution (pie)
- Reuses Recharts patterns from existing `AnalyticsView.tsx`

#### 8. Digital Card Control
- QR membership card preview mockup
- Apple Wallet / Google Wallet toggle (placeholder)
- RFID linking section (placeholder)
- Card design customization: logo, colors, tier badge position

#### 9. Multi-Brand Control
- Brand cards for NOIR and SASSO
- Toggle: Shared points system vs Independent
- Per-brand earning rules override
- Per-brand tier mapping display

#### 10. Global Settings
- Points-to-currency conversion ratio
- Default expiration policy
- Default tier thresholds
- Regional settings (timezone, currency, language defaults)
- Save button with toast confirmation

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/loyalty/LoyaltyMembers.tsx` | Members search, table, profile actions |
| `src/components/admin/loyalty/LoyaltyPointsEngine.tsx` | Earning rules, bonuses, expiration |
| `src/components/admin/loyalty/LoyaltyRewards.tsx` | Rewards CRUD with cards |
| `src/components/admin/loyalty/LoyaltyTiers.tsx` | Tier hierarchy editor |
| `src/components/admin/loyalty/LoyaltyCampaigns.tsx` | Campaign list and builder |
| `src/components/admin/loyalty/LoyaltySegmentation.tsx` | Segment builder with filters |
| `src/components/admin/loyalty/LoyaltyAnalytics.tsx` | Charts and KPIs |
| `src/components/admin/loyalty/LoyaltyDigitalCard.tsx` | Card preview and settings |
| `src/components/admin/loyalty/LoyaltyMultiBrand.tsx` | Brand control toggles |
| `src/components/admin/loyalty/LoyaltyGlobalSettings.tsx` | Global config form |

### Files to Modify

| File | Change |
|------|--------|
| `src/components/admin/adminNavConfig.ts` | Add "Loyalty Program" section with Crown icon and 10 items |
| `src/pages/AdminPanel.tsx` | Import and render loyalty components based on activeView; change default to `loyalty-members` |

---

### Technical Approach

- All 10 views use **local state and mock data** for immediate visual feedback. Database wiring comes in a follow-up phase.
- Existing `members`, `tiers`, `campaigns`, `rewards`, `points_ledger` tables are referenced in queries where appropriate (Members, Tiers) but most views start with mock data for rapid delivery.
- Each component follows the luxury Crystal DNA aesthetic: `Card variant="obsidian"`, gold accent badges, serif headings, tracked uppercase labels.
- Responsive design: 1-column on mobile, 2 on tablet, 3-4 on desktop for grids.
- No new dependencies needed -- uses existing Recharts, Radix UI, Lucide icons, and Tailwind.
