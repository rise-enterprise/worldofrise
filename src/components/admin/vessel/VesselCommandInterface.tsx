import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Paperclip, X, TrendingUp, Users, Zap, BarChart3, Target, Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CopilotMessage from "../copilot/CopilotMessage";
import { cn } from "@/lib/utils";
import { useAIPersonality } from "@/contexts/AIPersonalityContext";
import AIAvatar from "@/components/admin/ai/AIAvatar";
import type { AIState } from "@/components/admin/ai/AIAvatar";
import { useIsMobile } from "@/hooks/use-mobile";

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
  aiState?: AIState;
  onAIStateChange?: (state: AIState) => void;
  onAudioLevel?: (level: number) => void;
}

export default function VesselCommandInterface({
  onListeningChange,
  onPulseIntensity,
  onCrisisChange,
  onAIMetrics,
  onProcessingChange,
  onSpeakingChange,
  aiState = "idle",
  onAIStateChange,
  onAudioLevel,
}: VesselCommandInterfaceProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const { systemPrompt, modelConfig } = useAIPersonality();
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showInputExtras, setShowInputExtras] = useState(false);
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
  const ttsAnalyserRef = useRef<AnalyserNode | null>(null);
  const ttsAnimRef = useRef<number>(0);
  const ttsAudioCtxRef = useRef<AudioContext | null>(null);
  const isMobile = useIsMobile();

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
      if (ttsAnimRef.current) cancelAnimationFrame(ttsAnimRef.current);
      ttsAudioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  // Auto-greeting on mount
  useEffect(() => {
    if (hasGreeted || messages.length > 0) return;
    const timer = setTimeout(() => {
      setHasGreeted(true);
      triggerGreeting();
    }, 1500);
    return () => clearTimeout(timer);
  }, [hasGreeted, messages.length]);

  const triggerGreeting = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    onAIStateChange?.("thinking");
    await new Promise(r => setTimeout(r, 400));

    const greetingMessages: Msg[] = [
      { role: "user", content: `[SYSTEM] ${systemPrompt}` },
      { role: "user", content: "Greet me as the RISE ONE executive AI. One sentence. Be confident and ready to assist." },
    ];

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [{ role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: greetingMessages,
      token: session.access_token,
      onDelta: upsert,
      onDone: () => {
        if (assistantSoFar) speak(assistantSoFar);
      },
      onError: () => { onAIStateChange?.("idle"); },
    });
  };

  const stopTts = useCallback(() => {
    ttsAbortRef.current?.abort();
    ttsAudioRef.current?.pause();
    ttsAudioRef.current = null;
    if (ttsObjectUrlRef.current) {
      URL.revokeObjectURL(ttsObjectUrlRef.current);
      ttsObjectUrlRef.current = null;
    }
    if (ttsAnimRef.current) cancelAnimationFrame(ttsAnimRef.current);
    ttsAnimRef.current = 0;
    setAudioLevel(0);
    onAudioLevel?.(0);
  }, [onAudioLevel]);

  const startTtsAnalyser = useCallback((audio: HTMLAudioElement) => {
    try {
      const ctx = new AudioContext();
      ttsAudioCtxRef.current = ctx;
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      ttsAnalyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const level = Math.min(1, (sum / data.length / 255) * 2.5);
        setAudioLevel(level);
        onAudioLevel?.(level);
        ttsAnimRef.current = requestAnimationFrame(tick);
      };
      ttsAnimRef.current = requestAnimationFrame(tick);
    } catch {
      // AudioContext not available
    }
  }, [onAudioLevel]);

  const speak = useCallback(async (text: string) => {
    if (!ttsEnabled) { onAIStateChange?.("idle"); return; }
    const clean = text.replace(/[#*_`>~\[\]()]/g, "").replace(/\n+/g, ". ").trim();
    if (!clean || clean === lastSpokenRef.current) { onAIStateChange?.("idle"); return; }
    lastSpokenRef.current = clean;
    stopTts();
    const controller = new AbortController();
    ttsAbortRef.current = controller;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      onAIStateChange?.("speaking");
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
      if (!resp.ok) { onAIStateChange?.("idle"); return; }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      ttsObjectUrlRef.current = url;
      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      audio.volume = 0.8;
      audio.crossOrigin = "anonymous";
      onSpeakingChange?.(true);
      startTtsAnalyser(audio);
      audio.onended = () => {
        onSpeakingChange?.(false);
        onAIStateChange?.("idle");
        setAudioLevel(0);
        onAudioLevel?.(0);
        if (ttsAnimRef.current) cancelAnimationFrame(ttsAnimRef.current);
        ttsAudioCtxRef.current?.close().catch(() => {});
      };
      await audio.play();
    } catch (err: unknown) {
      onSpeakingChange?.(false);
      onAIStateChange?.("idle");
      setAudioLevel(0);
      onAudioLevel?.(0);
      if (err instanceof Error && err.name === "AbortError") return;
    }
  }, [ttsEnabled, stopTts, onSpeakingChange, onAIStateChange, startTtsAnalyser, onAudioLevel]);

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
    onAIStateChange?.("thinking");
    lastSpokenRef.current = "";
    stopTts();
    setShowInputExtras(false);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
      setIsLoading(false);
      onAIStateChange?.("idle");
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
              onAIStateChange?.("idle");
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
          onAIStateChange?.("idle");
        }
      }
    };

    await doStream();
  }, [isLoading, messages, speak, detectCrisis, stopTts, onProcessingChange, systemPrompt, pendingAttachments, onAIStateChange]);

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
      onAIStateChange?.("idle");
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
    recognition.onerror = () => { stopAudio(); setIsListening(false); onListeningChange?.(false); onAIStateChange?.("idle"); };
    recognition.onend = () => { stopAudio(); setIsListening(false); onListeningChange?.(false); onAIStateChange?.("idle"); };
    recognition.start();
    startAudioVisualizer();
    setIsListening(true);
    onListeningChange?.(true);
    onAIStateChange?.("listening");
  }, [isListening, send, stopAudio, startAudioVisualizer, onListeningChange, onAIStateChange]);

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

      {/* Messages / Empty state */}
      <div ref={scrollRef} className={cn("flex-1 overflow-y-auto scrollbar-hide min-h-0", isMobile ? "px-3" : "px-4")}>
        {isEmpty ? (
          <div className={cn(
            "flex flex-col items-center justify-center h-full text-center px-4",
            isMobile ? "py-6" : "py-8 sm:py-12"
          )}>
            {/* Click-to-talk AI Avatar */}
            <AIAvatar
              state={aiState}
              size={isMobile ? "md" : "lg"}
              className={isMobile ? "mb-5" : "mb-8"}
              audioLevel={audioLevel}
              onClick={toggleVoice}
              clickLabel="Tap to speak"
            />

            {/* Title */}
            <div className={cn(
              "tracking-[0.25em] font-medium mb-2 relative overflow-hidden",
              isMobile ? "text-xl" : "text-2xl"
            )}>
              <span
                className="bg-clip-text"
                style={{
                  animation: "shimmerText 6s ease-in-out infinite",
                  backgroundImage: `linear-gradient(90deg, hsl(var(--foreground)) 0%, hsl(var(--foreground)) 35%, hsl(var(--neon-purple-light)) 50%, hsl(var(--foreground)) 65%, hsl(var(--foreground)) 100%)`,
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
              className={cn(
                "text-[11px] tracking-[0.2em] uppercase text-neon-purple/40 animate-fade-in",
                isMobile ? "mb-6" : "mb-10"
              )}
              style={{ animationDelay: "300ms", animationFillMode: "both" }}
            >
              Executive Intelligence System
            </div>

            {/* Glass command cards — single column on mobile */}
            <div className={cn(
              "gap-2.5 w-full",
              isMobile ? "flex flex-col max-w-sm" : "grid grid-cols-2 max-w-md"
            )}>
              {EXAMPLE_COMMANDS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.cmd}
                    onClick={() => send(item.cmd)}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-xl text-left transition-all duration-300 backdrop-blur-md border border-neon-purple/10 bg-neon-purple/[0.02] hover:bg-neon-purple/[0.06] hover:border-neon-purple/25 hover:shadow-[0_0_20px_-6px_hsl(var(--neon-purple)_/_0.15)] animate-fade-in active:scale-[0.97]",
                      isMobile ? "px-4 py-3.5 min-h-[44px]" : "px-4 py-3"
                    )}
                    style={{
                      animationDelay: `${600 + idx * 80}ms`,
                      animationFillMode: "both",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <div className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-neon-purple/[0.06] border border-neon-purple/10 transition-all duration-300 group-hover:bg-neon-purple/10 group-hover:border-neon-purple/20">
                      <Icon className="w-3.5 h-3.5 text-neon-purple/50 transition-all duration-300 group-hover:text-neon-purple-light group-hover:drop-shadow-[0_0_6px_hsl(var(--neon-purple)_/_0.5)]" />
                    </div>
                    <span className={cn(
                      "tracking-wide text-muted-foreground/60 transition-colors duration-300 group-hover:text-foreground/80",
                      isMobile ? "text-[11px]" : "text-[10px]"
                    )}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-2">
            {/* Compact avatar when chatting */}
            <div className="flex justify-center py-2 mb-2">
              <AIAvatar state={aiState} size="sm" audioLevel={audioLevel} />
            </div>
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

      {/* Quick actions — horizontal scroll with snap on mobile */}
      {!isEmpty && !isLoading && (
        <div className={cn(
          "flex gap-1.5 py-2 overflow-x-auto scrollbar-hide",
          isMobile ? "px-3 snap-x snap-mandatory" : "px-4"
        )}>
          {EXAMPLE_COMMANDS.slice(3, 6).map((item) => (
            <button
              key={item.cmd}
              onClick={() => send(item.cmd)}
              className={cn(
                "shrink-0 text-[9px] rounded-lg transition-all duration-300 backdrop-blur-sm border border-neon-purple/10 bg-neon-purple/[0.02] text-muted-foreground/50 hover:text-neon-purple/70 hover:border-neon-purple/20 hover:bg-neon-purple/[0.05] active:scale-[0.96]",
                isMobile ? "px-4 py-2.5 min-h-[36px] snap-start" : "px-3.5 py-2"
              )}
              style={{ WebkitTapHighlightColor: "transparent" }}
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
                <img src={att.url} alt={att.name} className="w-16 h-16 object-cover rounded-lg border border-neon-purple/15" />
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-2 rounded-lg border border-neon-purple/10 bg-neon-purple/[0.03] text-[10px] text-muted-foreground">
                  📎 {att.name.length > 15 ? att.name.slice(0, 15) + "…" : att.name}
                </div>
              )}
              <button
                onClick={() => removeAttachment(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive/80 text-white flex items-center justify-center"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div
        className={cn("relative", isMobile ? "px-3 pb-2 pt-1.5" : "px-4 sm:px-6 pb-5 pt-2")}
        style={isMobile ? {
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
        } : undefined}
      >
        <div
          className={cn(
            "relative flex items-end gap-2 rounded-2xl transition-all duration-300",
            "backdrop-blur-xl border",
            isMobile ? "px-2.5 py-2.5" : "px-4 py-3 gap-2.5",
            isListening
              ? "border-neon-cyan/30 shadow-[0_0_30px_-10px_hsl(var(--neon-cyan)_/_0.2)]"
              : isLoading
                ? "border-neon-purple/20"
                : "border-neon-purple/10 hover:border-neon-purple/15"
          )}
          style={{
            backgroundColor: isListening
              ? "hsl(var(--neon-cyan) / 0.04)"
              : "hsl(var(--card) / 0.5)",
          }}
        >
          {(input.trim() || isListening) && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none opacity-30"
              style={{
                background: "linear-gradient(135deg, hsl(var(--neon-purple) / 0.06), transparent, hsl(var(--neon-blue) / 0.04))",
              }}
            />
          )}

          {/* Mobile: "+" toggle for extras */}
          {isMobile ? (
            <>
              <Button
                onClick={() => setShowInputExtras(!showInputExtras)}
                variant="ghost"
                size="icon"
                className={cn(
                  "shrink-0 h-9 w-9 rounded-xl transition-all",
                  showInputExtras ? "text-neon-purple bg-neon-purple/10 rotate-45" : "text-muted-foreground/40"
                )}
                style={{ WebkitTapHighlightColor: "transparent", minWidth: 36, minHeight: 36 }}
              >
                <Plus className="w-4 h-4" />
              </Button>

              {/* Expandable extras */}
              {showInputExtras && (
                <div className="flex gap-1 animate-fade-in">
                  <Button
                    onClick={() => { setTtsEnabled(p => !p); stopTts(); }}
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "shrink-0 h-9 w-9 rounded-xl transition-all",
                      ttsEnabled ? "text-neon-purple/60" : "text-muted-foreground/30"
                    )}
                    style={{ minWidth: 36, minHeight: 36 }}
                  >
                    {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="ghost"
                    size="icon"
                    disabled={isUploading}
                    className={cn(
                      "shrink-0 h-9 w-9 rounded-xl transition-all",
                      pendingAttachments.length > 0 ? "text-neon-magenta/70" : "text-muted-foreground/40"
                    )}
                    style={{ minWidth: 36, minHeight: 36 }}
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={() => { setTtsEnabled(p => !p); stopTts(); }}
                variant="ghost"
                size="icon"
                className={cn(
                  "shrink-0 h-9 w-9 rounded-lg transition-all",
                  ttsEnabled ? "text-neon-purple/60 hover:text-neon-purple" : "text-muted-foreground/30 hover:text-muted-foreground/60"
                )}
              >
                {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="ghost"
                size="icon"
                disabled={isUploading}
                className={cn(
                  "shrink-0 h-9 w-9 rounded-lg transition-all",
                  pendingAttachments.length > 0
                    ? "text-neon-magenta/70 hover:text-neon-magenta"
                    : "text-muted-foreground/40 hover:text-neon-purple/60"
                )}
              >
                <Paperclip className="w-3.5 h-3.5" />
                {pendingAttachments.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-neon-magenta text-[7px] text-white font-bold flex items-center justify-center">
                    {pendingAttachments.length}
                  </span>
                )}
              </Button>
            </>
          )}

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isUploading ? "Uploading…" : isListening ? "Listening…" : "Ask RISE ONE…"}
            className={cn(
              "flex-1 min-h-[36px] max-h-[100px] resize-none rounded-lg px-3 py-2",
              "bg-transparent text-foreground placeholder:text-muted-foreground/30",
              "focus:outline-none transition-all duration-300",
              isMobile ? "text-[16px]" : "text-sm"
            )}
            rows={1}
          />

          {isListening && (
            <div ref={barsRef} className="flex items-center gap-[3px] h-9 px-2">
              {[0.5, 0.65, 0.8, 1, 0.8, 0.65, 0.5].map((base, i) => (
                <span
                  key={i}
                  className="w-[2px] h-5 rounded-full origin-center"
                  style={{
                    background: "linear-gradient(to top, hsl(var(--neon-cyan)), hsl(var(--neon-cyan) / 0.3))",
                    transform: `scaleY(${base * 0.15})`,
                    transition: "transform 60ms ease-out",
                  }}
                />
              ))}
            </div>
          )}

          <div className="relative shrink-0">
            {isListening && (
              <>
                {[0, 0.5, 1].map((delay) => (
                  <span
                    key={delay}
                    className="absolute inset-[-4px] rounded-xl border border-neon-cyan/20 pointer-events-none"
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
                "relative rounded-xl transition-all overflow-visible",
                isMobile ? "h-10 w-10" : "h-9 w-9",
                isListening ? "text-neon-cyan bg-neon-cyan/10" : "text-muted-foreground/40 hover:text-neon-purple/60"
              )}
              style={{ minWidth: isMobile ? 40 : 36, minHeight: isMobile ? 40 : 36 }}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>

          <Button
            onClick={() => send(input)}
            disabled={(!input.trim() && pendingAttachments.length === 0) || isLoading}
            size="icon"
            className={cn(
              "shrink-0 rounded-xl transition-all",
              isMobile ? "h-10 w-10" : "h-9 w-9",
              "bg-neon-purple hover:bg-neon-purple/80 text-white",
              "disabled:opacity-15 disabled:bg-muted-foreground/20",
              (input.trim() || pendingAttachments.length > 0) && !isLoading && "shadow-[0_0_14px_-3px_hsl(var(--neon-purple)_/_0.4)]"
            )}
            style={{ minWidth: isMobile ? 40 : 36, minHeight: isMobile ? 40 : 36 }}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>

        {!isMobile && (
          <div className="flex justify-center mt-2.5">
            <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/25">
              {isUploading ? "UPLOADING" : isListening ? "LISTENING" : isLoading ? "PROCESSING" : "RISE ONE · ACTIVE"}
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes micRipple {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes shimmerText {
          0% { background-position: 200% 0; }
          50% { background-position: -200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
