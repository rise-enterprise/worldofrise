

# Plan: Make the AI Interactive

## Current State
The AI has text chat, voice input (browser STT), TTS output (ElevenLabs), and an animated avatar with idle/listening/thinking/speaking CSS states. But the experience feels passive — the AI waits silently, the avatar is decorative, and there's no sense of a "living" presence.

## Changes

### 1. Auto-Greeting on Page Load (`VesselCommandInterface.tsx`)
- When the chat view mounts with an empty conversation, automatically trigger a greeting message from the AI (e.g. "Welcome back. How can I assist you today?")
- The avatar transitions from `idle` → `thinking` → `speaking` during the greeting
- TTS reads the greeting aloud if enabled
- Add a short delay (1.5s) so the entrance feels cinematic, not instant

### 2. Sound-Reactive Avatar During TTS (`VesselCommandInterface.tsx` + `AIAvatar.tsx`)
- When TTS audio plays, connect it to an `AudioContext` + `AnalyserNode` to get real-time frequency data
- Pass an `audioLevel` (0-1) prop to `AIAvatar`
- Avatar uses `audioLevel` to:
  - Scale the mouth glow intensity
  - Pulse the outer rings in sync with speech amplitude
  - Modulate particle speed and brightness
- This makes the avatar visually "speak" in response to actual audio output

### 3. Enhanced AIAvatar with Audio Reactivity (`AIAvatar.tsx`)
- Add `audioLevel?: number` prop
- When `state === "speaking"` and `audioLevel > 0`:
  - Inner glow pulses proportionally to audio level
  - Ring borders brighten/dim with the voice
  - Add a "sound wave" arc visualization below the avatar (3 concentric arcs that scale with audio)
- When `state === "listening"`:
  - Accept `inputLevel?: number` and pulse the cyan rings accordingly
- Smooth all transitions with CSS `transition: all 100ms`

### 4. Click-to-Talk on Avatar (`VesselCommandInterface.tsx`)
- Make the AIAvatar clickable in the empty state
- Clicking it activates voice input (same as mic button)
- Add a subtle "Tap to speak" label beneath the avatar that fades in after the greeting
- Avatar ring glows brighter on hover as affordance

### 5. Member Companion Greeting (`CompanionChat.tsx`)
- Auto-send a personalized greeting using the member's name when chat opens
- Avatar animates through thinking → speaking states during greeting
- Same sound-reactive pattern as admin view

### 6. Consistent State Transitions
- Ensure all AI views (admin, member, operator) follow the same state machine:
  - `idle` → user types/speaks → `listening` → submit → `thinking` → stream starts → `speaking` → stream ends → `idle`
- Add a brief `thinking` pause (300ms minimum) before streaming begins so the transition feels natural

## Files to Edit
- `src/components/admin/ai/AIAvatar.tsx` — add `audioLevel` prop, sound-reactive visuals
- `src/components/admin/vessel/VesselCommandInterface.tsx` — auto-greeting, TTS audio analysis, click-to-talk avatar
- `src/components/member/CompanionChat.tsx` — auto-greeting, audio-reactive avatar
- `src/components/admin/layout/views/AIChatView.tsx` — minor: pass audio level through

