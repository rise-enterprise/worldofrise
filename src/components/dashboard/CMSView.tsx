import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Palette, Type, Image, Settings2, Save, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorSetting {
  id: string;
  name: string;
  value: string;
  cssVar: string;
}

const defaultColors: ColorSetting[] = [
  { id: '1', name: 'Primary (Gold)', value: '#C8A24A', cssVar: '--primary' },
  { id: '2', name: 'Background', value: '#07080A', cssVar: '--background' },
  { id: '3', name: 'Surface (Obsidian)', value: '#0E1116', cssVar: '--card' },
  { id: '4', name: 'Burgundy Accent', value: '#722F37', cssVar: '--burgundy' },
  { id: '5', name: 'Sapphire Accent', value: '#1E3A5F', cssVar: '--sapphire' },
];

interface TextSetting {
  id: string;
  label: string;
  key: string;
  value: string;
}

const defaultTexts: TextSetting[] = [
  { id: '1', label: 'Welcome Heading', key: 'welcome_heading', value: 'Welcome to RISE' },
  { id: '2', label: 'Welcome Subtitle', key: 'welcome_subtitle', value: 'Your exclusive journey awaits' },
  { id: '3', label: 'Member Portal Title', key: 'member_portal_title', value: 'Your Private Salon' },
  { id: '4', label: 'Rewards Section Title', key: 'rewards_title', value: 'Exclusive Privileges' },
  { id: '5', label: 'Events Section Title', key: 'events_title', value: 'Private Gatherings' },
];

export function CMSView() {
  const [colors, setColors] = useState(defaultColors);
  const [texts, setTexts] = useState(defaultTexts);
  const [defaultDarkMode, setDefaultDarkMode] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  const handleColorChange = (id: string, value: string) => {
    setColors(colors.map(c => c.id === id ? { ...c, value } : c));
    setHasChanges(true);
  };

  const handleTextChange = (id: string, value: string) => {
    setTexts(texts.map(t => t.id === id ? { ...t, value } : t));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save to database in real implementation
    setHasChanges(false);
  };

  const handleReset = () => {
    setColors(defaultColors);
    setTexts(defaultTexts);
    setHasChanges(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-medium text-foreground tracking-wide">
            Content Management
          </h1>
          <p className="text-sm text-muted-foreground/60 mt-2 tracking-refined">
            Customize your platform's appearance and content
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="vip-gold" onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="theme" className="space-y-6">
        <TabsList className="bg-[#0E1116] border border-[rgba(217,222,231,0.08)]">
          <TabsTrigger value="theme" className="data-[state=active]:bg-primary/10">
            <Palette className="h-4 w-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-primary/10">
            <Type className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="assets" className="data-[state=active]:bg-primary/10">
            <Image className="h-4 w-4 mr-2" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary/10">
            <Settings2 className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Theme Tab */}
        <TabsContent value="theme" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Color Palette */}
            <Card variant="obsidian">
              <CardHeader>
                <CardTitle className="text-lg font-display flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Color Palette
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {colors.map((color) => (
                  <div key={color.id} className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Label className="text-sm">{color.name}</Label>
                      <p className="text-xs text-muted-foreground/60 mt-1">{color.cssVar}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input
                        type="color"
                        value={color.value}
                        onChange={(e) => handleColorChange(color.id, e.target.value)}
                        className="w-12 h-10 p-1 bg-transparent border-[rgba(217,222,231,0.08)] cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={color.value}
                        onChange={(e) => handleColorChange(color.id, e.target.value)}
                        className="w-24 bg-[#0B0D11] border-[rgba(217,222,231,0.08)] text-xs"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mode Settings */}
            <Card variant="obsidian">
              <CardHeader>
                <CardTitle className="text-lg font-display">Display Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-[#0B0D11] border border-[rgba(217,222,231,0.08)]">
                  <div>
                    <p className="text-sm font-medium">Default Theme</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Set the default theme for new visitors
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground/60">Light</span>
                    <Switch 
                      checked={defaultDarkMode}
                      onCheckedChange={setDefaultDarkMode}
                    />
                    <span className="text-xs text-muted-foreground/60">Dark</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#0B0D11] border border-[rgba(217,222,231,0.08)]">
                  <p className="text-sm font-medium mb-3">Preview Theme Toggle</p>
                  <ThemeToggle />
                </div>

                {/* Live Preview */}
                <div className="p-4 rounded-lg border border-[rgba(217,222,231,0.08)]" style={{ backgroundColor: colors[1].value }}>
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: colors[0].value }}>
                    Live Preview
                  </p>
                  <div className="p-4 rounded-lg" style={{ backgroundColor: colors[2].value }}>
                    <h3 className="font-display text-lg" style={{ color: colors[0].value }}>
                      {texts[0].value}
                    </h3>
                    <p className="text-sm mt-1 opacity-60" style={{ color: '#D9DEE7' }}>
                      {texts[1].value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card variant="obsidian">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" />
                Text Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {texts.map((text) => (
                <div key={text.id} className="space-y-2">
                  <Label className="text-sm">{text.label}</Label>
                  <Input
                    value={text.value}
                    onChange={(e) => handleTextChange(text.id, e.target.value)}
                    className="bg-[#0B0D11] border-[rgba(217,222,231,0.08)]"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-6">
          <Card variant="obsidian">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Image className="h-5 w-5 text-primary" />
                Brand Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {['Logo', 'Welcome Background', 'Member Card Background'].map((asset) => (
                <div key={asset} className="space-y-2">
                  <Label className="text-sm">{asset}</Label>
                  <div className="flex gap-3">
                    <div className="flex-1 h-32 rounded-lg bg-[#0B0D11] border border-dashed border-[rgba(217,222,231,0.2)] flex items-center justify-center">
                      <div className="text-center">
                        <Image className="h-8 w-8 mx-auto text-muted-foreground/40" />
                        <p className="text-xs text-muted-foreground/60 mt-2">Drop image or click to upload</p>
                      </div>
                    </div>
                    <Button variant="outline" className="self-end">
                      Upload
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card variant="obsidian">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                Platform Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Show Points on Member Card', description: 'Display points balance on the digital member card', enabled: true },
                { label: 'Enable Rewards Marketplace', description: 'Allow members to browse and redeem rewards', enabled: true },
                { label: 'Show Tier Progress', description: 'Display progress towards next tier', enabled: true },
                { label: 'Enable Event RSVPs', description: 'Allow members to RSVP for exclusive events', enabled: true },
              ].map((setting, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-[#0B0D11] border border-[rgba(217,222,231,0.08)]">
                  <div>
                    <p className="text-sm font-medium">{setting.label}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{setting.description}</p>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
