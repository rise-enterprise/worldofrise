

# Integrate ElevenLabs TTS into the Command Vessel

## Overview

Replace the browser-native `SpeechSynthesis` TTS with ElevenLabs premium neural voice. The ElevenLabs connector is now linked — `ELEVENLABS_API_KEY` is available as an edge function secret.

## What Changes

### 1. New Edge Function: `supabase/functions/elevenlabs-tts/index.ts`

A simple proxy that accepts `{ text }`, calls the ElevenLabs TTS API with a deep, executive male voice (George — `JBFqnCBsd6RMkjVDRZzb`), and returns raw MP3 audio bytes. Uses `eleven_turbo_v2_5` model for low-latency streaming playback.

- Requires auth (Bearer token from the admin session)
- Verifies admin status before generating audio
- Returns binary `audio/mpeg` response
- Strips markdown from text server-side for cleaner speech

### 2. Update `src/components/admin/vessel/VesselCommandInterface.tsx`

Replace the `speak()` function:

**Current**: Uses `window.speechSynthesis` with `SpeechSynthesisUtterance`

**New**: Calls the `elevenlabs-tts` edge function via `fetch()` with `.blob()`, creates an `Audio` object, and plays it. Includes:

- `speakElevenLabs(text)` — fetches TTS audio from edge function, plays via `new Audio(URL.createObjectURL(blob))`
- Tracks `audioRef` to allow stopping playback when TTS toggle is turned off or a new response arrives
- Falls back silently if the TTS call fails (no toast spam — just logs)
- Cancels any in-flight TTS request when a new command is sent (`AbortController`)
- Cleans up object URLs on unmount

**Remove**: All `window.speechSynthesis` references, voice selection logic, `SpeechSynthesisUtterance` code.

### 3. Voice Selection

Using **George** (`JBFqnCBsd6RMkjVDRZzb`) — a deep, calm, executive male voice that fits the luxury interstellar command aesthetic. The voice ID is hardcoded in the edge function but easy to swap later.

## Technical Details

| Aspect | Detail |
|---|---|
| Edge function | `elevenlabs-tts` — POST `{ text }`, returns `audio/mpeg` binary |
| ElevenLabs model | `eleven_turbo_v2_5` (low latency, high quality) |
| Voice | George (`JBFqnCBsd6RMkjVDRZzb`) — deep executive tone |
| Output format | `mp3_44100_128` (high quality) |
| Client playback | `fetch()` → `.blob()` → `URL.createObjectURL()` → `new Audio()` |
| Text limit | First 500 chars of cleaned (markdown-stripped) text |
| Auth | Admin-only, verified via session token |
| Cleanup | AbortController for in-flight requests, `URL.revokeObjectURL` on unmount |
| Files | 1 new edge function, 1 component edit |

