import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface CopilotMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

function renderMarkdown(text: string): string {
  let html = text
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-muted/60 rounded-lg p-3 my-2 overflow-x-auto text-xs"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-muted/60 px-1.5 py-0.5 rounded text-primary/90 text-xs">$1</code>')
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
    // Line breaks into paragraphs
    .replace(/\n\n/g, '</p><p class="my-1.5">')
    .replace(/\n/g, '<br/>');

  return `<p class="my-1.5">${html}</p>`;
}

export default function CopilotMessage({ role, content, isStreaming }: CopilotMessageProps) {
  const isUser = role === "user";
  const html = useMemo(() => (isUser ? "" : renderMarkdown(content)), [content, isUser]);

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
