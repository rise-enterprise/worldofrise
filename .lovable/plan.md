

# Add Voice Input to AI Command Center

## Overview

Add a microphone button to the AI Command Center input bar that uses the browser's native Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) for hands-free voice commands. No external API keys or services required -- this works entirely client-side.

## What Changes

### Single file: `src/components/admin/hud/AICommandCenter.tsx`

1. **Add a `Mic` / `MicOff` icon** from lucide-react
2. **Add voice state**: `isListening` boolean + `SpeechRecognition` instance ref
3. **Add `toggleVoice` handler** that:
   - Creates a `SpeechRecognition` instance (with `continuous: false`, `interimResults: true`, `lang: "en-US"`)
   - On interim results: updates the textarea input live (user sees words appearing as they speak)
   - On final result: auto-sends the command via `send()`
   - On end/error: resets `isListening`
4. **Render mic button** between the textarea and the Send button
   - Idle: muted mic icon
   - Listening: pulsing red/primary mic icon with a glow animation
5. **Graceful fallback**: if `SpeechRecognition` is not supported (Firefox without flag), show a toast explaining browser compatibility

## Technical Details

| Aspect | Detail |
|---|---|
| API | Browser-native `webkitSpeechRecognition` (Chrome/Edge/Safari) |
| Dependencies | None -- zero new packages |
| Behavior | Tap to start listening, tap again to cancel. Final transcript auto-sends. Interim text shows live in textarea. |
| Auto-send | When speech recognition returns a final result, it calls `send()` automatically so the experience is truly hands-free |
| Visual feedback | Mic button pulses with `animate-pulse` + primary color glow while listening |
| File modified | `src/components/admin/hud/AICommandCenter.tsx` only |

