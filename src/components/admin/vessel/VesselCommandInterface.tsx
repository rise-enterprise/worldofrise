import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Paperclip, X, TrendingUp, Users, Zap, BarChart3, Target, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CopilotMessage from "../copilot/CopilotMessage";
import { cn } from "@/lib/utils";
import { useAIPersonality } from "@/contexts/AIPersonalityContext";
import riseLogo from "@/assets/rise-holding-logo.png";

interface Attachment {
  url: string;
  type: string;
  name: string;
}

type Msg = { role: "user" | "assistant"; content: string; attachments?: Attachment[] };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-copilot`;

const EXAMPLE_COMMANDS = [
  { icon: TrendingUp, label: "Lifetime Value Trends", cmd: "Customer lifetime value trends." },
  { icon: Users, label: "VIP Engagement", cmd: "NOIR VIP engagement this quarter." },
  { icon: Target, label: "Retention Status", cmd: "SASSO Riyadh retention status." },
  { icon: Zap, label: "Tier Candidates", cmd: "Tier elevation candidates." },
  { icon: BarChart3, label: "Brand Comparison", cmd: "Brand performance comparison." },
  { icon: Globe, label: "Churn Forecast", cmd: "Churn risk forecast. Next 30 days." },
];

async function streamChat({
  messages, token, attachments, onDelta, onDone, onError,
}: {
  messages: Msg[]; token: string; attachments?: Attachment[];
  onDelta: (t: string) => void; onDone: () => void; onError: (err: string) => void;
}) {
  const cleanMessages = messages.map(m => ({ role: m.role, content: m.content }));
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages: cleanMessages, attachments }),
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
  const { systemPrompt, modelConfig } = useAIPersonality();
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    return () => {
      ttsAbortRef.current?.abort();
      ttsAudioRef.current?.pause();
      if (ttsObjectUrlRef.current) URL.revokeObjectURL(ttsObjectUrlRef.current);
    };
  }, []);

  const stopTts = useCallback(() => {
    ttsAbortRef.current?.abort();
    ttsAudioRef.current?.pause();
    ttsAudioRef.current = null;
    if (ttsObjectUrlRef.current) {
      URL.revokeObjectURL(ttsObjectUrlRef.current);
      ttsObjectUrlRef.current = null;
    }
  }, []);

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
      if (!resp.ok) return;
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
    }
  }, [ttsEnabled, stopTts, onSpeakingChange]);

  const detectCrisis = useCallback((content: string) => {
    const crisisKeywords = ["instability", "anomaly", "crisis", "critical", "alert", "urgent", "immediate action", "sharp drop", "sudden"];
    const isCrisis = crisisKeywords.some(k => content.toLowerCase().includes(k));
    onCrisisChange?.(isCrisis);
  }, [onCrisisChange]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Session expired", variant: "destructive" });
      setIsUploading(false);
      return;
    }
    const newAttachments: Attachment[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: `${file.name} exceeds 10MB limit`, variant: "destructive" });
        continue;
      }
      const ext = file.name.split('.').pop() || 'bin';
      const path = `uploads/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("chat-attachments").upload(path, file, { contentType: file.type });
      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("chat-attachments").getPublicUrl(path);
      newAttachments.push({ url: urlData.publicUrl, type: file.type, name: file.name });
    }
    setPendingAttachments(prev => [...prev, ...newAttachments]);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const send = useCallback(async (text: string) => {
    if ((!text.trim() && pendingAttachments.length === 0) || isLoading) return;
    const userMsg: Msg = {
      role: "user",
      content: text.trim() || (pendingAttachments.length > 0 ? "Analyze the attached file(s)" : ""),
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
    };
    const currentAttachments = [...pendingAttachments];
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setPendingAttachments([]);
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

    const sysMsg: Msg = { role: "user", content: `[SYSTEM] ${systemPrompt}` };
    const allMessages = [sysMsg, ...messages, userMsg];
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

    const doStream = async (retry = false) => {
      try {
        await streamChat({
          messages: allMessages,
          token: session.access_token,
          attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
          onDelta: upsert,
          onDone: () => {
            setIsLoading(false);
            onProcessingChange?.(false);
            if (assistantSoFar) {
              speak(assistantSoFar);
              detectCrisis(assistantSoFar);
            }
          },
          onError: async (err) => {
            if (!retry && (err.includes("500") || err.includes("unavailable"))) {
              await new Promise(r => setTimeout(r, 2000));
              assistantSoFar = "";
              await doStream(true);
            } else {
              toast({ title: "AI Error", description: err, variant: "destructive" });
              setIsLoading(false);
              onProcessingChange?.(false);
            }
          },
        });
      } catch {
        if (!retry) {
          await new Promise(r => setTimeout(r, 2000));
          assistantSoFar = "";
          await doStream(true);
        } else {
          toast({ title: "AI Error", description: "Failed after retry. Please try again.", variant: "destructive" });
          setIsLoading(false);
          onProcessingChange?.(false);
        }
      }
    };

    await doStream();
  }, [isLoading, messages, speak, detectCrisis, stopTts, onProcessingChange, systemPrompt, pendingAttachments]);

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
    } catch { /* voice still works */ }
  }, [onPulseIntensity]);

  const toggleVoice = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.abort();
      stopAudio();
      setIsListening(false);
      onListeningChange?.(false);
      return;
    }
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
        if (event.results[i].isFinal) finalText += transcript;
        else interim += transcript;
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
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,application/pdf,.csv,.xlsx"
        multiple
        onChange={handleFileSelect}
      />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 scrollbar-hide min-h-0">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-16 px-4">
            {/* Enlarged AI Core — 240px with HUD grid */}
            <div className="relative mb-10" style={{ width: 240, height: 240 }}>
              {/* HUD grid behind orb */}
              <div
                className="absolute inset-[-20px] rounded-full pointer-events-none opacity-[0.04]"
                style={{
                  backgroundImage: `
                    linear-gradient(hsl(var(--gold) / 0.5) 1px, transparent 1px),
                    linear-gradient(90deg, hsl(var(--gold) / 0.5) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                  maskImage: "radial-gradient(circle, black 40%, transparent 70%)",
                  WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 70%)",
                }}
              />

              {/* Outer ring — counter-rotating */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  top: "50%", left: "50%",
                  width: 180, height: 180,
                  transform: "translate(-50%, -50%)",
                  border: "1px solid hsl(var(--gold) / 0.06)",
                  animation: "orbitDot 30s linear infinite reverse",
                }}
              />

              {/* Sonar pulse rings */}
              {[0, 1, 2].map((i) => (
                <div
                  key={`sonar-${i}`}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    top: "50%", left: "50%",
                    width: 140, height: 140,
                    transform: "translate(-50%, -50%)",
                    border: "1px solid hsl(var(--gold) / 0.12)",
                    animation: `sonarPulse ${isLoading ? "2.5s" : "4.5s"} ease-out ${i * (isLoading ? 0.8 : 1.5)}s infinite`,
                  }}
                />
              ))}

              {/* Orbiting particles — more dense */}
              {[
                { r: 75, dur: 8, size: 3.5, opacity: 0.55 },
                { r: 75, dur: 12, size: 2.5, opacity: 0.4, offset: 120 },
                { r: 75, dur: 10, size: 3, opacity: 0.5, offset: 200 },
                { r: 95, dur: 14, size: 2.5, opacity: 0.35 },
                { r: 95, dur: 9, size: 3.5, opacity: 0.45, offset: 90 },
                { r: 95, dur: 16, size: 2, opacity: 0.3, offset: 250 },
                { r: 60, dur: 7, size: 2, opacity: 0.6, offset: 45 },
                { r: 60, dur: 11, size: 2.5, opacity: 0.5, offset: 180 },
              ].map((p, i) => (
                <div
                  key={`orbit-${i}`}
                  className="absolute pointer-events-none"
                  style={{
                    top: "50%", left: "50%",
                    width: p.r * 2, height: p.r * 2,
                    marginLeft: -p.r, marginTop: -p.r,
                    animation: `orbitDot ${isListening ? p.dur * 0.6 : p.dur}s linear ${(p.offset || 0) / 360 * p.dur}s infinite`,
                  }}
                >
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: p.size, height: p.size,
                      top: 0, left: "50%",
                      marginLeft: -p.size / 2,
                      backgroundColor: "hsl(var(--gold))",
                      opacity: p.opacity,
                      boxShadow: "0 0 8px hsl(var(--gold) / 0.5)",
                    }}
                  />
                </div>
              ))}

              {/* Loading arc */}
              {isLoading && (
                <svg
                  className="absolute"
                  style={{ top: "50%", left: "50%", marginLeft: -70, marginTop: -70 }}
                  width={140} height={140}
                  viewBox="0 0 140 140"
                >
                  <circle
                    cx={70} cy={70} r={65}
                    fill="none"
                    stroke="hsl(var(--gold) / 0.3)"
                    strokeWidth={1.5}
                    strokeDasharray="70 340"
                    strokeLinecap="round"
                    style={{ animation: "spinArc 1.8s linear infinite", transformOrigin: "center" }}
                  />
                </svg>
              )}

              {/* Outer glow ring */}
              <div
                className="absolute rounded-full"
                style={{
                  top: "50%", left: "50%",
                  width: 140, height: 140,
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(circle, hsl(var(--gold) / 0.08) 0%, hsl(var(--gold) / 0.02) 60%, transparent 100%)",
                  border: "1px solid hsl(var(--gold) / 0.12)",
                }}
              />

              {/* Inner core */}
              <div
                className="absolute rounded-full flex items-center justify-center"
                style={{
                  top: "50%", left: "50%",
                  width: 100, height: 100,
                  transform: "translate(-50%, -50%)",
                  background: isListening
                    ? "radial-gradient(circle, hsl(var(--gold) / 0.2) 0%, transparent 70%)"
                    : "radial-gradient(circle, hsl(var(--gold) / 0.12) 0%, transparent 70%)",
                  border: "1px solid hsl(var(--gold) / 0.1)",
                  animation: `breathe ${isLoading ? "2s" : "4s"} ease-in-out infinite`,
                  boxShadow: isLoading
                    ? "0 0 60px hsl(var(--gold) / 0.2)"
                    : isListening
                      ? "0 0 40px hsl(var(--gold) / 0.15)"
                      : "0 0 30px hsl(var(--gold) / 0.08)",
                }}
              >
                <img src={riseLogo} alt="RISE" className="h-10 w-auto opacity-70" />
              </div>

              {/* Breathing glow — larger */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  top: "50%", left: "50%",
                  width: 200, height: 200,
                  transform: "translate(-50%, -50%)",
                  background: "radial-gradient(circle, hsl(var(--gold) / 0.06) 0%, transparent 70%)",
                  animation: `breathe ${isLoading ? "2s" : "4s"} ease-in-out infinite`,
                }}
              />
            </div>

            {/* Title with gradient sweep */}
            <div className="text-2xl tracking-[0.25em] font-medium mb-2 relative overflow-hidden">
              <span
                className="bg-clip-text"
                style={{
                  animation: "shimmerText 6s ease-in-out infinite",
                  backgroundImage: `linear-gradient(90deg, hsl(var(--foreground)) 0%, hsl(var(--foreground)) 40%, hsl(var(--gold)) 50%, hsl(var(--foreground)) 60%, hsl(var(--foreground)) 100%)`,
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                RISE ONE
              </span>
            </div>

            <div
              className="text-[11px] tracking-[0.2em] uppercase mb-10 text-muted-foreground/50 animate-fade-in"
              style={{ animationDelay: "300ms", animationFillMode: "both" }}
            >
              Executive Intelligence System
            </div>

            {/* Status indicators */}
            <div className="flex items-center gap-5 mb-8 text-[9px] uppercase tracking-[0.15em]">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                  style={{ animation: "statusPulse 3s ease-in-out infinite" }}
                />
                <span className="text-muted-foreground/50">Online</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  style={{ animation: "statusPulse 3s ease-in-out 1s infinite" }}
                />
                <span className="text-muted-foreground/50">Tools Active</span>
              </div>
            </div>

            <p
              className="text-xs max-w-md mb-8 leading-relaxed text-muted-foreground/40 animate-fade-in"
              style={{ animationDelay: "500ms", animationFillMode: "both" }}
            >
              Query insights. Analyze performance. Generate reports.
            </p>

            {/* Glass command cards — 2-column grid */}
            <div className="grid grid-cols-2 gap-2.5 max-w-md w-full">
              {EXAMPLE_COMMANDS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.cmd}
                    onClick={() => send(item.cmd)}
                    className="group relative flex items-center gap-2.5 px-4 py-3 rounded-xl text-left transition-all duration-300 backdrop-blur-md border border-border/20 bg-card/30 hover:bg-primary/[0.06] hover:border-primary/20 hover:shadow-[0_0_20px_-6px_hsl(var(--gold)_/_0.12)] animate-fade-in"
                    style={{
                      animationDelay: `${600 + idx * 80}ms`,
                      animationFillMode: "both",
                    }}
                  >
                    <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-primary/[0.06] border border-primary/10 transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/20">
                      <Icon className="w-3.5 h-3.5 text-primary/50 transition-all duration-300 group-hover:text-primary group-hover:drop-shadow-[0_0_6px_hsl(var(--gold)_/_0.4)]" />
                    </div>
                    <span className="text-[10px] tracking-wide text-muted-foreground/60 transition-colors duration-300 group-hover:text-foreground/80">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-2">
            {messages.map((msg, i) => (
              <CopilotMessage
                key={i}
                role={msg.role}
                content={msg.content}
                attachments={msg.attachments}
                isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
                modelTag={msg.role === "assistant" && i === messages.length - 1 && !isLoading ? modelConfig.tag : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick actions when chatting */}
      {!isEmpty && !isLoading && (
        <div className="flex gap-1.5 px-4 py-2 overflow-x-auto scrollbar-hide">
          {EXAMPLE_COMMANDS.slice(3, 6).map((item) => (
            <button
              key={item.cmd}
              onClick={() => send(item.cmd)}
              className="shrink-0 text-[9px] px-3.5 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm border border-border/15 bg-card/20 text-muted-foreground/50 hover:text-primary/70 hover:border-primary/15 hover:bg-primary/[0.04]"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Pending attachments */}
      {pendingAttachments.length > 0 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          {pendingAttachments.map((att, i) => (
            <div key={i} className="relative shrink-0 group">
              {att.type.startsWith("image/") ? (
                <img src={att.url} alt={att.name} className="w-16 h-16 object-cover rounded-lg border border-primary/15" />
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-2 rounded-lg border border-primary/10 bg-primary/[0.03] text-[10px] text-muted-foreground">
                  📎 {att.name.length > 15 ? att.name.slice(0, 15) + "…" : att.name}
                </div>
              )}
              <button
                onClick={() => removeAttachment(i)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Premium input bar */}
      <div className="px-4 sm:px-6 pb-5 pt-2 relative">
        <div
          className={cn(
            "relative flex items-end gap-2.5 rounded-xl px-4 py-3 transition-all duration-300",
            "backdrop-blur-xl border",
            isListening
              ? "border-primary/25 shadow-[0_0_30px_-10px_hsl(var(--gold)_/_0.15)]"
              : isLoading
                ? "border-primary/15"
                : "border-border/20 hover:border-border/30"
          )}
          style={{
            backgroundColor: isListening
              ? "hsl(var(--gold) / 0.04)"
              : "hsl(var(--card) / 0.6)",
          }}
        >
          {/* Gold gradient focus glow */}
          {(input.trim() || isListening) && (
            <div
              className="absolute inset-0 rounded-xl pointer-events-none opacity-40"
              style={{
                background: "linear-gradient(135deg, hsl(var(--gold) / 0.05), transparent, hsl(var(--gold) / 0.03))",
              }}
            />
          )}

          {/* TTS toggle */}
          <Button
            onClick={() => { setTtsEnabled(p => !p); stopTts(); }}
            variant="ghost"
            size="icon"
            className={cn(
              "shrink-0 h-9 w-9 rounded-lg transition-all",
              ttsEnabled ? "text-primary/60 hover:text-primary" : "text-muted-foreground/30 hover:text-muted-foreground/60"
            )}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </Button>

          {/* Attachment */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="ghost"
            size="icon"
            disabled={isUploading}
            className={cn(
              "shrink-0 h-9 w-9 rounded-lg transition-all",
              pendingAttachments.length > 0
                ? "text-primary/70 hover:text-primary"
                : "text-muted-foreground/40 hover:text-primary/60"
            )}
          >
            <Paperclip className="w-3.5 h-3.5" />
            {pendingAttachments.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary text-[7px] text-primary-foreground font-bold flex items-center justify-center">
                {pendingAttachments.length}
              </span>
            )}
          </Button>

          {/* Input */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isUploading ? "Uploading…" : isListening ? "Listening…" : "Ask RISE ONE…"}
            className={cn(
              "flex-1 min-h-[36px] max-h-[100px] resize-none rounded-lg px-3 py-2",
              "bg-transparent text-sm text-foreground placeholder:text-muted-foreground/30",
              "focus:outline-none transition-all duration-300"
            )}
            rows={1}
          />

          {/* Waveform */}
          {isListening && (
            <div ref={barsRef} className="flex items-center gap-[3px] h-9 px-2">
              {[0.5, 0.65, 0.8, 1, 0.8, 0.65, 0.5].map((base, i) => (
                <span
                  key={i}
                  className="w-[2px] h-5 rounded-full origin-center"
                  style={{
                    background: "linear-gradient(to top, hsl(var(--gold)), hsl(var(--gold) / 0.3))",
                    transform: `scaleY(${base * 0.15})`,
                    transition: "transform 60ms ease-out",
                  }}
                />
              ))}
            </div>
          )}

          {/* Mic */}
          <div className="relative shrink-0">
            {isListening && (
              <>
                {[0, 0.5, 1].map((delay) => (
                  <span
                    key={delay}
                    className="absolute inset-[-4px] rounded-lg border border-primary/20 pointer-events-none"
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
                "relative h-9 w-9 rounded-lg transition-all overflow-visible",
                isListening ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:text-primary/60"
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>

          {/* Send — with pulse when ready */}
          <Button
            onClick={() => send(input)}
            disabled={(!input.trim() && pendingAttachments.length === 0) || isLoading}
            size="icon"
            className={cn(
              "shrink-0 h-9 w-9 rounded-lg transition-all",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "disabled:opacity-15 disabled:bg-muted-foreground/20",
              (input.trim() || pendingAttachments.length > 0) && !isLoading && "shadow-[0_0_12px_-3px_hsl(var(--gold)_/_0.3)]"
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex justify-center mt-2.5">
          <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/30">
            {isUploading ? "UPLOADING" : isListening ? "LISTENING" : isLoading ? "PROCESSING" : "RISE ONE · ACTIVE"}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.04); opacity: 0.85; }
        }
        @keyframes micRipple {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes sonarPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
        }
        @keyframes orbitDot {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes shimmerText {
          0% { background-position: 200% 0; }
          50% { background-position: -200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spinArc {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
