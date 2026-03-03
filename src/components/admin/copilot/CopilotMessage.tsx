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
}

function renderMarkdown(text: string): string {
  let html = text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono" style="background:rgba(138,138,148,0.04);border:1px solid rgba(138,138,148,0.06)"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded text-xs font-mono" style="background:rgba(138,138,148,0.06);color:#C8A24A">$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-3"><img src="$2" alt="$1" class="max-w-full rounded-lg" style="max-height:400px;border:1px solid rgba(138,138,148,0.08)" /><div class="flex items-center gap-2 mt-1.5"><span class="text-[10px]" style="color:#5a5a64">$1</span><a href="$2" download target="_blank" rel="noopener" class="text-[10px] flex items-center gap-1" style="color:rgba(200,162,74,0.5)">⬇ Download</a></div></div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#e0ddd8;font-weight:600">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1 font-mono tracking-wide" style="color:#8a8a94">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-sm font-semibold mt-3 mb-1 font-mono tracking-wide" style="color:#8a8a94">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-base font-semibold mt-3 mb-1 font-mono tracking-wide" style="color:#C8A24A">$1</h1>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc" style="color:#8a8a94">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal" style="color:#8a8a94">$1</li>')
    .replace(/\n\n/g, '</p><p class="my-1.5">')
    .replace(/\n/g, '<br/>');

  return `<p class="my-1.5">${html}</p>`;
}

function extractImageUrls(text: string): string[] {
  const urls: string[] = [];
  const urlRegex = /(https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp|gif)(?:\?[^\s"'<>]*)?)/gi;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const before = text.substring(Math.max(0, match.index - 2), match.index);
    if (!before.includes("](")) {
      urls.push(match[1]);
    }
  }
  return urls;
}

export default function CopilotMessage({ role, content, isStreaming, attachments }: CopilotMessageProps) {
  const isUser = role === "user";
  const html = useMemo(() => (isUser ? "" : renderMarkdown(content)), [content, isUser]);
  const standaloneImages = useMemo(() => (isUser ? [] : extractImageUrls(content)), [content, isUser]);

  return (
    <div className={cn("flex gap-3 py-4 px-2", isUser ? "flex-row-reverse" : "")}>
      {/* Icon — industrial insignia style */}
      <div
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
          backgroundColor: isUser ? "rgba(200,162,74,0.06)" : "rgba(138,138,148,0.04)",
          border: `1px solid ${isUser ? "rgba(200,162,74,0.1)" : "rgba(138,138,148,0.06)"}`,
        }}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5" style={{ color: "#C8A24A" }} />
        ) : (
          <span className="text-[10px] font-mono font-bold" style={{ color: "#8a8a94" }}>R</span>
        )}
      </div>

      {/* Message panel — frosted glass with steel border */}
      <div
        className={cn(
          "flex-1 min-w-0 rounded-xl px-4 py-3 text-sm leading-relaxed",
          isUser ? "ml-12" : "mr-12"
        )}
        style={{
          backgroundColor: isUser ? "rgba(200,162,74,0.03)" : "rgba(138,138,148,0.02)",
          border: `1px solid ${isUser ? "rgba(200,162,74,0.06)" : "rgba(138,138,148,0.04)"}`,
          color: "#c0bdb8",
        }}
      >
        {/* User attachment previews */}
        {isUser && attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((att, i) => (
              <div key={i} className="relative">
                {att.type.startsWith("image/") ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-20 h-20 object-cover rounded-lg"
                    style={{ border: "1px solid rgba(138,138,148,0.08)" }}
                  />
                ) : (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono"
                    style={{
                      border: "1px solid rgba(138,138,148,0.06)",
                      backgroundColor: "rgba(138,138,148,0.03)",
                      color: "#5a5a64",
                    }}
                  >
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
              <span
                className="inline-block w-1.5 h-4 animate-pulse ml-0.5 rounded-sm"
                style={{ backgroundColor: "rgba(200,162,74,0.4)" }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
