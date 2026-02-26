

## Add Day/Night Mood Awareness to All AI Functions

Make the AI adapt its tone, greetings, and suggestions based on the time of day — using the server's UTC time mapped to the user's likely timezone (Middle East / Gulf, UTC+3).

### Approach

The edge functions already run server-side, so we can compute the current hour in Gulf time (UTC+3) and inject a `MOOD` context line into each system prompt. No frontend changes needed — the AI will automatically adjust its personality.

**Time Bands:**
- **Morning (6am–12pm):** Energetic, fresh start tone. Coffee/breakfast suggestions for NOIR, lunch prep for SASSO.
- **Afternoon (12pm–5pm):** Balanced, productive tone. Lunch at SASSO, afternoon coffee at NOIR.
- **Evening (5pm–10pm):** Warm, refined tone. Dinner at SASSO, evening atmosphere at NOIR.
- **Night (10pm–6am):** Calm, intimate tone. Late-night exclusivity, quieter language.

### Changes

#### 1. `supabase/functions/ai-copilot/index.ts`
- Compute Gulf hour from `new Date()` with UTC+3 offset
- Add a `MOOD` line to the system prompt like: `MOOD: It's currently [morning/afternoon/evening/night] in the Gulf. Adapt your energy and references accordingly.`

#### 2. `supabase/functions/ai-operator/index.ts`
- Same time computation
- Add `MOOD` context so the operator references time-relevant data (e.g., "end of day summary" in evening, "morning briefing" in AM)

#### 3. `supabase/functions/member-companion/index.ts`
- Same time computation
- Add mood-aware guideline so the companion greets with time-appropriate warmth ("Good morning, Ahmed" vs "Good evening") and suggests relevant experiences (coffee in morning, dinner in evening)

### Technical Details
- Time is computed server-side using `new Date()` with a +3 hour UTC offset for Gulf timezone
- Only system prompt changes in 3 edge functions — no database, no frontend modifications
- All 3 edge functions will be redeployed automatically

