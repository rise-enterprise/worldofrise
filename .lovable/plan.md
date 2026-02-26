

## Simplify the Landing Page

The current landing page has 4 scroll sections (Hero, Intelligence Modules, Brand Portal, Final CTA) plus a footer. It's content-heavy and loses impact. The screenshot confirms it feels dark and sparse rather than intelligent.

### Design Direction

Collapse everything into a single full-viewport experience. No scrolling. One powerful screen that communicates intelligence and exclusivity immediately.

### What Changes

**Remove entirely:**
- Intelligence Modules section (4 feature cards)
- Brand Portal section
- Final CTA section
- Footer
- Scroll indicator
- EnergyGrid (the grid lines clutter the dark background)
- DiamondSparkles (too many particle effects)

**Keep and refine:**
- AICoreOrb (centered, slightly larger, the single visual anchor)
- CursorGlow (subtle ambient intelligence)
- "Private Society" label
- Headline: "Welcome to Intelligent Loyalty."
- Subline: "Powered by RISE AI"
- Two CTA buttons

**Result: Gate.tsx becomes a single `min-h-screen` centered layout:**

```text
┌─────────────────────────────────┐
│                    [theme toggle]│
│                                 │
│       ─── Private Society ───   │
│                                 │
│            [ AI Orb ]           │
│                                 │
│    Welcome to Intelligent       │
│         Loyalty.                │
│                                 │
│       Powered by RISE AI        │
│                                 │
│  [Enter the Society]  [Request] │
│                                 │
│  RISE · Where Access Is Earned  │
└─────────────────────────────────┘
```

One screen. No scroll. Clean, dark, intelligent.

### Technical Details

- **Gate.tsx**: Strip all sections below the hero. Remove imports for `ScrollReveal`, `IntelligenceModule`, `GateBrandPortal`, `EnergyGrid`, `DiamondSparkles`, and lucide icons. Keep only the hero content centered in a single viewport.
- **Footer line**: Move the tagline to a subtle absolute-bottom position within the same viewport.
- **Login view**: Keep as-is but also remove `EnergyGrid` and `DiamondSparkles` for consistency -- just `CursorGlow` + the form.
- No files created or deleted. Only `Gate.tsx` is edited.

