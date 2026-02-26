

## Switch All AI Models to GPT-5.2

The best and highest version of GPT-5 available is `openai/gpt-5.2` -- OpenAI's latest model with enhanced reasoning capabilities. I will switch all AI functions to use this model.

### Changes

#### 1. AI Operator (`supabase/functions/ai-operator/index.ts`)
- Change `google/gemini-3-flash-preview` to `openai/gpt-5.2` in **3 places** (lines 376, 445, 475)

#### 2. AI Copilot (`supabase/functions/ai-copilot/index.ts`)
- Change `google/gemini-2.5-flash-lite` to `openai/gpt-5.2` (line 91)

#### 3. Member Companion (`supabase/functions/member-companion/index.ts`)
- Change `google/gemini-2.5-flash` to `openai/gpt-5.2` (line 198)

#### 4. Guest Insights (`supabase/functions/guest-insights/index.ts`)
- Change `google/gemini-2.5-flash` to `openai/gpt-5.2` (line 270)

#### 5. AI Predictions (`supabase/functions/ai-predictions/index.ts`)
- Change `google/gemini-2.5-flash` to `openai/gpt-5.2` (line 418)

### Technical Details

- `openai/gpt-5.2` is the most powerful model available -- best reasoning, best accuracy, but also the most expensive and slowest
- Responses will be higher quality but will take longer than the Gemini models previously configured
- All 5 edge functions will be redeployed
- No database or frontend changes needed

