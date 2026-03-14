import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Zap, Shield, Terminal, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CopilotMessage from "../copilot/CopilotMessage";
import AIAvatar from "@/components/admin/ai/AIAvatar";
import type { AIState } from "@/components/admin/ai/AIAvatar";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const OPERATOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-operator`;

const OPERATOR_COMMANDS = [
  { label: "Fix all import issues and reclassify every contact", icon: Zap },
  { label: "Show me the current RFM segment distribution", icon: Terminal },
  { label: "Export a report of dormant VIP contacts", icon: Shield },
  { label: "Show tier mismatches — computed vs stored tiers", icon: Brain },
  { label: "Rebuild all segments using RFM and show distribution", icon: Zap },
  { label: "Create a reactivation segment for 90-day dormant guests", icon: Terminal },
  { label: "Show me the top 20 spenders across all brands", icon: Shield },
  { label: "Run full data quality check on contacts", icon: Brain },
];

async function streamChat({
  messages, token, onDelta, onDone, onError,
}: {
  messages: Msg[]; token: string;
  onDelta: (t: string) => void; onDone: () => void; onError: (err: string) => void;
}) {
  const resp = await fetch(OPERATOR_URL, {
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

export default function AIOperatorConsole() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiState, setAIState] = useState<AIState>("idle");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    setAIState("thinking");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast({ title: "Session expired", description: "Please log in again.", variant: "destructive" });
      setIsLoading(false);
      setAIState("idle");
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
      onDone: () => { setIsLoading(false); setAIState("idle"); },
      onError: (err) => {
        toast({ title: "AI Operator Error", description: err, variant: "destructive" });
        setIsLoading(false);
        setAIState("idle");
      },
    });
  }, [isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="h-screen w-screen bg-background overflow-hidden relative flex flex-col">
      {/* Cybernetic ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 0%, hsl(var(--neon-purple) / 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 100%, hsl(var(--neon-magenta) / 0.05) 0%, transparent 50%),
            radial-gradient(ellipse 40% 30% at 10% 60%, hsl(var(--neon-blue) / 0.04) 0%, transparent 50%),
            radial-gradient(ellipse 30% 20% at 50% 50%, hsl(var(--gold) / 0.02) 0%, transparent 50%)
          `,
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--neon-purple) / 0.5) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--neon-purple) / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-neon-purple/10 backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--background) / 0.8) 0%, hsl(var(--background) / 0.6) 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Terminal className="w-5 h-5 text-neon-purple" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-neon-purple font-medium">RISE AI Operator</div>
            <div className="text-[9px] text-muted-foreground/40 tracking-wider">Full System Control · Tool Execution · Audit Logged</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest">
            <Shield className="w-3 h-3 text-neon-cyan" />
            <span className="text-muted-foreground/50">Secure</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest">
            <Zap className="w-3 h-3 text-neon-magenta" />
            <span className="text-muted-foreground/50">Tools Active</span>
          </div>
          <a href="/admin/dashboard" className="text-[9px] uppercase tracking-widest text-muted-foreground/40 hover:text-neon-purple transition-colors">
            ← Command Chamber
          </a>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 scrollbar-hide min-h-0 relative z-10">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
            {/* AI Avatar centerpiece */}
            <AIAvatar state={aiState} size="md" className="mb-10" />

            <div className="mb-8 mt-4">
              <div className="text-xs uppercase tracking-[0.3em] text-neon-purple/60 mb-1">AI Operator</div>
              <div
                className="text-2xl font-display tracking-[0.2em]"
                style={{
                  backgroundImage: `linear-gradient(90deg, hsl(var(--foreground)) 0%, hsl(var(--neon-purple-light)) 50%, hsl(var(--foreground)) 100%)`,
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmerText 6s ease-in-out infinite",
                }}
              >
                FULL SYSTEM CONTROL
              </div>
              <div className="text-[10px] text-muted-foreground/40 mt-3 tracking-wider max-w-md">
                Execute any admin operation through natural language. The AI can query data, run classification,
                create accounts, generate reports, and manage the entire loyalty platform.
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8 text-[10px] uppercase tracking-widest">
              {[
                { color: "neon-cyan", label: "Classification Engine" },
                { color: "neon-magenta", label: "Import Pipeline" },
                { color: "neon-blue", label: "Report Generator" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full bg-${item.color} animate-pulse`} />
                  <span className="text-muted-foreground/50">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2.5 max-w-xl">
              {OPERATOR_COMMANDS.map((cmd, idx) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.label}
                    onClick={() => send(cmd.label)}
                    className="group text-left text-[10px] px-4 py-3 rounded-xl border border-neon-purple/10 text-muted-foreground/60 hover:text-neon-purple-light hover:border-neon-purple/25 transition-all backdrop-blur-sm flex items-start gap-2.5"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--card) / 0.3) 0%, hsl(var(--card) / 0.1) 100%)',
                    }}
                  >
                    <div
                      className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 transition-all group-hover:shadow-[0_0_10px_hsl(var(--neon-purple)_/_0.2)]"
                      style={{
                        background: 'linear-gradient(135deg, hsl(var(--neon-purple) / 0.1) 0%, hsl(var(--neon-magenta) / 0.05) 100%)',
                      }}
                    >
                      <Icon className="w-3 h-3 text-neon-purple/60 group-hover:text-neon-purple transition-colors" />
                    </div>
                    <span className="leading-relaxed">{cmd.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-1 max-w-3xl mx-auto">
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
        <div className="flex gap-1.5 px-4 py-2 overflow-x-auto scrollbar-hide relative z-10">
          {OPERATOR_COMMANDS.slice(0, 4).map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => send(cmd.label)}
              className="shrink-0 text-[9px] px-3 py-1.5 rounded-full border border-neon-purple/10 text-muted-foreground/50 hover:text-neon-purple hover:border-neon-purple/25 hover:bg-neon-purple/5 transition-all backdrop-blur-sm"
            >
              {cmd.label.length > 45 ? cmd.label.slice(0, 45) + "…" : cmd.label}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 pb-4 pt-2 relative z-10 max-w-3xl mx-auto w-full">
        <div
          className="flex items-end gap-2 rounded-2xl backdrop-blur-xl border border-neon-purple/15 px-4 py-3"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--card) / 0.3) 0%, hsl(var(--card) / 0.15) 100%)',
            boxShadow: '0 0 40px -10px hsl(var(--neon-purple) / 0.12)',
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Command the AI Operator..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-foreground/90 placeholder:text-muted-foreground/30 resize-none outline-none scrollbar-hide font-mono"
            style={{ maxHeight: 120 }}
            disabled={isLoading}
          />
          <Button
            onClick={() => send(input)}
            disabled={isLoading || !input.trim()}
            size="icon"
            className={cn(
              "shrink-0 h-9 w-9 rounded-lg transition-all",
              input.trim()
                ? "bg-neon-purple text-white shadow-[0_0_15px_hsl(var(--neon-purple)_/_0.3)]"
                : "bg-neon-purple/10 text-muted-foreground/30"
            )}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="text-center mt-2 text-[8px] text-muted-foreground/30 uppercase tracking-widest">
          All actions are audit-logged · Destructive operations require confirmation
        </div>
      </div>

      <style>{`
        @keyframes shimmerText {
          0%, 100% { background-position: 200% 0; }
          50% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
