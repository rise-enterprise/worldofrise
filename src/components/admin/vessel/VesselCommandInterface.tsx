import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Paperclip, X } from "lucide-react";
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
  "Show me today's key metrics and anything that needs attention",
  "Find members at high churn risk and suggest re-engagement strategies",
  "Compare NOIR vs SASSO performance this month",
  "Draft a reactivation campaign for dormant VIPs",
  "Generate a luxury loyalty card design for RISE Black tier",
  "Explain retention drop",
  "Generate executive summary",
  "Deploy double points for 5 days in Doha",
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

function extractMetrics(text: string): { label: string; value: number }[] {
  const metrics: { label: string; value: number }[] = [];
  const seen = new Set<string>();
  const parseNum = (s: string) => Number(s.replace(/,/g, "").replace(/%$/, ""));
  const p1 = /\*\*([0-9,]+(?:\.[0-9]+)?%?)\*\*\s+([a-zA-Z][a-zA-Z\s]{1,25})/g;
  const p2 = /(?:^|\s)([0-9,]+(?:\.[0-9]+)?%?)\s+((?:total|active|vip|new|dormant|at.risk|high.risk|churn|members?|guests?|visits?|points?|rewards?|campaigns?|retention)[a-zA-Z\s]{0,20})/gi;
  const p3 = /([\w\s]{2,20}):\s*\*?\*?([0-9,]+(?:\.[0-9]+)?%?)\*?\*?/g;
  const add = (label: string, raw: string) => {
    const v = parseNum(raw);
    if (isNaN(v) || v === 0) return;
    const key = label.trim().toLowerCase().replace(/\s+/g, " ");
    if (key.length < 2 || key.length > 25 || seen.has(key)) return;
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

  // File upload handler
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
    // Reset file input
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
              const extracted = extractMetrics(assistantSoFar);
              if (extracted.length > 0) onAIMetrics?.(extracted);
            }
          },
          onError: async (err) => {
            if (!retry && (err.includes("500") || err.includes("unavailable"))) {
              // Self-healing: retry once after 2s
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
  }, [isLoading, messages, speak, detectCrisis, stopTts, onProcessingChange, personalityConfig, onAIMetrics, pendingAttachments]);

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
      {/* Hidden file input */}
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
            <div className="mb-6 flex flex-col items-center">
              <img src={riseLogo} alt="Rise" className="h-10 sm:h-12 w-auto mb-4 opacity-60" />
              <div className="text-lg sm:text-xl font-serif tracking-[0.25em] text-[#C8A24A]/80">
                RISE TACTICAL
              </div>
              <div className="text-[9px] text-[#4a4a54] mt-2 tracking-[0.2em] uppercase">
                Intelligence · Strategy · Expansion · Full Authority
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8 text-[9px] uppercase tracking-[0.2em]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5a8a6a]" />
                <span className="text-[#4a4a54]">System Online</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A24A]" />
                <span className="text-[#4a4a54]">Tools Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6a8aba]" />
                <span className="text-[#4a4a54]">Image Gen</span>
              </div>
            </div>

            <p className="text-[11px] text-[#4a4a54] max-w-md mb-5 leading-relaxed">
              Full operational authority. Execute commands, query data, generate images, analyze attachments, manage campaigns & members.
            </p>

            <div className="flex flex-wrap gap-1.5 justify-center max-w-lg">
              {EXAMPLE_COMMANDS.slice(0, 6).map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => send(cmd)}
                  className="text-[9px] px-3 py-2 rounded border border-[#C8A24A]/08 bg-[#C8A24A]/03 text-[#5a5a64] hover:text-[#C8A24A]/70 hover:border-[#C8A24A]/15 hover:bg-[#C8A24A]/06 transition-all"
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
                attachments={msg.attachments}
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
              className="shrink-0 text-[9px] px-2.5 py-1.5 rounded border border-[#C8A24A]/06 bg-[#C8A24A]/03 text-[#4a4a54] hover:text-[#C8A24A]/60 hover:border-[#C8A24A]/12 transition-all"
            >
              {cmd.length > 40 ? cmd.slice(0, 40) + "…" : cmd}
            </button>
          ))}
        </div>
      )}

      {/* Pending attachments preview */}
      {pendingAttachments.length > 0 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          {pendingAttachments.map((att, i) => (
            <div key={i} className="relative shrink-0 group">
              {att.type.startsWith("image/") ? (
                <img src={att.url} alt={att.name} className="w-16 h-16 object-cover rounded-lg border border-[rgba(200,162,74,0.2)]" />
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-2 rounded-lg border border-[rgba(200,162,74,0.1)] bg-[rgba(200,162,74,0.04)] text-[10px] text-[#5a5a64]">
                  📎 {att.name.length > 15 ? att.name.slice(0, 15) + "…" : att.name}
                </div>
              )}
              <button
                onClick={() => removeAttachment(i)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Tactical Command Strip ── */}
      <div className="px-4 sm:px-6 pb-safe pb-5 pt-2 relative">
        {(isListening || isLoading) && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-[1px] pointer-events-none"
            style={{
              height: "35vh",
              background: `linear-gradient(to top, ${isListening ? "#C8A24A" : "rgba(200,162,74,0.4)"}, transparent)`,
              opacity: isListening ? 0.35 : 0.15,
            }}
          />
        )}

        <div
          className={cn(
            "relative flex items-end gap-2.5 rounded-xl px-4 py-3 transition-all duration-500",
            "backdrop-blur-2xl",
            "border",
            isListening
              ? "border-[#C8A24A]/25 shadow-[0_0_40px_-10px_rgba(200,162,74,0.15)]"
              : isLoading
                ? "border-[#C8A24A]/12 shadow-[0_0_30px_-10px_rgba(200,162,74,0.08)]"
                : "border-[rgba(200,162,74,0.06)]"
          )}
          style={{
            backgroundColor: isListening ? "rgba(200,162,74,0.04)" : "rgba(10,10,12,0.5)",
          }}
        >
          {/* TTS toggle */}
          <Button
            onClick={() => { setTtsEnabled(p => !p); stopTts(); }}
            variant="ghost"
            size="icon"
            className={cn(
              "shrink-0 h-9 w-9 rounded-lg transition-all relative z-10",
              ttsEnabled
                ? "text-[#C8A24A]/50 hover:text-[#C8A24A]/80 hover:bg-[#C8A24A]/06"
                : "text-[#4a4a54]/30 hover:text-[#4a4a54]/60"
            )}
            title={ttsEnabled ? "Mute AI voice" : "Enable AI voice"}
          >
            {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </Button>

          {/* Attachment button */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="ghost"
            size="icon"
            disabled={isUploading}
            className={cn(
              "shrink-0 h-9 w-9 rounded-lg transition-all relative z-10",
              pendingAttachments.length > 0
                ? "text-[#C8A24A]/70 hover:text-[#C8A24A] hover:bg-[#C8A24A]/08"
                : "text-[#4a4a54]/40 hover:text-[#C8A24A]/60 hover:bg-[#C8A24A]/06"
            )}
            title="Attach files"
          >
            <Paperclip className="w-3.5 h-3.5" />
            {pendingAttachments.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#C8A24A] text-[7px] text-[#0a0a0c] font-bold flex items-center justify-center">
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
            placeholder={isUploading ? "Uploading…" : isListening ? "Listening…" : "Command…"}
            className={cn(
              "flex-1 min-h-[36px] max-h-[100px] resize-none rounded-lg px-3 py-2 relative z-10",
              "bg-transparent text-sm text-[rgba(220,218,214,0.8)] placeholder:text-[#4a4a54]/40",
              "focus:outline-none focus:placeholder:text-[#4a4a54]/60",
              "transition-all duration-300"
            )}
            rows={1}
          />

          {/* Waveform */}
          {isListening && (
            <div ref={barsRef} className="flex items-center gap-[3px] h-9 px-2 relative z-10">
              {[0.5, 0.65, 0.8, 1, 0.8, 0.65, 0.5].map((base, i) => (
                <span
                  key={i}
                  className="w-[2px] h-5 rounded-full origin-center"
                  style={{
                    background: "linear-gradient(to top, #C8A24A, rgba(200,162,74,0.3))",
                    transform: `scaleY(${base * 0.15})`,
                    transition: "transform 60ms ease-out",
                  }}
                />
              ))}
            </div>
          )}

          {/* Mic */}
          <div className="relative shrink-0 z-10">
            {isListening && (
              <>
                {[0, 0.5, 1].map((delay) => (
                  <span
                    key={delay}
                    className="absolute inset-[-4px] rounded-lg border border-[#C8A24A]/20 pointer-events-none"
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
                isListening
                  ? "text-[#C8A24A] bg-[#C8A24A]/10"
                  : "text-[#4a4a54]/40 hover:text-[#C8A24A]/60 hover:bg-[#C8A24A]/06"
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>

          {/* Send */}
          <Button
            onClick={() => send(input)}
            disabled={(!input.trim() && pendingAttachments.length === 0) || isLoading}
            size="icon"
            className={cn(
              "shrink-0 h-9 w-9 rounded-lg transition-all relative z-10",
              "bg-[#C8A24A]/60 hover:bg-[#C8A24A]/80 text-[#0a0a0c]",
              "disabled:opacity-15 disabled:bg-[#4a4a54]/20"
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex justify-center mt-2">
          <span className="text-[8px] uppercase tracking-[0.3em] text-[#4a4a54]/30">
            {isUploading ? "◎ UPLOADING" : isListening ? "◉ LISTENING" : isLoading ? "◎ PROCESSING" : "RISE TACTICAL COMMAND · FULL AUTHORITY"}
          </span>
        </div>
      </div>
    </div>
  );
}
