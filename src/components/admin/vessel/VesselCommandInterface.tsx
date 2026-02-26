import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CopilotMessage from "../copilot/CopilotMessage";
import { cn } from "@/lib/utils";
import { useAIPersonality } from "@/contexts/AIPersonalityContext";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-copilot`;

const EXAMPLE_COMMANDS = [
  "Show me today's key metrics and anything that needs attention",
  "Find members at high churn risk and suggest re-engagement strategies",
  "Compare NOIR vs SASSO performance this month",
  "Draft a reactivation campaign for dormant VIPs",
  "Predict next month loyalty revenue",
  "Explain retention drop",
  "Generate executive summary",
  "Deploy double points for 5 days in Doha",
];

async function streamChat({
  messages, token, onDelta, onDone, onError,
}: {
  messages: Msg[]; token: string;
  onDelta: (t: string) => void; onDone: () => void; onError: (err: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages }),
  });
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    onError(body.error ?? `Error ${resp.status}`);
    return;
  }
  if (!resp.body) { onError("No response stream"); return; }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  onDone();
}

/* ── Extract numeric metrics from AI text ── */
function extractMetrics(text: string): { label: string; value: number }[] {
  const metrics: { label: string; value: number }[] = [];
  const seen = new Set<string>();

  const parseNum = (s: string) => Number(s.replace(/,/g, "").replace(/%$/, ""));

  // Pattern 1: **number** label  (bold markdown numbers)
  const p1 = /\*\*([0-9,]+(?:\.[0-9]+)?%?)\*\*\s+([a-zA-Z][a-zA-Z\s]{1,25})/g;
  // Pattern 2: number + keyword label
  const p2 = /(?:^|\s)([0-9,]+(?:\.[0-9]+)?%?)\s+((?:total|active|vip|new|dormant|at.risk|high.risk|churn|members?|guests?|visits?|points?|rewards?|campaigns?|retention)[a-zA-Z\s]{0,20})/gi;
  // Pattern 3: label: number
  const p3 = /([\w\s]{2,20}):\s*\*?\*?([0-9,]+(?:\.[0-9]+)?%?)\*?\*?/g;

  const add = (label: string, raw: string) => {
    const v = parseNum(raw);
    if (isNaN(v) || v === 0) return;
    const key = label.trim().toLowerCase().replace(/\s+/g, " ");
    if (key.length < 2 || key.length > 25 || seen.has(key)) return;
    // Skip pure noise words
    if (/^(the|and|or|is|are|was|were|has|have|a|an|in|on|of|to|for|with|that|this)$/i.test(key)) return;
    seen.add(key);
    metrics.push({ label: label.trim(), value: v });
  };

  let m: RegExpExecArray | null;
  while ((m = p1.exec(text)) !== null) add(m[2], m[1]);
  while ((m = p2.exec(text)) !== null) add(m[2], m[1]);
  while ((m = p3.exec(text)) !== null) add(m[1], m[2]);

  return metrics.slice(0, 6);
}

interface VesselCommandInterfaceProps {
  onListeningChange?: (listening: boolean) => void;
  onPulseIntensity?: (intensity: number) => void;
  onCrisisChange?: (crisis: boolean) => void;
  onAIMetrics?: (metrics: { label: string; value: number }[]) => void;
  onProcessingChange?: (processing: boolean) => void;
  onSpeakingChange?: (speaking: boolean) => void;
}

export default function VesselCommandInterface({
  onListeningChange,
  onPulseIntensity,
  onCrisisChange,
  onAIMetrics,
  onProcessingChange,
  onSpeakingChange,
}: VesselCommandInterfaceProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const { config: personalityConfig } = useAIPersonality();
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const barsRef = useRef<HTMLDivElement>(null);
  const lastSpokenRef = useRef<string>("");
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const ttsObjectUrlRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      ttsAbortRef.current?.abort();
      ttsAudioRef.current?.pause();
      if (ttsObjectUrlRef.current) URL.revokeObjectURL(ttsObjectUrlRef.current);
    };
  }, []);

  // Stop current TTS playback
  const stopTts = useCallback(() => {
    ttsAbortRef.current?.abort();
    ttsAudioRef.current?.pause();
    ttsAudioRef.current = null;
    if (ttsObjectUrlRef.current) {
      URL.revokeObjectURL(ttsObjectUrlRef.current);
      ttsObjectUrlRef.current = null;
    }
  }, []);

  // ElevenLabs TTS
  const speak = useCallback(async (text: string) => {
    if (!ttsEnabled) return;
    const clean = text.replace(/[#*_`>~\[\]()]/g, "").replace(/\n+/g, ". ").trim();
    if (!clean || clean === lastSpokenRef.current) return;
    lastSpokenRef.current = clean;

    stopTts();

    const controller = new AbortController();
    ttsAbortRef.current = controller;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ text: clean }),
          signal: controller.signal,
        }
      );

      if (!resp.ok) {
        console.warn("ElevenLabs TTS failed:", resp.status);
        return;
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      ttsObjectUrlRef.current = url;

      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      audio.volume = 0.8;
      onSpeakingChange?.(true);
      audio.onended = () => onSpeakingChange?.(false);
      await audio.play();
    } catch (err: unknown) {
      onSpeakingChange?.(false);
      if (err instanceof Error && err.name === "AbortError") return;
      console.warn("ElevenLabs TTS error:", err);
    }
  }, [ttsEnabled, stopTts]);

  // Detect crisis keywords in AI response
  const detectCrisis = useCallback((content: string) => {
    const crisisKeywords = ["instability", "anomaly", "crisis", "critical", "alert", "urgent", "immediate action", "sharp drop", "sudden"];
    const isCrisis = crisisKeywords.some(k => content.toLowerCase().includes(k));
    onCrisisChange?.(isCrisis);
  }, [onCrisisChange]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    onProcessingChange?.(true);
    lastSpokenRef.current = "";
    stopTts();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    const systemMsg: Msg = { role: "user", content: `[SYSTEM MODE: ${personalityConfig.label.toUpperCase()}] ${personalityConfig.systemPromptPrefix}` };
    const allMessages = [systemMsg, ...messages, userMsg];
    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: allMessages,
      token: session.access_token,
      onDelta: upsert,
      onDone: () => {
        setIsLoading(false);
        onProcessingChange?.(false);
        if (assistantSoFar) {
          speak(assistantSoFar);
          detectCrisis(assistantSoFar);
          const extracted = extractMetrics(assistantSoFar);
          if (extracted.length > 0) onAIMetrics?.(extracted);
        }
      },
      onError: (err) => {
        toast({ title: "AI Error", description: err, variant: "destructive" });
        setIsLoading(false);
        onProcessingChange?.(false);
      },
    });
  }, [isLoading, messages, speak, detectCrisis, stopTts, onProcessingChange, personalityConfig]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const stopAudio = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = 0;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    analyserRef.current = null;
    onPulseIntensity?.(0);
  }, [onPulseIntensity]);

  const startAudioVisualizer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const bins = [2, 5, 8, 12, 16];

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const bars = barsRef.current?.children;
        let avgLevel = 0;
        if (bars) {
          for (let i = 0; i < bins.length; i++) {
            const v = data[bins[i]] ?? 0;
            avgLevel += v;
            const scale = 0.15 + (v / 255) * 0.85;
            (bars[i] as HTMLElement).style.transform = `scaleY(${scale})`;
          }
        }
        avgLevel = avgLevel / bins.length / 255;
        onPulseIntensity?.(avgLevel);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    } catch {
      // voice still works
    }
  }, [onPulseIntensity]);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.abort();
      stopAudio();
      setIsListening(false);
      onListeningChange?.(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      toast({ title: "Not supported", description: "Voice requires Chrome, Edge, or Safari.", variant: "destructive" });
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let interim = "";
      let finalText = "";
      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }
      if (finalText) {
        setInput("");
        stopAudio();
        setIsListening(false);
        onListeningChange?.(false);
        send(finalText);
      } else {
        setInput(interim);
      }
    };
    recognition.onerror = () => { stopAudio(); setIsListening(false); onListeningChange?.(false); };
    recognition.onend = () => { stopAudio(); setIsListening(false); onListeningChange?.(false); };
    recognition.start();
    startAudioVisualizer();
    setIsListening(true);
    onListeningChange?.(true);
  }, [isListening, send, stopAudio, startAudioVisualizer, onListeningChange]);

  const isEmpty = messages.length === 0;

  return (
    <div className="relative z-20 flex flex-col h-full max-w-3xl mx-auto w-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 scrollbar-hide min-h-0">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-6 sm:py-12 px-3 sm:px-4">
            {/* AI Identity */}
            <div className="mb-4 sm:mb-6">
              <div className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary/60 mb-1">RISE Intelligence</div>
              <div className="text-xl sm:text-2xl font-serif text-primary tracking-widest">COMMAND CHAMBER</div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground/40 mt-2 tracking-wider">
                Voice-first · AI-only control · All systems operational
              </div>
            </div>
            
            {/* Status indicators */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-6 sm:mb-8 text-[9px] sm:text-[10px] uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-muted-foreground/50">AI Core</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-muted-foreground/50">Synced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-muted-foreground/50">Clear</span>
              </div>
            </div>

            <p className="text-[11px] sm:text-xs text-muted-foreground/50 max-w-md mb-4">
              Speak or type commands. The AI manages all operations — campaigns, analytics, member management, rewards, and predictive intelligence.
            </p>

            <a
              href="/admin/operator"
              className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] px-3 sm:px-4 py-2 rounded-lg border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 transition-all mb-4 sm:mb-6 uppercase tracking-widest"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              AI Operator Console
            </a>

            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center max-w-lg">
              {EXAMPLE_COMMANDS.slice(0, 6).map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => send(cmd)}
                  className="text-[9px] sm:text-[10px] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border border-primary/15 bg-primary/5 text-muted-foreground/60 hover:text-primary hover:border-primary/30 hover:bg-primary/10 transition-all backdrop-blur-sm"
                >
                  {cmd.length > 35 ? cmd.slice(0, 35) + "…" : cmd}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-1">
            {messages.map((msg, i) => (
              <CopilotMessage
                key={i}
                role={msg.role}
                content={msg.content}
                isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      {!isEmpty && !isLoading && (
        <div className="flex gap-1.5 px-4 py-2 overflow-x-auto scrollbar-hide">
          {EXAMPLE_COMMANDS.slice(4, 8).map((cmd) => (
            <button
              key={cmd}
              onClick={() => send(cmd)}
              className="shrink-0 text-[9px] px-2.5 py-1.5 rounded-full border border-primary/10 bg-primary/5 text-muted-foreground/50 hover:text-primary hover:border-primary/20 transition-all"
            >
              {cmd.length > 40 ? cmd.slice(0, 40) + "…" : cmd}
            </button>
          ))}
        </div>
      )}

      {/* ── Neural Command Strip ── */}
      <div className="px-3 sm:px-6 pb-safe pb-5 pt-2 relative">
        {/* Light beam from input to core (when active) */}
        {(isListening || isLoading) && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-[2px] pointer-events-none"
            style={{
              height: "40vh",
              background: `linear-gradient(to top, ${isListening ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.6)"}, transparent)`,
              opacity: isListening ? 0.5 : 0.25,
              animation: "neuralBeamPulse 2s ease-in-out infinite",
            }}
          />
        )}

        {/* Glass command bar */}
        <div
          className={cn(
            "relative flex items-end gap-2 sm:gap-3 rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 transition-all duration-500",
            "bg-background/10 backdrop-blur-2xl",
            "border shadow-lg",
            isListening
              ? "border-primary/40 shadow-[0_0_60px_-10px_hsl(var(--primary)/0.3),inset_0_1px_0_0_hsl(var(--primary)/0.1)]"
              : isLoading
                ? "border-primary/20 shadow-[0_0_40px_-10px_hsl(var(--primary)/0.15)]"
                : "border-primary/8 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.08)]"
          )}
        >
          {/* Subtle gradient border overlay */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: isListening
                ? "linear-gradient(135deg, hsl(var(--primary) / 0.06), transparent 50%, hsl(var(--primary) / 0.03))"
                : "linear-gradient(135deg, hsl(var(--primary) / 0.02), transparent 60%)",
            }}
          />

          {/* TTS toggle */}
          <Button
            onClick={() => { setTtsEnabled(p => !p); stopTts(); }}
            variant="ghost"
            size="icon"
            className={cn(
              "shrink-0 h-9 w-9 rounded-xl transition-all relative z-10",
              ttsEnabled
                ? "text-primary/70 hover:text-primary hover:bg-primary/10"
                : "text-muted-foreground/25 hover:text-muted-foreground/50"
            )}
            title={ttsEnabled ? "Mute AI voice" : "Enable AI voice"}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </Button>

          {/* Input field */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Neural link active — speak your command…" : "Command the intelligence…"}
            className={cn(
              "flex-1 min-h-[36px] max-h-[100px] resize-none rounded-lg px-3 py-2 relative z-10",
              "bg-transparent text-sm text-foreground/90 placeholder:text-muted-foreground/25",
              "focus:outline-none focus:placeholder:text-muted-foreground/40",
              "transition-all duration-300"
            )}
            rows={1}
          />

          {/* Enhanced waveform visualizer */}
          {isListening && (
            <div ref={barsRef} className="flex items-center gap-[3px] h-9 px-2 relative z-10">
              {[0.5, 0.65, 0.8, 1, 0.8, 0.65, 0.5].map((base, i) => (
                <span
                  key={i}
                  className="w-[2.5px] h-5 rounded-full origin-center"
                  style={{
                    background: `linear-gradient(to top, hsl(var(--primary)), hsl(var(--primary) / 0.4))`,
                    transform: `scaleY(${base * 0.15})`,
                    transition: "transform 60ms ease-out",
                    boxShadow: "0 0 6px hsl(var(--primary) / 0.3)",
                  }}
                />
              ))}
            </div>
          )}

          {/* Mic button */}
          <div className="relative shrink-0 z-10">
            {isListening && (
              <>
                {[0, 0.5, 1].map((delay) => (
                  <span
                    key={delay}
                    className="absolute inset-[-4px] rounded-xl border border-primary/30 pointer-events-none"
                    style={{ animation: `micRipple 2s ease-out ${delay}s infinite` }}
                  />
                ))}
              </>
            )}
            <Button
              onClick={toggleVoice}
              variant="ghost"
              size="icon"
              className={cn(
                "relative h-9 w-9 rounded-xl transition-all overflow-visible",
                isListening
                  ? "text-primary bg-primary/15 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)]"
                  : "text-muted-foreground/35 hover:text-primary hover:bg-primary/10"
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>

          {/* Send button */}
          <Button
            onClick={() => send(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className={cn(
              "shrink-0 h-9 w-9 rounded-xl transition-all relative z-10",
              "bg-primary/80 hover:bg-primary text-primary-foreground",
              "shadow-[0_0_25px_-5px_hsl(var(--primary)/0.4)]",
              "disabled:opacity-20 disabled:shadow-none"
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Subtle label under the bar */}
        <div className="flex justify-center mt-2">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.35em] text-muted-foreground/20">
            {isListening ? "◉ NEURAL LINK ACTIVE" : isLoading ? "◎ PROCESSING COMMAND" : "RISE NEURAL COMMAND"}
          </span>
        </div>
      </div>
    </div>
  );
}
