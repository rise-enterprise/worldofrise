import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Smartphone, CreditCard, Palette, Save, Crown } from "lucide-react";
import { toast } from "sonner";

export default function LoyaltyDigitalCard() {
  const [appleWallet, setAppleWallet] = useState(true);
  const [googleWallet, setGoogleWallet] = useState(true);
  const [rfidEnabled, setRfidEnabled] = useState(false);
  const [cardColor, setCardColor] = useState("#07080A");
  const [accentColor, setAccentColor] = useState("#D4A843");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold tracking-tight">Digital Card Control</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize digital membership cards, QR codes, and wallet passes</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Card Preview */}
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-widest">Card Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div
              className="w-80 h-48 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl"
              style={{ backgroundColor: cardColor }}
            >
              {/* Accent border */}
              <div className="absolute inset-0 rounded-2xl border-2 pointer-events-none" style={{ borderColor: accentColor + "40" }} />
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: accentColor, filter: "blur(40px)" }} />

              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] opacity-60" style={{ color: accentColor }}>RISE Loyalty</p>
                  <p className="font-serif text-lg font-bold mt-0.5" style={{ color: "#fff" }}>NOIR × SASSO</p>
                </div>
                <Crown className="h-6 w-6" style={{ color: accentColor }} />
              </div>
              <div className="flex items-end justify-between relative z-10">
                <div>
                  <p className="text-xs opacity-50 text-white">Member</p>
                  <p className="text-sm font-medium text-white">Khalid Al-Rashid</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-black" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Design */}
        <Card className="bg-card border-border/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" /> Card Design
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Background Color</Label>
              <div className="flex gap-2">
                <Input value={cardColor} onChange={(e) => setCardColor(e.target.value)} className="bg-muted/30 border-border/40" />
                <div className="w-10 h-10 rounded-md shrink-0 border border-border/30" style={{ backgroundColor: cardColor }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Accent Color</Label>
              <div className="flex gap-2">
                <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="bg-muted/30 border-border/40" />
                <div className="w-10 h-10 rounded-md shrink-0 border border-border/30" style={{ backgroundColor: accentColor }} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tier Badge Position</Label>
              <Select defaultValue="top-right">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full gap-2 bg-primary text-primary-foreground" onClick={() => toast.success("Card design saved")}>
              <Save className="h-4 w-4" /> Save Design
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Wallet & RFID */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-card border-border/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Apple Wallet</p>
                  <p className="text-xs text-muted-foreground">iOS pass integration</p>
                </div>
              </div>
              <Switch checked={appleWallet} onCheckedChange={setAppleWallet} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Google Wallet</p>
                  <p className="text-xs text-muted-foreground">Android pass integration</p>
                </div>
              </div>
              <Switch checked={googleWallet} onCheckedChange={setGoogleWallet} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">RFID Linking</p>
                  <p className="text-xs text-muted-foreground">Physical card support</p>
                </div>
              </div>
              <Switch checked={rfidEnabled} onCheckedChange={setRfidEnabled} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
