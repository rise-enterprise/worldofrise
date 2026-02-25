

# Auto-Surface AI Response Metrics on the 3D HUD

## Problem
When the AI copilot mentions numbers (e.g., "You have **12 VIP members**" or "**334,210 total guests**"), the user has to mentally track those figures. They should automatically appear as floating HUD panels on the 3D dashboard for instant visual reference.

## Solution
Extract key metric pairs (label + number) from AI responses using a regex parser, then pass them up from `VesselCommandInterface` → `AdminPanel` → `InterstellarScene` → render as a new row of **dynamic HUD panels** above the existing static metrics.

## Architecture

```text
VesselCommandInterface
  ├── AI streams response
  ├── extractMetrics(responseText) → [{ label, value }]
  └── onAIMetrics(metrics)  ← new callback prop
          │
          ▼
AdminPanel (state: aiMetrics)
  ├── Merges into a separate metric array
  └── Passes to InterstellarScene as `aiMetrics`
          │
          ▼
InterstellarScene
  └── Renders <AIResponseMetrics> (new component)
          │
          ▼
AIResponseMetrics.tsx (new file)
  └── Billboard panels at y=2 (ABOVE the orb)
      with a distinct cyan/teal border to differentiate
      from the static gold metrics below
```

## File Changes

### 1. New: `src/components/admin/vessel/AIResponseMetrics.tsx`
- Similar structure to `MetricRings` but positioned **above** the orb (y = 2 to 3)
- Cyan-themed borders to visually distinguish from the static gold metrics below
- Entry animation: panels scale from 0 → 1 when new metrics arrive
- Fades out after 60 seconds of no new data (auto-clear)
- Max 6 panels shown (most recent wins)

### 2. Edit: `src/components/admin/vessel/VesselCommandInterface.tsx`
- Add a `extractMetrics(text: string)` utility function that uses regex to find patterns like:
  - "**123** members" → `{ label: "Members", value: 123 }`
  - "12,345 total guests" → `{ label: "Total Guests", value: 12345 }`
  - "VIP count: 42" → `{ label: "VIP Count", value: 42 }`
  - Patterns: `number + word(s)`, `word(s) + number`, `word(s): number`, bold markdown numbers
- Add new prop: `onAIMetrics?: (metrics: { label: string; value: number }[]) => void`
- Call `onAIMetrics` in the `onDone` callback after streaming completes, passing extracted metrics

### 3. Edit: `src/pages/AdminPanel.tsx`
- Add state: `const [aiMetrics, setAiMetrics] = useState<{ label: string; value: number }[]>([])`
- Pass `onAIMetrics={setAiMetrics}` to `VesselCommandInterface`
- Convert `aiMetrics` into the `MetricData` format and pass as `aiMetrics` prop to `InterstellarScene`

### 4. Edit: `src/components/admin/vessel/InterstellarScene.tsx`
- Accept new `aiMetrics` prop
- Render `<AIResponseMetrics>` component when `aiMetrics.length > 0`

## Metric Extraction Logic

```typescript
function extractMetrics(text: string): { label: string; value: number }[] {
  const metrics: { label: string; value: number }[] = [];
  const seen = new Set<string>();
  
  // Pattern: **number** + label words
  // Pattern: number + label words  
  // Pattern: label: number
  // Handles commas in numbers (e.g., 334,210)
  const patterns = [
    /\*\*([0-9,]+(?:\.[0-9]+)?%?)\*\*\s+([a-zA-Z][a-zA-Z\s]{1,25})/g,
    /(?:^|\s)([0-9,]+(?:\.[0-9]+)?%?)\s+((?:total|active|vip|new|dormant|at.risk|high.risk)[a-zA-Z\s]{0,20})/gi,
    /([\w\s]{2,20}):\s*\*?\*?([0-9,]+(?:\.[0-9]+)?%?)\*?\*?/g,
  ];
  
  // Deduplicate by label, keep max 6
  return metrics.slice(0, 6);
}
```

## Visual Design

```text
    ┌──────┐  ┌──────┐  ┌──────┐     ← AI-extracted (cyan border, y=2)
    │ VIP  │  │GUESTS│  │CHURN │
    │  12  │  │334K  │  │  42  │
    └──────┘  └──────┘  └──────┘

              ◉ AI Core ◉              ← Orb (y=0)

    ┌─────┐ ┌─────┐ ┌─────┐ ...      ← Static metrics (gold, y=-2)
    │ MEM │ │ VIS │ │ VIP │ 
    └─────┘ └─────┘ └─────┘
```

- AI-extracted panels use **cyan (#00d4ff)** borders and values
- They appear with a scale-in animation when new metrics arrive
- A small "AI" tag label distinguishes them from static metrics
- Auto-clear after 60s or when a new AI response arrives with different metrics

## Technical Details

| Aspect | Detail |
|---|---|
| Extraction | Regex-based, runs once when streaming completes |
| Position | y = 2.5 (above orb), single row, max 6 panels |
| Color | Cyan `#00d4ff` for borders/values, distinct from gold static panels |
| Animation | Scale 0→1 spring on mount, fade out after 60s |
| Performance | Same Billboard + Text approach as MetricRings, no extra draw calls |
| Props flow | `VesselCommandInterface.onAIMetrics` → `AdminPanel.aiMetrics` → `InterstellarScene.aiMetrics` → `AIResponseMetrics` |

