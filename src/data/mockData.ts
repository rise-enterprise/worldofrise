import { Guest, DashboardMetrics, Tier, Visit } from "@/types/loyalty";

const generateVisits = (count: number, favoriteBrand: "noir" | "sasso"): Visit[] => {
  const visits: Visit[] = [];
  const brands: ("noir" | "sasso")[] = ["noir", "sasso"];
  const countries: ("qatar" | "riyadh")[] = ["qatar", "riyadh"];

  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365));

    visits.push({
      id: `visit-${i}`,
      date,
      brand: Math.random() > 0.3 ? favoriteBrand : brands[Math.floor(Math.random() * brands.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      location: Math.random() > 0.5 ? "Doha" : "Riyadh",
    });
  }

  return visits.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const getTierFromVisits = (visits: number): Tier => {
  if (visits >= 50) return "black";
  if (visits >= 30) return "inner-circle";
  if (visits >= 15) return "elite";
  if (visits >= 5) return "connoisseur";
  return "initiation";
};

export const mockGuests: Guest[] = [
  {
    id: "1",
    name: "May Jenny",
    email: "sheikha@example.com",
    phone: "+974 5555 1234",
    country: "qatar",
    tier: "black",
    totalVisits: 67,
    lifetimeVisits: 67,
    lastVisit: new Date("2024-12-10"),
    joinedAt: new Date("2022-03-15"),
    favoriteBrand: "noir",
    visits: generateVisits(67, "noir"),
    tags: ["VIP", "Founder Guest", "Influencer"],
    notes: "Prefers corner table at NOIR. Always requests the seasonal tasting menu.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "2",
    name: "Ahmed bin Salman",
    email: "ahmed.s@example.com",
    phone: "+966 5555 5678",
    country: "riyadh",
    tier: "inner-circle",
    totalVisits: 42,
    lifetimeVisits: 42,
    lastVisit: new Date("2024-12-08"),
    joinedAt: new Date("2022-08-22"),
    favoriteBrand: "sasso",
    visits: generateVisits(42, "sasso"),
    tags: ["VIP", "Media"],
    notes: "Food critic. Appreciates attention to detail.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "3",
    name: "Fatima Al-Rashid",
    email: "fatima.r@example.com",
    phone: "+974 5555 9012",
    country: "qatar",
    tier: "elite",
    totalVisits: 23,
    lifetimeVisits: 23,
    lastVisit: new Date("2024-12-12"),
    joinedAt: new Date("2023-01-10"),
    favoriteBrand: "noir",
    visits: generateVisits(23, "noir"),
    tags: ["Regular"],
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "4",
    name: "Khalid Al-Saud",
    email: "khalid@example.com",
    phone: "+966 5555 3456",
    country: "riyadh",
    tier: "connoisseur",
    totalVisits: 12,
    lifetimeVisits: 12,
    lastVisit: new Date("2024-11-28"),
    joinedAt: new Date("2023-06-05"),
    favoriteBrand: "sasso",
    visits: generateVisits(12, "sasso"),
    tags: [],
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "5",
    name: "Nora Al-Farsi",
    email: "nora.f@example.com",
    phone: "+974 5555 7890",
    country: "qatar",
    tier: "initiation",
    totalVisits: 3,
    lifetimeVisits: 3,
    lastVisit: new Date("2024-12-01"),
    joinedAt: new Date("2024-10-15"),
    favoriteBrand: "noir",
    visits: generateVisits(3, "noir"),
    tags: ["New Member"],
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "6",
    name: "Sultan Al-Dosari",
    email: "sultan@example.com",
    country: "riyadh",
    tier: "inner-circle",
    totalVisits: 38,
    lifetimeVisits: 38,
    lastVisit: new Date("2024-12-11"),
    joinedAt: new Date("2022-11-03"),
    favoriteBrand: "noir",
    visits: generateVisits(38, "noir"),
    tags: ["VIP", "Corporate"],
    notes: "Hosts business dinners regularly.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "7",
    name: "Layla Hassan",
    email: "layla.h@example.com",
    country: "qatar",
    tier: "elite",
    totalVisits: 19,
    lifetimeVisits: 19,
    lastVisit: new Date("2024-12-05"),
    joinedAt: new Date("2023-04-20"),
    favoriteBrand: "sasso",
    visits: generateVisits(19, "sasso"),
    tags: ["Influencer"],
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "8",
    name: "Omar Al-Kuwari",
    email: "omar.k@example.com",
    country: "qatar",
    tier: "black",
    totalVisits: 55,
    lifetimeVisits: 55,
    lastVisit: new Date("2024-12-13"),
    joinedAt: new Date("2022-01-08"),
    favoriteBrand: "sasso",
    visits: generateVisits(55, "sasso"),
    tags: ["VIP", "Founder Guest"],
    notes: "Original member since launch. Prefers SASSO private dining.",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
  },
];

export const mockMetrics: DashboardMetrics = {
  totalMembers: 1247,
  activeMembers: 892,
  totalVisitsThisMonth: 3456,
  visitsByBrand: {
    noir: 1823,
    sasso: 1633,
  },
  visitsByCountry: {
    qatar: 2104,
    riyadh: 1352,
  },
  tierDistribution: {
    initiation: 487,
    connoisseur: 412,
    elite: 215,
    "inner-circle": 98,
    black: 35,
  },
  churnRiskCount: 67,
  vipGuestsCount: 35,
};
