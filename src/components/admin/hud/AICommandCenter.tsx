import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Sparkles, RotateCcw, Terminal, ChevronUp, ChevronDown, Mic, MicOff } from "lucide-react";
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
  "Draft a reactivation campaign for dormant VIPs with double points for 7 days",
  "Show retention D30 for West Walk vs Al Hazm last 90 days",
  "Which reward has the best ROI and why?",
  "Create a segment of members who visited 2+ times but never redeemed",
  "Explain why redemption dropped this week",
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
export default function AICommandCenter() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const barsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setExpanded(true);

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
      onDone: () => setIsLoading(false),
      onError: (err) => {
        toast({ title: "AI Error", description: err, variant: "destructive" });
        setIsLoading(false);
      },
    });
  }, [isLoading, messages]);

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
  }, []);

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
      const bins = [2, 5, 8, 12, 16]; // pick 5 spread-out bins

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const bars = barsRef.current?.children;
        if (bars) {
          for (let i = 0; i < bins.length; i++) {
            const v = data[bins[i]] ?? 0;
            const scale = 0.15 + (v / 255) * 0.85;
            (bars[i] as HTMLElement).style.transform = `scaleY(${scale})`;
          }
        }
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    } catch {
      // getUserMedia failed — voice still works, bars just won't animate
    }
  }, []);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.abort();
      stopAudio();
      setIsListening(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      toast({ title: "Not supported", description: "Voice input requires Chrome, Edge, or Safari.", variant: "destructive" });
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
        send(finalText);
      } else {
        setInput(interim);
      }
    };
    recognition.onerror = () => { stopAudio(); setIsListening(false); };
    recognition.onend = () => { stopAudio(); setIsListening(false); };
    recognition.start();
    startAudioVisualizer();
    setIsListening(true);
  }, [isListening, send, stopAudio, startAudioVisualizer]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-border/20 bg-card/20 backdrop-blur-xl">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b border-border/20 cursor-pointer select-none"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          </div>
          <span className="text-xs uppercase tracking-[0.15em] text-primary/80 font-body font-semibold">
            NOIR AI Command
          </span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setMessages([]); setInput(""); }}>
              <RotateCcw className="w-3 h-3 text-muted-foreground" />
            </Button>
          )}
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 scrollbar-hide min-h-0">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-6 px-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground/70 max-w-sm mb-4">
                  Control everything through natural language. Ask questions, run analysis, create campaigns, manage rewards.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center max-w-md">
                  {EXAMPLE_COMMANDS.slice(0, 4).map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => send(cmd)}
                      className="text-[10px] px-2.5 py-1.5 rounded-full border border-border/30 bg-muted/20 text-muted-foreground/70 hover:text-foreground hover:border-primary/30 hover:bg-muted/40 transition-all"
                    >
                      {cmd.length > 45 ? cmd.slice(0, 45) + "…" : cmd}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-2">
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

          {/* Quick actions row when in conversation */}
          {!isEmpty && !isLoading && (
            <div className="flex gap-1 px-3 py-1.5 overflow-x-auto scrollbar-hide border-t border-border/10">
              {EXAMPLE_COMMANDS.slice(4, 8).map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => send(cmd)}
                  className="shrink-0 text-[9px] px-2 py-1 rounded-full border border-border/20 bg-muted/10 text-muted-foreground/60 hover:text-foreground hover:border-primary/20 transition-all"
                >
                  {cmd.length > 40 ? cmd.slice(0, 40) + "…" : cmd}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border/20 px-3 py-2.5">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Command the AI…"
                className={cn(
                  "flex-1 min-h-[36px] max-h-[100px] resize-none rounded-lg px-3 py-2",
                  "bg-muted/20 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/40",
                  "focus:outline-none focus:border-primary/40 focus:shadow-[0_0_12px_-4px_hsl(42,50%,54%,0.2)]",
                  "transition-all duration-200"
                )}
                rows={1}
              />
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
                      : "text-muted-foreground/50 hover:text-foreground"
                  )}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </Button>
              </div>
              <Button
                onClick={() => send(input)}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="shrink-0 h-9 w-9 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground shadow-gold-glow"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
