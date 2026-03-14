

# Plan: Ultra-Luxury Global Hospitality Intelligence Platform

## Overview

Strip all industrial/warehouse/superhero aesthetics. Replace with an ultra-luxury hospitality aesthetic: pearl white, champagne gold, Italian marble textures, deep noir accents. Think private banking + luxury fashion house + Apple minimalism.

## Design Tokens

```text
DARK MODE (Velvet Noir):
  Background:     #0a0a0f (deep velvet black)
  Surface:        #12121a (dark silk)
  Card:           rgba(255,255,255,0.03) (glass)
  Gold Accent:    #C8A24A (champagne gold — signature)
  Gold Light:     #d4b86a (warm champagne)
  Text Primary:   #f0ece4 (warm ivory)
  Text Muted:     #8a8578 (warm stone)
  Border:         rgba(200,162,74,0.08)
  NOIR Brand:     #1a1a1a + #C8A24A
  SASSO Brand:    #e8e2d8 + #8a7a62

LIGHT MODE (Pearl & Marble):
  Background:     #f8f5f0 (pearl white)
  Surface:        #ffffff
  Card:           rgba(200,162,74,0.03) (champagne glass)
  Gold Accent:    #b8944a (brushed champagne)
  Text Primary:   #1a1510 (deep noir)
  Text Muted:     #8a7d6a (warm stone)
  Border:         rgba(200,162,74,0.06)
```

## Files to Edit

### 1. `src/contexts/VesselThemeContext.tsx`
- Update NIGHT_COLORS to velvet noir palette (deep black + champagne gold)
- Update DAY_COLORS to pearl + marble palette (warm whites + brushed champagne)
- Remove all steel/titanium references

### 2. `src/components/admin/vessel/InterstellarScene.tsx` — Complete rewrite
- Remove: steel grid floor, industrial dust, ceiling lights, scan sweep
- Add: soft ambient pearl/champagne lighting
- Add: gentle floating luminous particles (like light catching crystal facets)
- Add: subtle marble-like floor reflection plane
- Background: deep velvet (#0a0a0f) in dark mode
- Lighting: warm champagne point lights, soft ambient, no harsh directional
- Premium showroom feel — slow, calm light movements

### 3. `src/components/admin/vessel/RISECoreEmblem.tsx` — Restyle
- Keep 3D "RISE" text structure
- Change material: crystal-like finish with subtle gold rim light
- Replace steel wave rings with elegant concentric halos (softer, slower)
- Replace LightPulse with gentle ambient glow pulses (champagne, not processor-like)
- Torus frame: thin champagne gold, not steel
- Overall: crystal elegance, not industrial machinery

### 4. `src/pages/Gate.tsx` — Luxury hospitality entry
- Background: deep velvet black (dark) or pearl white (light)
- Remove "INTELLIGENCE HEADQUARTERS" — replace with "GLOBAL LUXURY INTELLIGENCE"
- Remove industrial depth lines — replace with subtle marble vein lines (warm stone, organic curves)
- Particle assembly: softer, warmer gold particles, slower assembly
- Pulse rings: champagne gold, very subtle
- CTA: "Enter" — minimal, luxury serif font feel, champagne gold border
- "Request Access" — understated, warm stone text
- Bottom tagline: "RISE · GLOBAL HOSPITALITY INTELLIGENCE"

### 5. `src/pages/AdminPanel.tsx` — Luxury atmosphere
- Background: `#0a0a0f` (velvet black, not industrial)
- Remove scan line texture overlay
- Remove "titanium edge" lines
- Add: subtle warm radial gradient (champagne glow from center)
- Comments updated: "Luxury headquarters" not "Industrial"

### 6. `src/components/admin/vessel/SystemStatusBar.tsx` — Executive bar
- Restyle: warm frosted glass, champagne gold borders
- "RISE EXECUTIVE INTELLIGENCE" label
- Mode pills: warm champagne styling, luxury serif-inspired
- Metrics: champagne gold for VIP, warm stone for labels

### 7. `src/components/admin/vessel/VesselCommandInterface.tsx`
- Rename: "RISE EXECUTIVE INTELLIGENCE" branding
- Empty state: remove "Operational Command" — replace with "Global Luxury Intelligence"
- Status labels: "RISE · EXECUTIVE INTELLIGENCE ACTIVE"
- Example commands refined to luxury strategist tone:
  - "NOIR engagement growth projection."
  - "SASSO Riyadh VIP retention status."
  - "High-value member tier elevation candidates."
- Input bar: warm glass, champagne border on focus
- All steel/titanium colors → warm champagne/ivory
- Waveform: champagne gold gradient

### 8. `src/components/admin/copilot/CopilotMessage.tsx`
- Message panels: warm glass with champagne gold borders
- Bot icon: elegant "R" in champagne, not steel gray
- Code blocks: warm dark surface
- Headings/bold: warm ivory, not steel
- Remove all `#8a8a94` steel references → warm stone tones

### 9. `src/components/admin/vessel/GlobalCommandMap.tsx`
- Globe wireframe: soft gold outlines (not steel gray)
- Arc connections: champagne gold, premium airline route style
- City beacons: warm gold glow
- Hover panels: dark silk background + champagne borders
- Keep 3 cities (Doha, Riyadh, London) with existing data

### 10. `src/components/admin/vessel/MetricRings.tsx`
- Orbit panels: warm glass with champagne gold borders
- Labels: warm stone tones
- Values: champagne gold for primary metrics
- Progress bars: champagne gold fills
- Remove all steel colors

### 11. `src/components/admin/vessel/AIResponseMetrics.tsx`
- Same treatment as MetricRings: warm glass, champagne gold

### 12. `src/contexts/AIPersonalityContext.tsx`
- Rename system: "RISE Executive Intelligence"
- Update all system prompts:
  - Remove "No emojis. No casual language." (keep enforcement but softer)
  - Add "Polished. Strategic. Warm but refined. Never robotic."
  - Tone: luxury brand strategist, not military commander
  - Examples: "NOIR engagement growth exceeds projection." / "SASSO Riyadh VIP retention stable."
- Mode labels refined: "Executive Strategy", "Growth & Expansion", "Behavioral Insights", "Investor Relations", "Risk Advisory"
- Accent colors: warmer tones (remove cyan/neon)

### 13. `src/components/admin/vessel/HUDGrid.tsx`
- Grid floor: subtle warm gold wireframe (not steel)
- Dust particles: warm luminous gold (not steel-blue)
- Overall opacity reduced — luxury calm

### 14. `src/components/admin/vessel/ScanSweep.tsx`
- Change to champagne gold sweep
- Very slow, elegant rotation — luxury showroom scanner feel

## Motion Principles
- All transitions: slow, deliberate (300-500ms), ease-out
- No mechanical/industrial feel
- Hover: warm champagne glow, no metallic sweep
- Data loads: gentle fade-in with champagne shimmer
- Everything whispers luxury, nothing shouts technology

