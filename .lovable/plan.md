

## Speed Up Voice Activation — Stream TTS While AI Responds

### Problem
Currently, TTS only fires **after the entire AI response finishes streaming**. The user waits for:
1. Full AI text stream to complete
2. TTS API call to ElevenLabs
3. Audio download + playback

This creates a noticeable delay between the AI finishing and hearing the voice.

### Solution: Fire TTS on First Sentence
Instead of waiting for `onDone`, trigger TTS as soon as the first complete sentence arrives during streaming. This means voice playback begins while the rest of the text is still streaming in.

### Changes

#### 1. VesselCommandInterface (`src/components/admin/vessel/VesselCommandInterface.tsx`)
- In `send()`, move TTS triggering from `onDone` into `onDelta`
- Add a sentence-boundary detector: when `assistantSoFar` contains a first complete sentence (ends with `.`, `!`, `?`, or `\n`), immediately call `speak()` with that text
- Use a ref flag (`ttsFiredRef`) to ensure TTS only fires once per response (on the first sentence)
- Keep the existing `onDone` logic for crisis detection and metric extraction (those still need full text)

#### 2. CompanionChat (`src/components/member/CompanionChat.tsx`)
- Same pattern: detect first sentence boundary in `onDelta` callback and fire `speakText()` immediately
- Use a ref flag to prevent duplicate TTS calls
- Keep `onDone` for message finalization only

#### 3. AICommandCenter (`src/components/admin/hud/AICommandCenter.tsx`)
- No TTS in this component — no changes needed

### How It Works

```text
Before:  [Stream all text ~~~~] → [TTS API call] → [Audio download] → 🔊 Play
After:   [First sentence ~~] → [TTS API call + Audio download] → 🔊 Play
                              [Rest of text continues streaming ~~~~]
```

The user hears voice output ~2-4 seconds earlier since TTS fires on the first sentence (~20-50 words) instead of waiting for the full response (~100-300 words).

### Technical Details
- Sentence boundary detection: check for `.`, `!`, `?` followed by a space or end-of-string, or a newline after 20+ characters
- A `ttsFiredRef` boolean ref resets to `false` at the start of each `send()` call
- TTS is called with just the first sentence, not the full response — this also makes the TTS faster since shorter text = faster generation
- No edge function changes needed
- No database changes needed

