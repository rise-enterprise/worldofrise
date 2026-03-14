import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Brain, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'concierge';
  timestamp: Date;
}

interface ConciergeChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
}

const quickResponses = [
  'I\'d like to make a reservation',
  'What events are coming up?',
  'Tell me about my privileges',
  'I have a special request',
];

export function ConciergeChat({ open, onOpenChange, memberName }: ConciergeChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Welcome back, ${memberName}! I'm your personal RISE concierge. How may I assist you today?`,
      sender: 'concierge',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getConciergeResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('reservation') || lowerMessage.includes('book')) {
      return "I'd be happy to help with a reservation. Which venue would you prefer - NOIR Café or SASSO? And for how many guests?";
    }
    if (lowerMessage.includes('event')) {
      return "We have several exciting events coming up! The Literary Evening at NOIR is next week, and our exclusive Chef's Table experience at SASSO is in two weeks. Would you like me to reserve a spot for you?";
    }
    if (lowerMessage.includes('privilege') || lowerMessage.includes('benefit')) {
      return "As a RISE Black member, you enjoy our highest tier privileges including priority seating, complimentary signature drinks, exclusive event access, and personal concierge service. Would you like to learn more about any specific benefit?";
    }
    if (lowerMessage.includes('special') || lowerMessage.includes('request')) {
      return "Of course! Please share your special request, and I'll do my best to accommodate. Our team is dedicated to making your experience exceptional.";
    }
    if (lowerMessage.includes('noir')) {
      return "NOIR Café is our signature specialty coffee destination. We have locations at The Pearl and Lusail. Would you like to make a reservation or learn about upcoming events there?";
    }
    if (lowerMessage.includes('sasso')) {
      return "SASSO is our Italian fine dining experience. We offer an exquisite menu with authentic Italian cuisine. Would you like to book a table or learn about our Chef's Table experiences?";
    }
    return "Thank you for reaching out! I'm here to help with reservations, event information, or any special requests. How may I assist you further?";
  };

  const handleSend = async (message?: string) => {
    const messageToSend = message || input;
    if (!messageToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: getConciergeResponse(messageToSend),
        sender: 'concierge',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0 border-neon-purple/20 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--card) / 0.95) 100%)',
        }}
      >
        {/* Ambient neon glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 60% 30% at 50% 0%, hsl(var(--neon-purple) / 0.08) 0%, transparent 60%),
              radial-gradient(ellipse 40% 20% at 70% 100%, hsl(var(--neon-magenta) / 0.05) 0%, transparent 50%)
            `,
          }}
        />

        <DialogHeader className="relative z-10 px-6 py-4 border-b border-neon-purple/10">
          <DialogTitle className="font-display flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center ring-1 ring-neon-purple/30"
              style={{
                background: 'radial-gradient(circle, hsl(var(--neon-purple) / 0.2) 0%, hsl(var(--neon-magenta) / 0.1) 100%)',
              }}
            >
              <Brain className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-foreground tracking-wider text-sm">RISE Concierge</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-40" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-cyan" />
                </span>
                <p className="text-[10px] font-normal text-muted-foreground/50 tracking-wider uppercase">Online</p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 relative z-10" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-fade-in',
                  message.sender === 'user' && 'flex-row-reverse'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                  message.sender === 'concierge' ? 'ring-1 ring-neon-purple/25' : 'bg-muted'
                )}
                  style={message.sender === 'concierge' ? {
                    background: 'radial-gradient(circle, hsl(var(--neon-purple) / 0.12) 0%, transparent 100%)',
                  } : undefined}
                >
                  {message.sender === 'concierge' ? (
                    <Brain className="h-4 w-4 text-neon-purple" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5 relative',
                  message.sender === 'concierge' 
                    ? 'rounded-tl-sm border border-neon-purple/12 backdrop-blur-sm' 
                    : 'bg-neon-purple text-white rounded-tr-sm'
                )}
                  style={message.sender === 'concierge' ? {
                    background: 'linear-gradient(135deg, hsl(var(--card) / 0.6) 0%, hsl(var(--card) / 0.3) 100%)',
                  } : undefined}
                >
                  {message.sender === 'concierge' && (
                    <div
                      className="absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-full"
                      style={{
                        background: 'linear-gradient(180deg, hsl(var(--neon-purple) / 0.5), hsl(var(--neon-magenta) / 0.25))',
                      }}
                    />
                  )}
                  <p className={cn("text-sm", message.sender === 'concierge' && "pl-1")}>{message.content}</p>
                  <p className={cn(
                    'text-[10px] mt-1',
                    message.sender === 'concierge' ? 'text-muted-foreground/40 pl-1' : 'text-white/60'
                  )}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div
                  className="w-8 h-8 rounded-full ring-1 ring-neon-purple/25 flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, hsl(var(--neon-purple) / 0.12) 0%, transparent 100%)',
                  }}
                >
                  <Brain className="h-4 w-4 text-neon-purple" />
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-4 py-3 border border-neon-purple/12 backdrop-blur-sm"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--card) / 0.6) 0%, hsl(var(--card) / 0.3) 100%)',
                  }}
                >
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-neon-purple/50"
                        style={{
                          animation: 'conciergeDotWave 1.2s ease-in-out infinite',
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Responses */}
        <div className="relative z-10 px-4 py-2 border-t border-neon-purple/8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickResponses.map((response) => (
              <Button
                key={response}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs shrink-0 border-neon-purple/15 text-muted-foreground/60 hover:text-neon-purple-light hover:border-neon-purple/30 hover:bg-neon-purple/5 transition-all"
                onClick={() => handleSend(response)}
                disabled={isTyping}
              >
                {response}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="relative z-10 p-4 border-t border-neon-purple/10">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              className={cn(
                "flex-1 h-10 rounded-xl px-4 text-sm font-body",
                "bg-card/40 border border-neon-purple/15 text-foreground",
                "placeholder:text-muted-foreground/40",
                "focus:outline-none focus:border-neon-purple/40",
                "focus:shadow-[0_0_0_3px_hsl(var(--neon-purple)_/_0.08)]",
                "transition-all duration-300 backdrop-blur-sm",
                "disabled:opacity-50"
              )}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
              className={cn(
                "shrink-0 h-10 w-10 rounded-xl transition-all",
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
          @keyframes conciergeDotWave {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50% { transform: translateY(-4px); opacity: 1; }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
