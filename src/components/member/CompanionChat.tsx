import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Volume2, VolumeX, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import AIAvatar from '@/components/admin/ai/AIAvatar';
import type { AIState } from '@/components/admin/ai/AIAvatar';
import type { Guest } from '@/types/loyalty';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface CompanionChatProps {
  member: Guest;
  className?: string;
}

const COMPANION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/member-companion`;

async function streamCompanion({
  messages, token, onDelta, onDone,
}: {
  messages: { role: string; content: string }[];
  token: string;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(COMPANION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Connection failed" }));
    throw new Error(err.error || `Error ${resp.status}`);
  }

  if (!resp.body) throw new Error("No response stream");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;

  while (!done) {
    const { done: streamDone, value } = await reader.read();
    if (streamDone) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIdx: number;
    while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIdx);
      buffer = buffer.slice(newlineIdx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { done = true; break; }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }

  if (buffer.trim()) {
    for (let raw of buffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

export function CompanionChat({ member, className }: CompanionChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [aiState, setAIState] = useState<AIState>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ttsAudioCtxRef = useRef<AudioContext | null>(null);
  const ttsAnimRef = useRef<number>(0);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // Auto-greeting with cinematic delay
  useEffect(() => {
    if (hasGreeted || !member) return;
    const timer = setTimeout(() => {
      setHasGreeted(true);
      sendInitialGreeting();
    }, 1200);
    return () => clearTimeout(timer);
  }, [member, hasGreeted]);

  const sendInitialGreeting = async () => {
    const greetingPrompt = `Greet ${member.name} warmly as their personal concierge. Reference their tier progress if relevant. Keep it to 2-3 sentences. Be genuinely warm.`;
    await sendMessage(greetingPrompt, true);
  };

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const startTtsAnalyser = useCallback((audio: HTMLAudioElement) => {
    try {
      const ctx = new AudioContext();
      ttsAudioCtxRef.current = ctx;
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const level = Math.min(1, (sum / data.length / 255) * 2.5);
        setAudioLevel(level);
        ttsAnimRef.current = requestAnimationFrame(tick);
      };
      ttsAnimRef.current = requestAnimationFrame(tick);
    } catch { /* no AudioContext */ }
  }, []);

  const speakText = useCallback(async (text: string) => {
    if (!voiceEnabled) { setAIState("idle"); return; }
    try {
      setAIState("speaking");
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            text: text.replace(/[*#_`]/g, '').slice(0, 500), 
            voiceId: "JBFqnCBsd6RMkjVDRZzb"
          }),
        }
      );
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.volume = 0.7;
        audio.crossOrigin = "anonymous";
        startTtsAnalyser(audio);
        audio.onended = () => {
          setAIState("idle");
          setAudioLevel(0);
          if (ttsAnimRef.current) cancelAnimationFrame(ttsAnimRef.current);
          ttsAudioCtxRef.current?.close().catch(() => {});
        };
        await audio.play();
      } else {
        setAIState("idle");
      }
    } catch (e) {
      console.error("TTS error:", e);
      setAIState("idle");
      setAudioLevel(0);
    }
  }, [voiceEnabled, startTtsAnalyser]);

  const sendMessage = useCallback(async (text: string, isSystem = false) => {
    if (!text.trim()) return;

    const token = await getToken();
    if (!token) {
      toast.error("Please sign in to continue");
      return;
    }

    const allMsgs = [...messages];
    if (!isSystem) {
      const userMsg: Message = {
        id: Date.now().toString(),
        content: text,
        role: 'user',
        timestamp: new Date(),
      };
      allMsgs.push(userMsg);
      setMessages(prev => [...prev, userMsg]);
    }

    setInput('');
    setIsStreaming(true);
    setAIState("thinking");

    // Brief thinking pause for natural rhythm
    await new Promise(r => setTimeout(r, 300));

    let assistantContent = "";

    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id.startsWith('streaming-')) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, {
          id: 'streaming-' + Date.now(),
          content: assistantContent,
          role: 'assistant' as const,
          timestamp: new Date(),
        }];
      });
    };

    try {
      const apiMessages = allMsgs.map(m => ({ role: m.role, content: m.content }));
      if (isSystem) {
        apiMessages.push({ role: 'user', content: text });
      }

      await streamCompanion({
        messages: apiMessages,
        token,
        onDelta: upsertAssistant,
        onDone: () => {
          setIsStreaming(false);
          setMessages(prev => prev.map(m => 
            m.id.startsWith('streaming-') ? { ...m, id: 'final-' + Date.now() } : m
          ));
          if (assistantContent && voiceEnabled) {
            speakText(assistantContent);
          } else {
            setAIState("idle");
          }
        },
      });
    } catch (e: any) {
      setIsStreaming(false);
      setAIState("idle");
      toast.error(e.message || "Something went wrong");
    }
  }, [messages, voiceEnabled, speakText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
  };

  const getSuggestions = () => {
    const suggestions: string[] = [];
    const daysSinceLast = member.lastVisit 
      ? Math.floor((Date.now() - member.lastVisit.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (daysSinceLast && daysSinceLast > 7) {
      suggestions.push("When should I visit next?");
    }
    if (member.totalPoints > 0) {
      suggestions.push("What can I redeem?");
    }
    suggestions.push("How close am I to my next tier?");
    if (member.totalVisits > 3) {
      suggestions.push("Show me my journey so far");
    }
    return suggestions.slice(0, 3);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className={cn("flex flex-col h-full relative overflow-hidden", className)}>
      {/* Cybernetic ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 50% 0%, hsl(var(--neon-purple) / 0.06) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 100%, hsl(var(--neon-magenta) / 0.04) 0%, transparent 50%),
            radial-gradient(ellipse 30% 20% at 20% 60%, hsl(var(--neon-blue) / 0.03) 0%, transparent 50%)
          `,
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.012]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--neon-purple) / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--neon-purple) / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Empty state with avatar */}
      {isEmpty && (
        <div className="relative z-10 flex flex-col items-center justify-center pt-8 pb-4">
          <AIAvatar state={aiState} size="sm" className="mb-6" audioLevel={audioLevel} />
          <div className="text-xs tracking-[0.2em] uppercase text-neon-purple/50 mb-1">
            Personal Concierge
          </div>
          <div
            className="text-[10px] tracking-wider text-muted-foreground/40"
            style={{ animationDelay: "200ms" }}
          >
            Your AI-powered luxury assistant
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4 relative z-10" ref={scrollRef}>
        <div className="space-y-4 py-4 pb-2">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1',
                  message.role === 'assistant'
                    ? 'ring-1 ring-neon-purple/30'
                    : 'bg-muted ring-1 ring-border/30'
                )}
                  style={message.role === 'assistant' ? {
                    background: 'radial-gradient(circle, hsl(var(--neon-purple) / 0.15) 0%, hsl(var(--neon-magenta) / 0.08) 100%)',
                  } : undefined}
                >
                  {message.role === 'assistant' ? (
                    <Brain className="h-4 w-4 text-neon-purple" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 relative',
                  message.role === 'assistant'
                    ? 'rounded-tl-sm border border-neon-purple/15 backdrop-blur-sm'
                    : 'bg-primary text-primary-foreground rounded-tr-sm'
                )}
                  style={message.role === 'assistant' ? {
                    background: 'linear-gradient(135deg, hsl(var(--card) / 0.7) 0%, hsl(var(--card) / 0.4) 100%)',
                  } : undefined}
                >
                  {message.role === 'assistant' && (
                    <div
                      className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, hsl(var(--neon-purple) / 0.6), hsl(var(--neon-magenta) / 0.3))',
                      }}
                    />
                  )}
                  {message.role === 'assistant' ? (
                    <div className="text-sm prose prose-sm prose-invert max-w-none [&>p]:mb-1.5 [&>p:last-child]:mb-0 [&>ul]:mb-1.5 [&>strong]:text-neon-purple-light pl-1">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Streaming indicator */}
          {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div
                className="w-8 h-8 rounded-full ring-1 ring-neon-purple/30 flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--neon-purple) / 0.15) 0%, hsl(var(--neon-magenta) / 0.08) 100%)',
                }}
              >
                <Brain className="h-4 w-4 text-neon-purple animate-pulse" />
              </div>
              <div
                className="rounded-2xl rounded-tl-sm px-4 py-3 border border-neon-purple/15 backdrop-blur-sm"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--card) / 0.7) 0%, hsl(var(--card) / 0.4) 100%)',
                }}
              >
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-neon-purple/60"
                      style={{
                        animation: 'companionDotWave 1.2s ease-in-out infinite',
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Smart Suggestions */}
      {messages.length <= 2 && !isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="px-4 py-2 relative z-10"
        >
          <div className="flex gap-2 overflow-x-auto pb-1">
            {getSuggestions().map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs shrink-0 border-neon-purple/20 text-muted-foreground hover:text-neon-purple-light hover:border-neon-purple/40 hover:bg-neon-purple/5 transition-all backdrop-blur-sm"
                onClick={() => sendMessage(suggestion)}
                disabled={isStreaming}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-neon-purple/10 relative z-10" style={{
        background: 'linear-gradient(180deg, hsl(var(--background) / 0.5) 0%, hsl(var(--background) / 0.9) 100%)',
        backdropFilter: 'blur(20px)',
      }}>
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "shrink-0 h-9 w-9 rounded-full transition-all",
              voiceEnabled 
                ? "text-neon-cyan bg-neon-cyan/10 ring-1 ring-neon-cyan/30" 
                : "text-muted-foreground hover:text-neon-purple/60"
            )}
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              placeholder="Ask your concierge anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isStreaming}
              className={cn(
                "w-full h-11 rounded-xl px-4 py-2 text-sm font-body",
                "bg-card/40 border border-neon-purple/15 text-foreground",
                "placeholder:text-muted-foreground/40",
                "focus:outline-none focus:border-neon-purple/40",
                "focus:shadow-[0_0_0_3px_hsl(var(--neon-purple)_/_0.08)]",
                "transition-all duration-300 backdrop-blur-sm",
                "disabled:opacity-50"
              )}
            />
          </div>
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isStreaming}
            className={cn(
              "shrink-0 h-9 w-9 rounded-full transition-all",
              input.trim()
                ? "bg-neon-purple text-white shadow-[0_0_15px_hsl(var(--neon-purple)_/_0.3)]"
                : "bg-neon-purple/15 text-muted-foreground/40"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <style>{`
        @keyframes companionDotWave {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
