import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CopilotMessage from "../copilot/CopilotMessage";
import { cn } from "@/lib/utils";

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

interface VesselCommandInterfaceProps {
  onListeningChange?: (listening: boolean) => void;
  onPulseIntensity?: (intensity: number) => void;
  onCrisisChange?: (crisis: boolean) => void;
}

export default function VesselCommandInterface({
  onListeningChange,
  onPulseIntensity,
  onCrisisChange,
}: VesselCommandInterfaceProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
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

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  // Browser TTS
  const speak = useCallback((text: string) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    // Strip markdown
    const clean = text.replace(/[#*_`>~\[\]()]/g, "").replace(/\n+/g, ". ").trim();
    if (!clean || clean === lastSpokenRef.current) return;
    lastSpokenRef.current = clean;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(clean.slice(0, 500));
    utterance.rate = 0.95;
    utterance.pitch = 0.85;
    utterance.volume = 0.8;
    // Try to pick a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes("Google UK English Male")) 
      || voices.find(v => v.name.includes("Daniel"))
      || voices.find(v => v.lang === "en-GB" && v.name.includes("Male"))
      || voices.find(v => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

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
    lastSpokenRef.current = "";

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];
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
        if (assistantSoFar) {
          speak(assistantSoFar);
          detectCrisis(assistantSoFar);
        }
      },
      onError: (err) => {
        toast({ title: "AI Error", description: err, variant: "destructive" });
        setIsLoading(false);
      },
    });
  }, [isLoading, messages, speak, detectCrisis]);

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
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
            {/* AI Identity */}
            <div className="mb-6">
              <div className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-1">NOIR Intelligence</div>
              <div className="text-2xl font-serif text-primary tracking-widest">COMMAND VESSEL</div>
              <div className="text-[10px] text-muted-foreground/40 mt-2 tracking-wider">
                Voice-first · AI-only control · All systems operational
              </div>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-6 mb-8 text-[10px] uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-muted-foreground/50">AI Core Online</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-muted-foreground/50">Metrics Synced</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-muted-foreground/50">Threat Clear</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground/50 max-w-md mb-6">
              Speak or type commands. The AI manages all operations — campaigns, analytics, member management, rewards, and predictive intelligence.
            </p>

            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {EXAMPLE_COMMANDS.slice(0, 6).map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => send(cmd)}
                  className="text-[10px] px-3 py-2 rounded-full border border-primary/15 bg-primary/5 text-muted-foreground/60 hover:text-primary hover:border-primary/30 hover:bg-primary/10 transition-all backdrop-blur-sm"
                >
                  {cmd.length > 45 ? cmd.slice(0, 45) + "…" : cmd}
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

      {/* Input bar */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-end gap-2 rounded-2xl bg-card/20 backdrop-blur-xl border border-primary/10 px-4 py-3 shadow-[0_0_40px_-10px_hsl(42,50%,54%,0.15)]">
          {/* TTS toggle */}
          <Button
            onClick={() => { setTtsEnabled(p => !p); window.speechSynthesis?.cancel(); }}
            variant="ghost"
            size="icon"
            className={cn(
              "shrink-0 h-9 w-9 rounded-lg transition-all",
              ttsEnabled ? "text-primary/60" : "text-muted-foreground/30"
            )}
            title={ttsEnabled ? "Mute AI voice" : "Enable AI voice"}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </Button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening…" : "Command the vessel…"}
            className={cn(
              "flex-1 min-h-[36px] max-h-[100px] resize-none rounded-lg px-3 py-2",
              "bg-transparent text-sm text-foreground placeholder:text-muted-foreground/30",
              "focus:outline-none",
              "transition-all duration-200"
            )}
            rows={1}
          />

          {/* Waveform bars */}
          {isListening && (
            <div ref={barsRef} className="flex items-center gap-[2px] h-9 px-1">
              {[0.6, 0.8, 1, 0.8, 0.6].map((base, i) => (
                <span
                  key={i}
                  className="w-[2px] h-4 rounded-full bg-primary/60 origin-center"
                  style={{
                    transform: `scaleY(${base * 0.2})`,
                    transition: "transform 80ms ease-out",
                  }}
                />
              ))}
            </div>
          )}

          {/* Mic button with ripple */}
          <div className="relative shrink-0">
            {isListening && (
              <>
                {[0, 0.4, 0.8].map((delay) => (
                  <span
                    key={delay}
                    className="absolute inset-0 rounded-lg border border-primary/40 pointer-events-none"
                    style={{ animation: `micRipple 1.6s ease-out ${delay}s infinite` }}
                  />
                ))}
              </>
            )}
            <Button
              onClick={toggleVoice}
              variant="ghost"
              size="icon"
              className={cn(
                "relative h-9 w-9 rounded-lg transition-all overflow-visible",
                isListening
                  ? "text-destructive shadow-[0_0_12px_-2px_hsl(var(--destructive)/0.5)]"
                  : "text-muted-foreground/40 hover:text-primary"
              )}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </Button>
          </div>

          {/* Send */}
          <Button
            onClick={() => send(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0 h-9 w-9 rounded-lg bg-primary/80 hover:bg-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(42,50%,54%,0.4)]"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
