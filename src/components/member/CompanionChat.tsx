import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, User, Volume2, VolumeX, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
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
  messages,
  token,
  onDelta,
  onDone,
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

  // Flush remaining
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ttsFiredRef = useRef(false);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // Auto-greet on mount
  useEffect(() => {
    if (!hasGreeted && member) {
      setHasGreeted(true);
      sendInitialGreeting();
    }
  }, [member, hasGreeted]);

  const sendInitialGreeting = async () => {
    const greetingPrompt = "Greet me warmly as my personal concierge. Reference my last visit and tier progress if relevant. Keep it to 2-3 sentences. Be genuinely warm.";
    await sendMessage(greetingPrompt, true);
  };

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const speakText = async (text: string) => {
    if (!voiceEnabled) return;
    try {
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
        await audio.play();
      }
    } catch (e) {
      console.error("TTS error:", e);
    }
  };

  const sendMessage = useCallback(async (text: string, isSystem = false) => {
    if (!text.trim()) return;

    const token = await getToken();
    if (!token) {
      toast.error("Please sign in to continue");
      return;
    }

    // Add user message (unless it's a system greeting)
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

    let assistantContent = "";
    ttsFiredRef.current = false;

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

      // Fire TTS on first complete sentence for faster voice activation
      if (!ttsFiredRef.current && voiceEnabled && assistantContent.length >= 20) {
        const sentenceMatch = assistantContent.match(/^([\s\S]*?[.!?])(?:\s|$)/);
        if (sentenceMatch) {
          ttsFiredRef.current = true;
          speakText(sentenceMatch[1]);
        }
      }
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
          // Finalize the streaming message ID
          setMessages(prev => prev.map(m => 
            m.id.startsWith('streaming-') ? { ...m, id: 'final-' + Date.now() } : m
          ));
          // TTS already fired on first sentence — no need here
        },
      });
    } catch (e: any) {
      setIsStreaming(false);
      toast.error(e.message || "Something went wrong");
    }
  }, [messages, voiceEnabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
  };

  // Smart suggestions based on member data
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

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
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
                    ? 'bg-primary/10 ring-1 ring-primary/20'
                    : 'bg-muted ring-1 ring-border/30'
                )}>
                  {message.role === 'assistant' ? (
                    <Sparkles className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3',
                  message.role === 'assistant'
                    ? 'bg-card/80 backdrop-blur-sm text-foreground rounded-tl-sm border border-border/30'
                    : 'bg-primary text-primary-foreground rounded-tr-sm'
                )}>
                  {message.role === 'assistant' ? (
                    <div className="text-sm prose prose-sm prose-invert max-w-none [&>p]:mb-1.5 [&>p:last-child]:mb-0 [&>ul]:mb-1.5 [&>strong]:text-primary">
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
              <div className="w-8 h-8 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 border border-border/30">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
          className="px-4 py-2"
        >
          <div className="flex gap-2 overflow-x-auto pb-1">
            {getSuggestions().map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs shrink-0 border-primary/20 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
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
      <div className="p-4 border-t border-border/30 bg-background/50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "shrink-0 h-9 w-9 rounded-full transition-colors",
              voiceEnabled ? "text-primary bg-primary/10" : "text-muted-foreground"
            )}
            onClick={() => setVoiceEnabled(!voiceEnabled)}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Input
            ref={inputRef}
            placeholder="Ask your concierge anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isStreaming}
            className="flex-1 bg-card/50 border-border/30 focus:border-primary/40 text-sm"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isStreaming}
            className="shrink-0 h-9 w-9 rounded-full bg-primary/90 hover:bg-primary"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
