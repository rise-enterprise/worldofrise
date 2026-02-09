import { Crown, ShieldCheck, Users } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  description: string;
}

export interface NavSection {
  id: string;
  label: string;
  icon: typeof Crown;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "loyalty",
    label: "Loyalty Program",
    icon: Crown,
    items: [
      { id: "loyalty-members", label: "Members Management", description: "Search, view, and manage loyalty program members. View profiles, adjust points, change tiers, and manage VIP status." },
      { id: "loyalty-points", label: "Points Engine", description: "Configure earning rules, bonus multipliers, double-points days, expiration policies, and review manual adjustments." },
      { id: "loyalty-rewards", label: "Rewards Control", description: "Create and manage rewards including free items, discounts, and exclusive access with branch-specific assignments." },
      { id: "loyalty-tiers", label: "Tiers System", description: "Define tier hierarchy, upgrade thresholds, benefits, and points multipliers for each loyalty level." },
      { id: "loyalty-campaigns", label: "Campaigns & Automations", description: "Create targeted campaigns and configure auto-triggers for welcome bonuses, birthdays, and reactivation." },
      { id: "loyalty-segmentation", label: "Customer Segmentation", description: "Build customer segments by spend, visits, tier, and location for targeted campaign delivery." },
      { id: "loyalty-analytics", label: "Loyalty Analytics", description: "Track member growth, redemption rates, top spenders, ROI per reward, and tier distribution." },
      { id: "loyalty-digital-card", label: "Digital Card Control", description: "Customize QR membership cards, Apple/Google Wallet passes, RFID linking, and card design." },
      { id: "loyalty-multi-brand", label: "Multi-Brand Control", description: "Manage shared vs independent points systems across NOIR and SASSO brands with tier mapping." },
      { id: "loyalty-settings", label: "Global Settings", description: "Configure points-to-currency conversion, expiration policies, default thresholds, and regional settings." },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    icon: Users,
    items: [
      { id: "crm-contacts", label: "Contacts Database", description: "Browse, search, filter, and export the full contacts database for NOIR and SASSO." },
      { id: "crm-import", label: "Import / Replace", description: "Upload a CSV or XLSX file to replace all existing contact records with a new dataset." },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    icon: ShieldCheck,
    items: [
      { id: "admin-users", label: "Admin Users", description: "Invite, edit, deactivate, and delete admin accounts. Assign roles (Super Admin, Admin, Manager, Viewer) and manage access." },
      { id: "admin-invitations", label: "Invitation Requests", description: "Review, approve, or reject membership applications. Manage rejected requests and reconsider applicants." },
    ],
  },
];