import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface Attachment {
  url: string;
  type: string;
  name: string;
}

interface CopilotMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  attachments?: Attachment[];
  modelTag?: string;
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono" style="background:hsl(var(--muted));border:1px solid hsl(var(--gold) / 0.1)"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded text-xs font-mono" style="background:hsl(var(--gold) / 0.06);color:hsl(var(--gold))">$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-3"><img src="$2" alt="$1" class="max-w-full rounded-lg" style="max-height:400px;border:1px solid hsl(var(--gold) / 0.08)" /><div class="flex items-center gap-2 mt-1.5"><span class="text-[10px] text-muted-foreground">$1</span><a href="$2" download target="_blank" rel="noopener" class="text-[10px] flex items-center gap-1" style="color:hsl(var(--gold) / 0.5)">Download</a></div></div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1 tracking-wide" style="color:hsl(var(--gold))">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-sm font-semibold mt-3 mb-1 tracking-wide" style="color:hsl(var(--gold))">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-base font-semibold mt-3 mb-1 tracking-wide" style="color:hsl(var(--gold))">$1</h1>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-muted-foreground">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-muted-foreground">$1</li>')
    .replace(/\n\n/g, '</p><p class="my-1.5">')
    .replace(/\n/g, '<br/>');

  return `<p class="my-1.5">${html}</p>`;
}

export default function CopilotMessage({ role, content, isStreaming, attachments, modelTag }: CopilotMessageProps) {
  const isUser = role === "user";
  const html = useMemo(() => (isUser ? "" : renderMarkdown(content)), [content, isUser]);

  return (
    <div
      className={cn(
        "flex gap-3 py-3 px-2 animate-fade-in",
        isUser ? "flex-row-reverse" : ""
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {/* Glow behind assistant avatar */}
        {!isUser && (
          <div
            className="absolute inset-[-6px] rounded-xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, hsl(var(--gold) / 0.1) 0%, transparent 70%)",
            }}
          />
        )}
        <div
          className={cn(
            "relative w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm",
            isUser
              ? "bg-primary/8 border border-primary/12"
              : "bg-primary/5 border border-primary/10"
          )}
        >
          {isUser ? (
            <User className="w-3.5 h-3.5 text-primary/70" />
          ) : (
            <span className="text-[10px] font-bold text-primary">R</span>
          )}
        </div>
      </div>

      {/* Message */}
      <div
        className={cn(
          "relative flex-1 min-w-0 rounded-xl text-sm leading-relaxed overflow-hidden",
          isUser ? "ml-12" : "mr-12"
        )}
      >
        {/* Gold accent bar for assistant */}
        {!isUser && (
          <div
            className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
            style={{
              background: "linear-gradient(to bottom, hsl(var(--gold) / 0.4), hsl(var(--gold) / 0.08))",
            }}
          />
        )}

        <div
          className={cn(
            "px-4 py-3",
            !isUser && "pl-5"
          )}
          style={{
            backgroundColor: isUser
              ? "hsl(var(--gold) / 0.04)"
              : "hsl(var(--muted) / 0.5)",
            border: `1px solid hsl(var(--gold) / ${isUser ? "0.08" : "0.06"})`,
            borderRadius: "0.75rem",
            color: "hsl(var(--foreground))",
          }}
        >
          {isUser && attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((att, i) => (
                <div key={i} className="relative">
                  {att.type.startsWith("image/") ? (
                    <img
                      src={att.url}
                      alt={att.name}
                      className="w-20 h-20 object-cover rounded-lg border border-primary/10"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] border border-primary/10 bg-primary/[0.03] text-muted-foreground">
                      ◆ {att.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="max-w-none">
              <div dangerouslySetInnerHTML={{ __html: html }} />
              {isStreaming && (
                <span className="inline-flex items-center gap-1 ml-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary/50"
                      style={{
                        animation: `dotWave 1.2s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </span>
              )}
              {modelTag && (
                <div className="mt-3 pt-2 border-t border-primary/[0.06]">
                  <span className="text-[8px] uppercase tracking-[0.1em] text-muted-foreground/50">
                    {modelTag}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dotWave {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
