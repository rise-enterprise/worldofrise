import { Bot, User, Download } from "lucide-react";
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
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted/60 rounded-lg p-3 my-2 overflow-x-auto text-xs"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-muted/60 px-1.5 py-0.5 rounded text-primary/90 text-xs">$1</code>')
    // Images (markdown format) — render as actual images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-3"><img src="$2" alt="$1" class="max-w-full rounded-lg border border-[rgba(200,162,74,0.15)]" style="max-height:400px" /><div class="flex items-center gap-2 mt-1.5"><span class="text-[10px] text-[#5a5a64]">$1</span><a href="$2" download target="_blank" rel="noopener" class="text-[10px] text-[#C8A24A]/60 hover:text-[#C8A24A] flex items-center gap-1">⬇ Download</a></div></div>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-primary font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-sm font-semibold mt-3 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-base font-semibold mt-3 mb-1">$1</h1>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="my-1.5">')
    .replace(/\n/g, '<br/>');

  return `<p class="my-1.5">${html}</p>`;
}

// Detect standalone image URLs in text (not already in markdown image syntax)
function extractImageUrls(text: string): string[] {
  const urls: string[] = [];
  const urlRegex = /(https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp|gif)(?:\?[^\s"'<>]*)?)/gi;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    // Skip if it's part of markdown image syntax
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
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
          isUser
            ? "bg-primary/20 text-primary"
            : "bg-accent/30 text-accent-foreground"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div
        className={cn(
          "flex-1 min-w-0 rounded-xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary/10 text-foreground ml-12"
            : "bg-muted/40 text-foreground mr-12"
        )}
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
                    className="w-20 h-20 object-cover rounded-lg border border-[rgba(200,162,74,0.15)]"
                  />
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[rgba(200,162,74,0.1)] bg-[rgba(200,162,74,0.04)] text-[10px] text-[#5a5a64]">
                    📎 {att.name}
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
              <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5 rounded-sm" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
