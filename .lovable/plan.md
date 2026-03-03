

# Plan: RISE Headquarters — Complete Intelligence System Rebuild

## Overview

Replace the current tactical/space-themed admin interface with a **dark industrial luxury headquarters** inspired by a private operations center. The central identity becomes a glowing 3D "RISE" text emblem with outward light pulses and Siri-style sound wave animation. The Gate landing page transforms into a cinematic particle-assembly entry experience.

## Architecture

```text
┌──────────────────────────────────────────────┐
│  Gate (Landing)                               │
│  • Dark cinematic intro                       │
│  • 3D "RISE" logo assembling from particles   │
│  • Industrial depth background                │
│  • "Enter Headquarters" interactive button    │
└──────────────┬───────────────────────────────┘
               ▼
┌──────────────────────────────────────────────┐
│  AdminPanel (Headquarters)                    │
│  ┌────────────────────────────────────────┐  │
│  │ Status Bar (system health, AI status)  │  │
│  ├────────────────────────────────────────┤  │
│  │                                        │  │
│  │   3D Scene:                           │  │
│  │   • Brushed titanium grid floor       │  │
│  │   • Industrial depth lighting         │  │
│  │   • Glowing "RISE" 3D text emblem     │  │
│  │   • Siri-style sound wave rings       │  │
│  │   • Light pulses outward on activity  │  │
│  │   • Metric floating panels            │  │
│  │   • Tactical heatmap globe            │  │
│  │                                        │  │
│  ├────────────────────────────────────────┤  │
│  │ Command Interface (minimal bar)        │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

## Files to Edit/Create

### 1. Gate Landing Page — `src/pages/Gate.tsx`
- Dark cinematic intro with industrial warehouse depth
- Replace AICoreOrb with new particle-assembly "RISE" logo animation
- "Enter Headquarters" as primary CTA (matte steel button with metallic hover sweep)
- Subtle mechanical background parallax
- Remove "Private Society" framing, replace with industrial luxury tone

### 2. New 3D RISE Text Emblem — `src/components/admin/vessel/RISECoreEmblem.tsx`
- **Complete rewrite**: Replace sphere-based core with actual glowing 3D "RISE" text using Three.js TextGeometry
- Load existing `helvetiker_bold.typeface.json` font from `/public/fonts/`
- Matte gold text with emissive glow edges
- Outward light pulse rings (processor-like energy waves)
- Siri-style concentric sound wave animation around it (responding to listening/speaking states)
- Industrial ring frame around the text (brushed titanium aesthetic)
- Processing state: faster pulses, brighter glow
- Speaking state: waveform ripples synced to audio

### 3. 3D Scene — `src/components/admin/vessel/InterstellarScene.tsx`
- Replace starfield/space aesthetic with industrial warehouse depth
- Steel grid floor (brushed titanium wireframe, not gold)
- Ambient industrial lighting: warm gold point lights from above (like warehouse overhead)
- Subtle volumetric dust particles (industrial atmosphere)
- Remove ExecutiveBeams, replace with industrial light cones from ceiling
- Darker, more grounded environment — no space/cosmic elements

### 4. HUD Grid — `src/components/admin/vessel/HUDGrid.tsx`
- Replace gold wireframe grid with brushed steel/titanium grid
- Industrial floor texture feel
- Subtle data stream particles in steel-blue tones
- Grounded, warehouse-floor aesthetic

### 5. Scan Sweep — `src/components/admin/vessel/ScanSweep.tsx`
- Muted steel sweep instead of gold
- Slower, more mechanical rotation
- Industrial scanner feel

### 6. Status Bar — `src/components/admin/vessel/SystemStatusBar.tsx`
- Restyle: frosted glass panel with titanium border
- "RISE INTELLIGENCE SYSTEM" branding instead of "RISE TACTICAL"
- Same functional metrics, refined industrial typography
- Matte steel/titanium color scheme with gold accents only for VIP data

### 7. Command Interface — `src/components/admin/vessel/VesselCommandInterface.tsx`
- AI personality language update: calm, elite, minimal, strategic
- Update example commands to match new tone:
  - "Member tier upgraded." style responses
  - No emojis, no casual language
- Restyle empty state: "RISE Intelligence System" branding with industrial aesthetic
- Input bar: matte steel with brushed titanium border
- System status labels: "RISE HQ · INTELLIGENCE ACTIVE"

### 8. CopilotMessage — `src/components/admin/copilot/CopilotMessage.tsx`
- Restyle message bubbles: frosted glass panels with steel borders
- Bot icon area: industrial insignia style
- Text styling: clean, high-contrast, strategic tone

### 9. Global Command Map — `src/components/admin/vessel/GlobalCommandMap.tsx`
- Keep existing tactical globe but refine:
  - 8 location nodes: Doha (6: NOIR Al Hazm, NOIR Old Doha Port, NOIR Tennis, NOIR West Walk, SASSO Al Hazm, SASSO West Walk), Riyadh (1), London (1)
  - Nodes pulse when selected
  - Gold highlights for VIP density
  - Heatmap glow effect per location

### 10. MetricRings & AIResponseMetrics
- Restyle floating panels: frosted glass with titanium frames
- Industrial typography (mono, high-contrast)
- Gold only for VIP/premium data points

### 11. AI Personality Context — `src/contexts/AIPersonalityContext.tsx`
- Update system prompt prefixes to enforce elite, minimal, strategic tone
- Remove casual language patterns
- Examples: "Member tier upgraded.", "Engagement spike detected.", "Strategic reward recommended."

### 12. AdminPanel — `src/pages/AdminPanel.tsx`
- Update background from `#0a0a0c` to deeper industrial black `#060608`
- Refine overlay effects: industrial vignette instead of scan lines
- Steel edge lines instead of gold edge lines

## Design Tokens

```text
Background:     #060608 (industrial black)
Surface:        #0c0c10 (steel dark)
Titanium:       #8a8a94 (brushed titanium)
Steel Border:   rgba(138,138,148,0.08)
Gold Accent:    #C8A24A (RISE signature — used sparingly)
Alert Red:      #b84a4a (crisis only)
Text Primary:   #e0ddd8
Text Muted:     #5a5a64
```

## Motion Principles
- Mechanical precision, no floating chaos
- Slow easing (200-400ms), ease-out curves
- Metallic hover sweep on interactive elements
- Data loads with subtle energy wave
- Page transitions fade through darkness
- Industrial scanner feel on data refresh

## What Gets Removed
- Space/cosmic starfield aesthetic
- Neon/holographic overload
- Gold-everywhere palette (gold becomes accent-only)
- "Tactical" military language → replaced with "Intelligence" executive language
- Floating chaos particles → replaced with grounded industrial dust

