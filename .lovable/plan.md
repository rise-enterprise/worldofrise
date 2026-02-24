

# Full AI Copilot for RISE Master Control

## Overview

Transform the admin panel into an AI-first command center. The existing sidebar navigation stays intact, but the default landing view becomes an **AI Copilot** -- a conversational interface that can answer questions about your loyalty program, surface proactive insights, generate campaigns, draft re-engagement messages, and execute actions, all through natural language.

## What Changes

### 1. New AI Copilot Dashboard (replaces static Loyalty Dashboard as default view)

The default view when entering `/admin` becomes an AI-powered command center with three zones:

```text
+------------------+--------------------------------------+
|                  |  AI Copilot Chat                     |
|   Sidebar        |  +---------------------------------+ |
|   (unchanged)    |  | Proactive Insight Cards (top)   | |
|                  |  | "12 members at high churn risk" | |
|                  |  | "SASSO Riyadh down 15% MoM"    | |
|                  |  +---------------------------------+ |
|                  |                                      |
|                  |  Chat Messages                       |
|                  |  [AI]: "Good morning. 334K members   |
|                  |   active. 3 items need attention..." |
|                  |  [You]: "Show me top VIPs at risk"   |
|                  |  [AI]: renders table + action btns   |
|                  |                                      |
|                  |  +--Quick Actions--+                 |
|                  |  | Run Churn Analysis |              |
|                  |  | Draft Campaign     |              |
|                  |  | Member Lookup      |              |
|                  |  +----Input Box----+                 |
+------------------+--------------------------------------+
```

**Key features:**
- AI streams responses using Lovable AI (Gemini Flash) via a new edge function
- Proactive insight cards at the top auto-refresh from `ai_insights` table
- Quick action chips for common operations
- AI can render rich content: metric cards, mini-charts, member lists, action buttons
- All existing sidebar views remain accessible

### 2. New Edge Function: `ai-copilot`

A streaming edge function that:
- Receives the admin's natural language query + conversation history
- Has access to dashboard metrics (calls `get_dashboard_metrics` RPC)
- Has access to AI predictions data
- Uses tool calling to query specific data (member lookup, churn stats, etc.)
- Returns streaming SSE responses via Lovable AI gateway
- System prompt is tuned for luxury hospitality context (RISE Holding, NOIR, SASSO)

### 3. New Components

| Component | Purpose |
|---|---|
| `AICopilotView.tsx` | Main copilot page with chat + insight cards |
| `CopilotMessage.tsx` | Renders individual AI/user messages with rich content (markdown, tables, charts) |
| `CopilotInsightCards.tsx` | Top bar showing proactive AI insights from the database |
| `CopilotQuickActions.tsx` | Quick action chips below the chat |

### 4. Updated Files

| File | Change |
|---|---|
| `adminNavConfig.ts` | Add "AI Copilot" as the first item in the Intelligence section (or new top-level section) |
| `AdminPanel.tsx` | Default `activeView` changes from `loyalty-dashboard` to `ai-copilot`; register new lazy component |
| `AdminHeader.tsx` | Add a small AI sparkle button that scrolls/focuses the copilot input |

### 5. Navigation Flow

- `/admin` lands on the AI Copilot by default (instead of static dashboard)
- All existing sidebar sections remain fully functional
- The AI Copilot is also accessible from the sidebar under a new top-level "AI Copilot" entry
- The old "Loyalty Dashboard" view stays available in the sidebar for direct metric access

## Technical Details

### Edge Function: `supabase/functions/ai-copilot/index.ts`

- Authenticates the admin via Bearer token
- Accepts `{ messages: Message[], context?: string }` 
- Builds a system prompt with:
  - Current dashboard metrics (fetched via `get_dashboard_metrics` RPC)
  - Recent AI insights from `ai_insights` table
  - Member count, churn stats, brand breakdown
- Streams response via Lovable AI gateway (`google/gemini-3-flash-preview`)
- Handles 429/402 rate limit errors gracefully

### Frontend Streaming

- Uses `fetch` with SSE parsing (line-by-line) as per Lovable AI best practices
- Renders markdown via `react-markdown` (will need to add dependency)
- Updates the last assistant message progressively (no buffering)
- Quick actions pre-fill the chat input with contextual prompts

### AI System Prompt Context

The copilot will be aware of:
- Total members, VIP count, churn risk count (from `get_dashboard_metrics`)
- Recent AI insights and predictions
- Brand names (NOIR, SASSO), cities (Doha, Riyadh), tier names
- It can suggest navigating to specific admin views for deeper analysis

### New Dependency

- `react-markdown` -- for rendering AI responses with proper formatting

### Files to Create
1. `supabase/functions/ai-copilot/index.ts` -- streaming AI edge function
2. `src/components/admin/copilot/AICopilotView.tsx` -- main copilot view
3. `src/components/admin/copilot/CopilotMessage.tsx` -- message renderer with markdown
4. `src/components/admin/copilot/CopilotInsightCards.tsx` -- proactive insight cards
5. `src/components/admin/copilot/CopilotQuickActions.tsx` -- quick action chips

### Files to Modify
1. `src/components/admin/adminNavConfig.ts` -- add AI Copilot nav entry
2. `src/pages/AdminPanel.tsx` -- register copilot view, change default to `ai-copilot`
3. `package.json` -- add `react-markdown` dependency

