import { useState } from 'react';
import { GuestInsight } from '@/types/loyalty';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Mail, MessageSquare, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AIMessageGeneratorProps {
  insight: GuestInsight;
}

export function AIMessageGenerator({ insight }: AIMessageGeneratorProps) {
  const [message, setMessage] = useState(insight.suggestedMessage.body);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast({
      title: 'Copied',
      description: 'Message copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const toneConfig = {
    noir: {
      label: 'NOIR Tone',
      color: 'bg-zinc-800 text-zinc-100',
    },
    sasso: {
      label: 'SASSO Tone',
      color: 'bg-amber-900 text-amber-100',
    },
    rise: {
      label: 'RISE Tone',
      color: 'bg-primary text-primary-foreground',
    },
  };

  const tone = toneConfig[insight.suggestedMessage.tone];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">AI-Generated Message</h4>
        <span className={cn('text-xs px-2 py-1 rounded-full', tone.color)}>
          {tone.label}
        </span>
      </div>

      {/* Subject Line */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
        <span className="text-xs text-muted-foreground">Subject:</span>
        <p className="font-medium text-foreground">{insight.suggestedMessage.subject}</p>
      </div>

      {/* Message Body */}
      <div>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[120px] resize-none"
          placeholder="Message body..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          Edit the message before sending
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCopy}
          className="flex-1"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Message
            </>
          )}
        </Button>
        
        <Button variant="outline" size="sm" className="flex-1">
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </Button>
        
        <Button variant="outline" size="sm" className="flex-1">
          <MessageSquare className="h-4 w-4 mr-2" />
          WhatsApp
        </Button>
      </div>

      {/* Recommendations */}
      {insight.recommendations.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h5 className="text-sm font-medium text-foreground mb-2">Recommendations</h5>
          <ul className="space-y-1">
            {insight.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
