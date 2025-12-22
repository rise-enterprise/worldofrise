import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Sparkles } from 'lucide-react';
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

    // Simulate response delay
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
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="font-display flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-foreground">RISE Concierge</p>
              <p className="text-xs font-normal text-muted-foreground">Always at your service</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
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
                  message.sender === 'concierge' ? 'bg-primary/10' : 'bg-muted'
                )}>
                  {message.sender === 'concierge' ? (
                    <Bot className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5',
                  message.sender === 'concierge' 
                    ? 'bg-muted text-foreground rounded-tl-sm' 
                    : 'bg-primary text-primary-foreground rounded-tr-sm'
                )}>
                  <p className="text-sm">{message.content}</p>
                  <p className={cn(
                    'text-[10px] mt-1',
                    message.sender === 'concierge' ? 'text-muted-foreground' : 'text-primary-foreground/70'
                  )}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Responses */}
        <div className="px-4 py-2 border-t border-border">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickResponses.map((response) => (
              <Button
                key={response}
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-xs shrink-0"
                onClick={() => handleSend(response)}
                disabled={isTyping}
              >
                {response}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
