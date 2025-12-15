import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Bell, 
  Mail, 
  MessageSquare, 
  Globe, 
  Shield, 
  Database,
  Save,
  Coffee,
  UtensilsCrossed
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SettingsView() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: true,
    autoReengagement: true,
    churnAlerts: true,
    vipAlerts: true,
    language: 'en',
    timezone: 'AST',
  });

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Settings
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure your RISE loyalty dashboard
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="notifications">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card variant="luxury">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how you receive alerts and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, emailNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, smsNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">WhatsApp Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via WhatsApp</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.whatsappNotifications}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, whatsappNotifications: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card variant="luxury">
            <CardHeader>
              <CardTitle className="text-lg">Alert Settings</CardTitle>
              <CardDescription>
                Configure automated alerts for guest management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Auto Re-engagement</p>
                  <p className="text-sm text-muted-foreground">Automatically suggest messages for at-risk guests</p>
                </div>
                <Switch 
                  checked={settings.autoReengagement}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, autoReengagement: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Churn Risk Alerts</p>
                  <p className="text-sm text-muted-foreground">Notify when guests become high-risk</p>
                </div>
                <Switch 
                  checked={settings.churnAlerts}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, churnAlerts: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">VIP Guest Alerts</p>
                  <p className="text-sm text-muted-foreground">Special notifications for Inner Circle & Black tier</p>
                </div>
                <Switch 
                  checked={settings.vipAlerts}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, vipAlerts: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="luxury">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Coffee className="h-5 w-5" />
                  NOIR Café
                </CardTitle>
                <CardDescription>Configure NOIR brand settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Brand Email</Label>
                  <Input defaultValue="loyalty@noircafe.com" className="mt-1" />
                </div>
                <div>
                  <Label>Welcome Message (English)</Label>
                  <Input defaultValue="Welcome to the quiet elegance of NOIR" className="mt-1" />
                </div>
                <div>
                  <Label>Welcome Message (Arabic)</Label>
                  <Input defaultValue="مرحباً بك في أناقة نوار الهادئة" className="mt-1" dir="rtl" />
                </div>
              </CardContent>
            </Card>

            <Card variant="luxury">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-sasso-accent" />
                  SASSO
                </CardTitle>
                <CardDescription>Configure SASSO brand settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Brand Email</Label>
                  <Input defaultValue="reservations@sasso.com" className="mt-1" />
                </div>
                <div>
                  <Label>Welcome Message (English)</Label>
                  <Input defaultValue="Welcome to Italian excellence at SASSO" className="mt-1" />
                </div>
                <div>
                  <Label>Welcome Message (Arabic)</Label>
                  <Input defaultValue="مرحباً بك في التميز الإيطالي في ساسو" className="mt-1" dir="rtl" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6 space-y-6">
          <Card variant="luxury">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Connected Systems
              </CardTitle>
              <CardDescription>
                Manage integrations with external systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">POS System</p>
                  <p className="text-sm text-muted-foreground">Square POS Integration</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">Reservation System</p>
                  <p className="text-sm text-muted-foreground">SevenRooms Integration</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">WhatsApp Business</p>
                  <p className="text-sm text-muted-foreground">Meta Business Suite</p>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">Email Marketing</p>
                  <p className="text-sm text-muted-foreground">Mailchimp / Klaviyo</p>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card variant="luxury">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage access and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">Session Management</p>
                  <p className="text-sm text-muted-foreground">View and manage active sessions</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">API Keys</p>
                  <p className="text-sm text-muted-foreground">Manage API access for integrations</p>
                </div>
                <Button variant="outline" size="sm">View Keys</Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="luxury">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Regional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Language</Label>
                  <Input defaultValue="English" className="mt-1" />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Input defaultValue="Arabia Standard Time (AST)" className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
