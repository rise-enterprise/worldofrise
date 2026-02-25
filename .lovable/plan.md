

# Add Audio Waveform Bar Visualizer to Mic Button

## Overview

Add a 5-bar audio waveform visualizer that appears next to the mic button when listening. It uses the Web Audio API (`AudioContext` + `AnalyserNode`) to capture real microphone volume and drive bar heights in real-time via `requestAnimationFrame`. When not listening, the bars are hidden.

## What Changes

### 1. `src/components/admin/hud/AICommandCenter.tsx`

**New state/refs:**
- `analyserRef` — holds the `AnalyserNode` for frequency data
- `animFrameRef` — holds the `requestAnimationFrame` ID for cleanup
- `barsRef` — ref to the container div holding 5 bar `<span>` elements
- `audioContextRef` / `streamRef` — for cleanup on stop

**In `toggleVoice`** (start path):
- After creating `SpeechRecognition`, also call `navigator.mediaDevices.getUserMedia({ audio: true })` to get the mic stream
- Create an `AudioContext`, connect the stream to an `AnalyserNode` (fftSize: 64)
- Start a `requestAnimationFrame` loop that reads `getByteFrequencyData` and maps 5 frequency bins to CSS `scaleY` transforms on the bar spans

**In `toggleVoice`** (stop path) and `recognition.onend`:
- Cancel the animation frame, close the audio context, stop the media stream tracks

**New JSX — waveform bars:**
- Render a small flex container with 5 thin vertical bars (`w-[2px] h-4 bg-primary/60 rounded-full`) to the left of the mic button, only when `isListening`
- Each bar's `scaleY` is driven by the analyser data, with a CSS `transition: transform 80ms` for smoothness
- Bars have staggered base heights for visual variety when idle

### 2. No CSS changes needed
Bar animations are driven by inline `transform` styles from the analyser data. The existing `micRipple` keyframe stays.

## Technical Details

| Aspect | Detail |
|---|---|
| API | `navigator.mediaDevices.getUserMedia` + Web Audio API `AnalyserNode` |
| Dependencies | None — all browser-native |
| Performance | `fftSize: 64` keeps FFT tiny (32 bins), only reading 5 values per frame |
| Cleanup | Audio context closed, media stream stopped, animation frame cancelled on stop |
| Visual | 5 bars, each 2px wide, 16px tall max, `bg-primary/60`, `rounded-full`, 2px gap, smooth 80ms transitions |
| Fallback | If `getUserMedia` fails (permission denied), voice still works — bars just won't animate |
| File modified | `src/components/admin/hud/AICommandCenter.tsx` only |

