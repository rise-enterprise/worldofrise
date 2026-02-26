

## Auto-Detect Language (Arabic/English) in All AI Functions

Add a language detection instruction to the system prompts of all 3 AI edge functions so the AI automatically responds in the same language the user writes in.

### Changes

#### 1. `supabase/functions/ai-copilot/index.ts` (line ~82)
Add to end of system prompt:
```
LANGUAGE: Detect the user's language. If they write in Arabic, respond entirely in Arabic (RTL). If English, respond in English. Match their language naturally.
```

#### 2. `supabase/functions/ai-operator/index.ts` (line ~366)
Add to end of system prompt before the closing backtick:
```
LANGUAGE: Detect the user's language. If they write in Arabic, respond entirely in Arabic. If English, respond in English. Match their language naturally. Tool names and technical terms can remain in English.
```

#### 3. `supabase/functions/member-companion/index.ts` (line ~189)
Add to GUIDELINES section:
```
- Detect the member's language automatically. If they write in Arabic, respond entirely in elegant Arabic. If English, respond in English. Brand names (NOIR, SASSO, RISE) stay in English regardless of language.
```

### Technical Details
- No database or frontend changes needed
- All 3 edge functions will be redeployed
- GPT-5.2 handles Arabic fluently — no additional configuration required
- Brand names remain in English in both languages for consistency

