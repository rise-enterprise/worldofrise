
## Fix Dashboard Light Mode UI Issues

The dashboard in day mode has several visual problems: heavy dark shadows on cards, crystal background effects that are too intense, and glass material properties tuned exclusively for dark backgrounds.

### Issues Identified

1. **Card shadows too harsh** -- The `obsidian` and `crystal-panel` card variants use `hsl(0 0% 0% / 0.4-0.5)` shadows which look like heavy dark borders on light backgrounds
2. **Crystal background effects too visible** -- Gold crystal strands, sparkles, and ambient orbs designed for dark noir backgrounds appear overly prominent on light surfaces
3. **Glass panel shadows not theme-aware** -- `.crystal-panel`, `.crystal-panel-elevated`, and `.obsidian-panel` utilities all have hardcoded dark shadow values
4. **Bevel effects mismatched** -- Inset shadows meant for dark mode create unnatural depth artifacts in light mode

### Changes

**1. `src/index.css` -- Add light mode shadow overrides**
- Add `.light` scoped overrides for `.crystal-panel`, `.crystal-panel-elevated`, `.crystal-panel-gold`, `.obsidian-panel`, and `.obsidian-panel-hover` with softer, lighter shadows (e.g., `hsl(0 0% 0% / 0.08)` instead of `0.4-0.5`)
- Add `.light` scoped overrides for `.glass-panel` and `.glass-panel-heavy`
- Adjust `.shadow-luxury`, `.shadow-crystal`, and `.shadow-glass` for light mode with much reduced opacity

**2. `src/components/ui/card.tsx` -- Add light-mode-aware shadow tokens**
- Update the `obsidian` and `luxury` card variants to use a CSS variable-based shadow approach, or add `.light` class scoping so the heavy `0_8px_32px_-8px_hsl(0_0%_0%/0.5)` shadows become much softer like `0_4px_16px_-4px_hsl(0_0%_0%/0.08)`

**3. `src/components/effects/CrystalBackground.tsx` -- Reduce light mode intensity**
- Detect the current theme and reduce crystal strand opacity, sparkle count, and ambient orb intensity when in light mode
- Alternatively, reduce the opacity values via CSS: the strands and sparkles use inline styles with fixed opacity values that need to halve in light mode

**4. `src/components/effects/DiamondSparkles.tsx` -- Tone down for light mode**
- Reduce glow intensity of diamond sparkles and prismatic flares when the light class is active, so they don't create jarring bright spots on a white background

### Technical Approach

The most efficient approach:
- Add a block of `.light` overrides in `index.css` for all shadow/glass utility classes (single location, comprehensive fix)
- Use a CSS class `.light` on the crystal effects container to reduce opacity via CSS rather than adding theme state detection in every component
- Update card.tsx obsidian/luxury variants to reference a CSS custom property for shadow intensity
