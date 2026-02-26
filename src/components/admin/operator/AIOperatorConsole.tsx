import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Zap, Shield, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CopilotMessage from "../copilot/CopilotMessage";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const OPERATOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-operator`;

const OPERATOR_COMMANDS = [
  "Fix all import issues and reclassify every contact",
  "Show me the current RFM segment distribution",
  "Export a report of dormant VIP contacts",
  "Show tier mismatches — computed vs stored tiers",
  "Rebuild all segments using RFM and show distribution",
  "Create a reactivation segment for 90-day dormant guests",
  "Show me the top 20 spenders across all brands",
  "Run full data quality check on contacts",
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
  const [ttsEnabled, setTtsEnabled] = useState(false);
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
        toast({ title: "AI Operator Error", description: err, variant: "destructive" });
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

  const isEmpty = messages.length === 0;

  return (
    <div className="h-screen w-screen bg-[#020610] overflow-hidden relative flex flex-col">
      {/* Background grid effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(200,162,74,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(200,162,74,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-primary/10 bg-[#020610]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Terminal className="w-5 h-5 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-primary font-medium">RISE AI Operator</div>
            <div className="text-[9px] text-muted-foreground/40 tracking-wider">Full System Control · Tool Execution · Audit Logged</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span className="text-muted-foreground/50">Secure</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-muted-foreground/50">Tools Active</span>
          </div>
          <a href="/admin/dashboard" className="text-[9px] uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors">
            ← Command Chamber
          </a>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 scrollbar-hide min-h-0 relative z-10">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
            <div className="mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 mx-auto">
                <Terminal className="w-8 h-8 text-primary" />
              </div>
              <div className="text-xs uppercase tracking-[0.3em] text-primary/60 mb-1">AI Operator</div>
              <div className="text-2xl font-serif text-primary tracking-widest">FULL SYSTEM CONTROL</div>
              <div className="text-[10px] text-muted-foreground/40 mt-3 tracking-wider max-w-md">
                Execute any admin operation through natural language. The AI can query data, run classification,
                create accounts, generate reports, and manage the entire loyalty platform.
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8 text-[10px] uppercase tracking-widest">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-muted-foreground/50">Classification Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-muted-foreground/50">Import Pipeline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-muted-foreground/50">Report Generator</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 max-w-xl">
              {OPERATOR_COMMANDS.map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => send(cmd)}
                  className="text-left text-[10px] px-3 py-2.5 rounded-lg border border-primary/10 bg-primary/5 text-muted-foreground/60 hover:text-primary hover:border-primary/25 hover:bg-primary/10 transition-all backdrop-blur-sm"
                >
                  {cmd}
                </button>
              ))}
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
              key={cmd}
              onClick={() => send(cmd)}
              className="shrink-0 text-[9px] px-2.5 py-1.5 rounded-full border border-primary/10 bg-primary/5 text-muted-foreground/50 hover:text-primary hover:border-primary/20 transition-all"
            >
              {cmd.length > 45 ? cmd.slice(0, 45) + "…" : cmd}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 pb-4 pt-2 relative z-10 max-w-3xl mx-auto w-full">
        <div className="flex items-end gap-2 rounded-2xl bg-card/20 backdrop-blur-xl border border-primary/10 px-4 py-3 shadow-[0_0_40px_-10px_hsl(42,50%,54%,0.15)]">
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
              input.trim() ? "bg-primary text-primary-foreground" : "bg-primary/10 text-muted-foreground/30"
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
    </div>
  );
}
