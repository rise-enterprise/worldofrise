import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Users, Filter, CheckCircle2, Mail, Calendar, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useMembers } from '@/hooks/useMembers';
import { useTiers } from '@/hooks/useTiers';

type NotificationType = 'event' | 'tier_upgrade' | 'promotion';

export function NotificationsView() {
  const { t } = useTranslation();
  const { data: members = [], isLoading: membersLoading } = useMembers();
  const { data: tiers = [] } = useTiers();

  const [notificationType, setNotificationType] = useState<NotificationType>('event');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [eventName, setEventName] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0 });

  // Filter members with email addresses
  const membersWithEmail = members.filter(m => m.email);
  
  // Apply tier filter
  const filteredMembers = filterTier === 'all' 
    ? membersWithEmail 
    : membersWithEmail.filter(m => m.tier === filterTier);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedMembers(new Set(filteredMembers.map(m => m.id)));
    } else {
      setSelectedMembers(new Set());
    }
  };

  const handleSelectMember = (memberId: string, checked: boolean) => {
    const newSelected = new Set(selectedMembers);
    if (checked) {
      newSelected.add(memberId);
    } else {
      newSelected.delete(memberId);
    }
    setSelectedMembers(newSelected);
    setSelectAll(newSelected.size === filteredMembers.length);
  };

  const handleSendNotifications = async () => {
    if (selectedMembers.size === 0) {
      toast.error('Please select at least one member');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!content.trim()) {
      toast.error('Please enter message content');
      return;
    }

    setIsSending(true);
    setSendProgress({ sent: 0, total: selectedMembers.size });

    const memberIds = Array.from(selectedMembers);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < memberIds.length; i++) {
      const memberId = memberIds[i];
      
      try {
        const { error } = await supabase.functions.invoke('send-notification', {
          body: {
            member_id: memberId,
            notification_type: notificationType,
            subject,
            content,
            event_name: notificationType === 'event' ? eventName : undefined,
          },
        });

        if (error) {
          console.error(`Failed to send to ${memberId}:`, error);
          failCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`Failed to send to ${memberId}:`, error);
        failCount++;
      }

      setSendProgress({ sent: i + 1, total: memberIds.length });
    }

    setIsSending(false);
    
    if (failCount === 0) {
      toast.success(`Successfully sent ${successCount} notifications`);
      // Reset form
      setSubject('');
      setContent('');
      setEventName('');
      setSelectedMembers(new Set());
      setSelectAll(false);
    } else {
      toast.warning(`Sent ${successCount} notifications, ${failCount} failed`);
    }
  };

  const notificationTypes = [
    { value: 'event', label: 'Event Announcement', icon: Calendar },
    { value: 'tier_upgrade', label: 'Tier Upgrade', icon: Trophy },
    { value: 'promotion', label: 'Promotion', icon: Mail },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          {t('notifications.bulkTitle', 'Send Notifications')}
        </h2>
        <p className="text-muted-foreground mt-1">
          {t('notifications.bulkDescription', 'Send email notifications to selected members')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Compose Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5 text-primary" />
              Compose Notification
            </CardTitle>
            <CardDescription>
              Create your notification message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Notification Type</Label>
              <Select value={notificationType} onValueChange={(v) => setNotificationType(v as NotificationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {notificationType === 'event' && (
              <div className="space-y-2">
                <Label htmlFor="eventName">Event Name</Label>
                <Input
                  id="eventName"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g., New Year's Eve Gala"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your notification message..."
                rows={6}
              />
            </div>

            <Button 
              onClick={handleSendNotifications}
              disabled={isSending || selectedMembers.size === 0}
              className="w-full gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending {sendProgress.sent}/{sendProgress.total}...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send to {selectedMembers.size} {selectedMembers.size === 1 ? 'Member' : 'Members'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recipients Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Select Recipients
            </CardTitle>
            <CardDescription>
              {membersWithEmail.length} members have email addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterTier} onValueChange={setFilterTier}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Filter by tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    {tiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.name}>
                        {tier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Select All */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="selectAll"
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="selectAll" className="cursor-pointer font-medium">
                  Select All ({filteredMembers.length})
                </Label>
              </div>
              {selectedMembers.size > 0 && (
                <Badge variant="secondary">
                  {selectedMembers.size} selected
                </Badge>
              )}
            </div>

            {/* Member List */}
            <ScrollArea className="h-[340px] rounded-lg border border-border/50">
              {membersLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                  <Mail className="h-8 w-8 mb-2" />
                  <p className="text-sm text-center">No members with email addresses found</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors"
                    >
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={selectedMembers.has(member.id)}
                        onCheckedChange={(checked) => handleSelectMember(member.id, checked as boolean)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                      {member.tier && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {member.tier}
                        </Badge>
                      )}
                      {selectedMembers.has(member.id) && (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
