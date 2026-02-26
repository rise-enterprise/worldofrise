

## Speed Up AI Responses

The AI functions are slow primarily due to model selection and system prompt size. Here is what I will change:

### Root Causes

1. **AI Operator uses `openai/gpt-5`** (3 places) -- this is the slowest, most expensive model. It is used for tool-calling which requires multiple round-trips.
2. **AI Copilot and Member Companion use `google/gemini-3-flash-preview`** -- reasonable but the system prompts are large.
3. **System prompts are verbose** -- especially the copilot's prompt which injects full metrics context on every request.

### Changes

#### 1. Switch AI Operator from `gpt-5` to `google/gemini-3-flash-preview`
- **File**: `supabase/functions/ai-operator/index.ts` (3 occurrences)
- The operator uses `openai/gpt-5` which is significantly slower. Switching to `gemini-3-flash-preview` will dramatically reduce latency while maintaining tool-calling capability.

#### 2. Switch AI Copilot to `google/gemini-2.5-flash-lite`
- **File**: `supabase/functions/ai-copilot/index.ts`
- The copilot handles conversational Q&A about dashboard metrics. `gemini-2.5-flash-lite` is the fastest model and sufficient for this use case.

#### 3. Switch Member Companion to `google/gemini-2.5-flash`
- **File**: `supabase/functions/member-companion/index.ts`
- The companion needs good quality for personalized greetings but does not need the preview model. `gemini-2.5-flash` is faster and production-stable.

#### 4. Trim system prompts
- Reduce the copilot system prompt length by tightening guidelines (fewer words, same intent)
- This reduces token processing time on every request

### Technical Details

- No database changes required
- No frontend changes required
- All 3 edge functions will be redeployed automatically
- Model changes: `gpt-5` → `gemini-3-flash-preview` (operator), `gemini-3-flash-preview` → `gemini-2.5-flash-lite` (copilot), `gemini-3-flash-preview` → `gemini-2.5-flash` (companion)

