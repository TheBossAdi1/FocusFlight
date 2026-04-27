/**
 * achievements.js — All achievement definitions for FocusFlight
 * Each achievement has: id, title, desc, icon, xp, category, condition fn
 */

export const ACHIEVEMENT_DEFS = [
  // ── Flight Count ─────────────────────────────
  {
    id: "first_flight",
    title: "First Flight",
    desc: "Complete your very first focus session",
    icon: "🛫",
    xp: 50,
    category: "flights",
    condition: (s) => s.totalSessions >= 1,
  },
  {
    id: "frequent_flyer",
    title: "Frequent Flyer",
    desc: "Complete 10 focus sessions",
    icon: "🎫",
    xp: 150,
    category: "flights",
    condition: (s) => s.totalSessions >= 10,
  },
  {
    id: "sky_captain",
    title: "Sky Captain",
    desc: "Complete 25 focus sessions",
    icon: "🧑‍✈️",
    xp: 300,
    category: "flights",
    condition: (s) => s.totalSessions >= 25,
  },
  {
    id: "airline_veteran",
    title: "Airline Veteran",
    desc: "Complete 50 focus sessions",
    icon: "🏅",
    xp: 500,
    category: "flights",
    condition: (s) => s.totalSessions >= 50,
  },

  // ── Duration / Distance ───────────────────────
  {
    id: "short_hop",
    title: "Short Hop",
    desc: "Focus for 60 total minutes",
    icon: "⛽",
    xp: 100,
    category: "distance",
    condition: (s) => s.totalMinutes >= 60,
  },
  {
    id: "cross_country",
    title: "Cross Country",
    desc: "Focus for 5 total hours",
    icon: "🗺️",
    xp: 250,
    category: "distance",
    condition: (s) => s.totalMinutes >= 300,
  },
  {
    id: "transatlantic",
    title: "Transatlantic",
    desc: "Focus for 24 total hours",
    icon: "🌊",
    xp: 600,
    category: "distance",
    condition: (s) => s.totalMinutes >= 1440,
  },
  {
    id: "around_the_world",
    title: "Around the World",
    desc: "Focus for 100 total hours",
    icon: "🌍",
    xp: 2000,
    category: "distance",
    condition: (s) => s.totalMinutes >= 6000,
  },

  // ── Streaks ──────────────────────────────────
  {
    id: "on_a_roll",
    title: "On a Roll",
    desc: "Maintain a 3-day focus streak",
    icon: "🔥",
    xp: 150,
    category: "streaks",
    condition: (s) => s.currentStreak >= 3,
  },
  {
    id: "iron_will",
    title: "Iron Will",
    desc: "Maintain a 7-day focus streak",
    icon: "⚡",
    xp: 350,
    category: "streaks",
    condition: (s) => s.currentStreak >= 7,
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    desc: "Maintain a 30-day focus streak",
    icon: "💥",
    xp: 1500,
    category: "streaks",
    condition: (s) => s.currentStreak >= 30,
  },

  // ── Flight Classes ───────────────────────────
  {
    id: "upgrade_business",
    title: "Business Class",
    desc: "Unlock Business Class by reaching 500 XP",
    icon: "💼",
    xp: 0,
    category: "class",
    condition: (s) => s.totalXP >= 500,
  },
  {
    id: "upgrade_first",
    title: "First Class",
    desc: "Unlock First Class by reaching 1500 XP",
    icon: "👑",
    xp: 0,
    category: "class",
    condition: (s) => s.totalXP >= 1500,
  },
  {
    id: "upgrade_private",
    title: "Private Jet",
    desc: "Unlock Private Jet by reaching 5000 XP",
    icon: "✈️",
    xp: 0,
    category: "class",
    condition: (s) => s.totalXP >= 5000,
  },

  // ── XP Milestones ────────────────────────────
  {
    id: "xp_500",
    title: "High Flyer",
    desc: "Accumulate 500 XP",
    icon: "⭐",
    xp: 0,
    category: "xp",
    condition: (s) => s.totalXP >= 500,
  },
  {
    id: "xp_2000",
    title: "Jet Setter",
    desc: "Accumulate 2000 XP",
    icon: "🌟",
    xp: 0,
    category: "xp",
    condition: (s) => s.totalXP >= 2000,
  },
  {
    id: "xp_10000",
    title: "Legendary Pilot",
    desc: "Accumulate 10,000 XP",
    icon: "🏆",
    xp: 0,
    category: "xp",
    condition: (s) => s.totalXP >= 10000,
  },

  // ── Special ──────────────────────────────────
  {
    id: "long_haul",
    title: "Long Haul",
    desc: "Complete a session of 2 hours or more",
    icon: "🛬",
    xp: 200,
    category: "special",
    condition: (s) => s.longestSession >= 120,
  },
  {
    id: "early_bird",
    title: "Early Bird",
    desc: "Complete a session before 8 AM",
    icon: "🌅",
    xp: 100,
    category: "special",
    condition: (s) => s.earlyBird,
  },
  {
    id: "night_owl",
    title: "Night Owl",
    desc: "Complete a session after 10 PM",
    icon: "🦉",
    xp: 100,
    category: "special",
    condition: (s) => s.nightOwl,
  },
];

export const ACHIEVEMENT_CATEGORIES = [
  { id: "all",      label: "All"       },
  { id: "flights",  label: "Flights"   },
  { id: "distance", label: "Distance"  },
  { id: "streaks",  label: "Streaks"   },
  { id: "class",    label: "Classes"   },
  { id: "xp",       label: "XP"        },
  { id: "special",  label: "Special"   },
];
