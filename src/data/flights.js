/**
 * flights.js — Flight route database
 * Maps session durations to real-world flight routes.
 * Also defines flight classes, XP multipliers, and city data.
 */

/** Real-world flight routes keyed by approximate duration in minutes */
export const FLIGHT_ROUTES = [
  { duration: 15,  from: "New York",      to: "Boston",         distance: 215,   emoji: "🗽→🦞" },
  { duration: 20,  from: "Los Angeles",   to: "Las Vegas",      distance: 230,   emoji: "🌴→🎰" },
  { duration: 25,  from: "London",        to: "Paris",          distance: 345,   emoji: "🎡→🗼" },
  { duration: 30,  from: "Chicago",       to: "Detroit",        distance: 240,   emoji: "🌆→🚗" },
  { duration: 45,  from: "Amsterdam",     to: "Berlin",         distance: 580,   emoji: "🌷→🐻" },
  { duration: 60,  from: "Miami",         to: "Atlanta",        distance: 662,   emoji: "🌊→🍑" },
  { duration: 75,  from: "Madrid",        to: "Rome",           distance: 1365,  emoji: "💃→🍕" },
  { duration: 90,  from: "New York",      to: "Chicago",        distance: 1190,  emoji: "🗽→🌆" },
  { duration: 120, from: "London",        to: "Istanbul",       distance: 2500,  emoji: "🎡→🕌" },
  { duration: 150, from: "Dubai",         to: "Mumbai",         distance: 1960,  emoji: "🌆→🕌" },
  { duration: 180, from: "New York",      to: "London",         distance: 5570,  emoji: "🗽→🎡" },
  { duration: 240, from: "Los Angeles",   to: "New York",       distance: 2445,  emoji: "🌴→🗽" },
  { duration: 300, from: "London",        to: "Dubai",          distance: 5480,  emoji: "🎡→🌆" },
  { duration: 360, from: "Paris",         to: "Singapore",      distance: 10720, emoji: "🗼→🦁" },
  { duration: 480, from: "Los Angeles",   to: "Tokyo",          distance: 8820,  emoji: "🌴→⛩️" },
  { duration: 600, from: "New York",      to: "Sydney",         distance: 16230, emoji: "🗽→🦘" },
];

/** Get best matching route for a given duration (minutes) */
export const getRouteForDuration = (minutes) => {
  const sorted = [...FLIGHT_ROUTES].sort((a, b) =>
    Math.abs(a.duration - minutes) - Math.abs(b.duration - minutes)
  );
  return sorted[0] || FLIGHT_ROUTES[0];
};

/** All available cities for custom route selection */
export const CITIES = [
  "Amsterdam", "Atlanta", "Bangkok", "Barcelona", "Beijing", "Berlin",
  "Boston", "Buenos Aires", "Cairo", "Cape Town", "Chicago", "Delhi",
  "Dubai", "Frankfurt", "Hong Kong", "Istanbul", "Jakarta", "Johannesburg",
  "Kuala Lumpur", "Lagos", "Las Vegas", "Lima", "Lisbon", "London",
  "Los Angeles", "Madrid", "Melbourne", "Mexico City", "Miami", "Milan",
  "Moscow", "Mumbai", "Munich", "Nairobi", "New York", "Osaka",
  "Paris", "Rome", "San Francisco", "São Paulo", "Seoul", "Shanghai",
  "Singapore", "Sydney", "Tokyo", "Toronto", "Vienna", "Warsaw", "Zurich",
];

/** Flight classes with XP multipliers and perks */
export const FLIGHT_CLASSES = [
  {
    id: "economy",
    label: "Economy",
    emoji: "🪑",
    multiplier: 1.0,
    color: "#64B5F6",
    desc: "Standard focus session",
    unlockXP: 0,
  },
  {
    id: "business",
    label: "Business",
    emoji: "💼",
    multiplier: 1.5,
    color: "#FFD54F",
    desc: "1.5× XP — unlock at 500 XP",
    unlockXP: 500,
  },
  {
    id: "first",
    label: "First Class",
    emoji: "👑",
    multiplier: 2.0,
    color: "#CE93D8",
    desc: "2× XP — unlock at 1500 XP",
    unlockXP: 1500,
  },
  {
    id: "private",
    label: "Private Jet",
    emoji: "✈️",
    multiplier: 3.0,
    color: "#A5D6A7",
    desc: "3× XP — unlock at 5000 XP",
    unlockXP: 5000,
  },
];

/** Focus mode definitions */
export const FOCUS_MODES = [
  {
    id: "warning",
    label: "Warning Only",
    emoji: "⚠️",
    color: "#FFB74D",
    desc: "Shows alerts for distractions without blocking",
  },
  {
    id: "partial",
    label: "Partial Block",
    emoji: "🔕",
    color: "#EF9A9A",
    desc: "Blocks specific notifications and sites",
  },
  {
    id: "full",
    label: "Full Block",
    emoji: "🔒",
    color: "#EF5350",
    desc: "Strict mode — all distractions blocked",
  },
];

/** XP earned per minute of focus (base rate) */
export const XP_PER_MINUTE = 2;

/** Calculate XP for a session */
export const calcSessionXP = (durationMinutes, flightClass, bonusMultiplier = 1) => {
  const cls = FLIGHT_CLASSES.find((c) => c.id === flightClass) || FLIGHT_CLASSES[0];
  return Math.round(durationMinutes * XP_PER_MINUTE * cls.multiplier * bonusMultiplier);
};
