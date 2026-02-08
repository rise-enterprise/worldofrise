import {
  Map, Users, Globe, Settings, Plug, Clock, Layout, ShoppingBag, Crown,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  description: string;
}

export interface NavSection {
  id: string;
  label: string;
  icon: typeof Map;
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
    id: "floorplan",
    label: "Floorplan",
    icon: Map,
    items: [
      { id: "floorplan-layouts", label: "Floorplan Layouts", description: "Design and manage visual floor layouts for each venue, including drag-and-drop table placement and zone configuration." },
      { id: "floorplan-rooms", label: "Rooms", description: "Define named rooms or areas within your venue to organize seating and reservations by physical space." },
      { id: "floorplan-seating-areas", label: "Seating Areas", description: "Create and manage seating zones such as patio, main dining, private rooms, and bar areas." },
      { id: "floorplan-tables", label: "Tables", description: "Configure individual tables with capacity, shape, and assignment rules for each seating area." },
      { id: "floorplan-combinations", label: "Table Combinations", description: "Set up combinable tables for larger parties with automatic merging and splitting rules." },
      { id: "floorplan-statuses", label: "Reservation Statuses", description: "Customize reservation status labels and colors (Confirmed, Seated, No Show, etc.) used across the platform." },
    ],
  },
  {
    id: "people",
    label: "People",
    icon: Users,
    items: [
      { id: "people-accounts", label: "User Accounts", description: "Manage staff accounts, roles, and permissions. Assign Super Admin, Manager, or Staff access levels." },
      { id: "people-booked-by", label: "Booked By Names", description: "Maintain a directory of concierge and booker names for attribution and reporting on reservations." },
      { id: "people-servers", label: "Server Names", description: "Manage server/waiter names for table assignments and service tracking across shifts." },
    ],
  },
  {
    id: "language",
    label: "Guest-Facing Language",
    icon: Globe,
    items: [
      { id: "language-widgets", label: "Widgets", description: "Customize text and labels displayed in guest-facing booking widgets, including headers, buttons, and confirmations." },
      { id: "language-pages", label: "Pages", description: "Edit content for public-facing web pages including landing pages, venue descriptions, and policy pages." },
      { id: "language-emails", label: "Emails", description: "Configure email templates for confirmations, reminders, cancellations, and marketing communications." },
      { id: "language-text", label: "Text Content", description: "Manage all guest-facing text strings in one place. Edit microcopy, labels, and UI text across the platform." },
      { id: "language-policies", label: "Policies", description: "Define and edit cancellation policies, dress codes, and other venue policies shown to guests." },
      { id: "language-settings", label: "Language Settings", description: "Configure supported languages, default locale, and translation management for bilingual content." },
    ],
  },
  {
    id: "general",
    label: "General",
    icon: Settings,
    items: [
      { id: "general-venue", label: "Venue Settings", description: "Core venue configuration including name, address, timezone, operating hours, and contact information." },
      { id: "general-client-tags", label: "Client Tags", description: "Create and manage guest tags for segmentation such as VIP, Allergies, Celebrations, and custom categories." },
      { id: "general-reservation-tags", label: "Reservation Tags", description: "Define tags that can be applied to reservations for tracking purposes like Birthday, Anniversary, or Business." },
      { id: "general-tax", label: "Tax Rates", description: "Configure tax rates and rules applied to orders, services, and billing across different jurisdictions." },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Plug,
    items: [
      { id: "integrations-payments", label: "Payment Processors", description: "Connect and configure payment gateways like Stripe, Square, or custom processors for seamless transactions." },
      { id: "integrations-email", label: "Email Service Providers", description: "Integrate with email platforms like SendGrid, Mailgun, or Resend for transactional and marketing emails." },
      { id: "integrations-pos", label: "Point of Sale", description: "Connect your POS system for real-time spend tracking, automatic visit logging, and guest profile enrichment." },
      { id: "integrations-messaging", label: "Messaging Providers", description: "Set up SMS and WhatsApp providers for reservation confirmations, reminders, and loyalty notifications." },
    ],
  },
  {
    id: "availability",
    label: "Availability",
    icon: Clock,
    items: [
      { id: "availability-shifts", label: "Shifts", description: "Define service periods (Lunch, Dinner, Brunch) with start/end times, covers limits, and pacing rules." },
      { id: "availability-access-rules", label: "Access Rules", description: "Set booking rules per shift including lead time, party size limits, duration, and channel restrictions." },
      { id: "availability-daily", label: "Daily Program", description: "View and override the daily availability calendar. Manage special events and capacity adjustments day-by-day." },
      { id: "availability-blackout", label: "Blackout Dates", description: "Block specific dates from online booking for private events, holidays, or maintenance periods." },
      { id: "availability-quick-view", label: "Availability Quick View", description: "At-a-glance dashboard showing open slots, utilization rates, and booking pressure across upcoming dates." },
      { id: "availability-reporting", label: "Shift Reporting Periods", description: "Configure reporting windows that align with your operational shifts for analytics and revenue tracking." },
    ],
  },
  {
    id: "widgets",
    label: "Widget Settings",
    icon: Layout,
    items: [
      { id: "widgets-reservation", label: "Reservation Widget", description: "Customize the look, feel, and behavior of the embedded reservation booking widget on your website." },
      { id: "widgets-event", label: "Event Widget", description: "Configure the events listing and ticketing widget including layout, filters, and checkout flow." },
      { id: "widgets-waitlist", label: "Waitlist Widget", description: "Set up the digital waitlist widget with estimated wait times, SMS notifications, and queue management." },
      { id: "widgets-subscription", label: "Subscription Widget", description: "Manage the newsletter and loyalty subscription widget for guest email/SMS capture." },
      { id: "widgets-landing", label: "Landing Page Settings", description: "Configure your venue's public landing page layout, hero images, featured sections, and CTAs." },
      { id: "widgets-audiences", label: "Custom Audiences", description: "Define audience segments for targeted widget display rules, personalized offers, and A/B testing." },
    ],
  },
  {
    id: "ordering",
    label: "Ordering",
    icon: ShoppingBag,
    items: [
      { id: "ordering-sites", label: "Ordering Sites", description: "Manage online ordering storefronts including delivery zones, pickup options, and operating hours." },
      { id: "ordering-menus", label: "Menu Management", description: "Create and edit digital menus with categories, items, modifiers, pricing, and availability schedules." },
      { id: "ordering-inventory", label: "Product Inventory", description: "Track stock levels, set low-inventory alerts, and manage product availability across ordering channels." },
    ],
  },
];
