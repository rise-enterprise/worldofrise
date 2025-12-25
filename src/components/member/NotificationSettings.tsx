import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, Trophy, Gift } from "lucide-react";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";

interface NotificationSettingsProps {
  memberId: string;
}

export function NotificationSettings({ memberId }: NotificationSettingsProps) {
  const { t } = useTranslation();
  const { preferences, isLoading, updatePreferences, isUpdating } = useNotificationPreferences(memberId);

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const notificationOptions = [
    {
      key: "email_events",
      icon: Calendar,
      title: t("notifications.events", "Events & Announcements"),
      description: t("notifications.eventsDesc", "Get notified about new events at our venues"),
      value: preferences.email_events,
    },
    {
      key: "email_tier_upgrades",
      icon: Trophy,
      title: t("notifications.tierUpgrades", "Tier Upgrades"),
      description: t("notifications.tierUpgradesDesc", "Celebrate when you reach a new loyalty tier"),
      value: preferences.email_tier_upgrades,
    },
    {
      key: "email_promotions",
      icon: Gift,
      title: t("notifications.promotions", "Promotions & Offers"),
      description: t("notifications.promotionsDesc", "Receive special offers and promotions"),
      value: preferences.email_promotions,
    },
  ];

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-primary" />
          {t("notifications.title", "Email Notifications")}
        </CardTitle>
        <CardDescription>
          {t("notifications.description", "Choose which email notifications you'd like to receive")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notificationOptions.map((option) => (
          <div
            key={option.key}
            className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/30"
          >
            <div className="flex items-start gap-3">
              <option.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <Label htmlFor={option.key} className="text-sm font-medium cursor-pointer">
                  {option.title}
                </Label>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
            <Switch
              id={option.key}
              checked={option.value}
              disabled={isUpdating}
              onCheckedChange={(checked) => {
                updatePreferences({ [option.key]: checked });
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
