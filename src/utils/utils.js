/**
 * utils.js — Shared utility functions for FocusFlight
 */

/** Format seconds → MM:SS */
export const formatTime = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

/** Format minutes → "2h 30m" or "45m" */
export const formatMinutes = (mins) => {
  if (!mins) return "0m";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

/** Format large numbers with commas */
export const formatNumber = (n) => (n || 0).toLocaleString();

/** Get today's date string YYYY-MM-DD */
export const todayStr = () => new Date().toISOString().split("T")[0];

/** Generate a short unique ID */
export const uid = () => Math.random().toString(36).slice(2, 9);

/** Get flight phase label based on 0–100 progress */
export const getFlightPhaseLabel = (pct) => {
  if (pct < 5)  return { label: "Pre-flight checks",  emoji: "🔧" };
  if (pct < 15) return { label: "Taxiing",             emoji: "🚕" };
  if (pct < 25) return { label: "Takeoff!",            emoji: "🛫" };
  if (pct < 50) return { label: "Climbing",            emoji: "📈" };
  if (pct < 70) return { label: "Cruising at altitude",emoji: "✈️" };
  if (pct < 85) return { label: "Beginning descent",   emoji: "📉" };
  if (pct < 95) return { label: "Approach & Landing",  emoji: "🛬" };
  return { label: "Arrived! 🎉",                        emoji: "🏁" };
};

/** Compute streak from array of session date strings */
export const computeStreak = (sessions) => {
  const dates = [...new Set(
    sessions.filter((s) => s.completed).map((s) => s.date)
  )].sort().reverse();

  if (!dates.length) return 0;
  let streak = 0;
  const check = new Date();
  for (let i = 0; i < 60; i++) {
    const ds = check.toISOString().split("T")[0];
    if (dates.includes(ds)) {
      streak++;
    } else if (i > 0) break;
    check.setDate(check.getDate() - 1);
  }
  return streak;
};

/** XP to level calculation (level = floor(xp / 500) + 1) */
export const XP_PER_LEVEL = 500;
export const calcLevel = (xp) => Math.floor((xp || 0) / XP_PER_LEVEL) + 1;
export const calcLevelProgress = (xp) => ((xp || 0) % XP_PER_LEVEL) / XP_PER_LEVEL;

/** Get greeting based on time of day */
export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return "Up late, Pilot?";
  if (h < 12) return "Good morning, Pilot";
  if (h < 17) return "Good afternoon, Pilot";
  if (h < 21) return "Good evening, Pilot";
  return "Burning the midnight oil?";
};

/** Generate realistic seed history data */
export const generateSeedHistory = () => {
  const sessions = [];
  const classes = ["economy", "economy", "economy", "business", "first"];
  const durations = [25, 30, 45, 60, 90, 120, 25, 45];

  for (let i = 20; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const numSessions = Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;
    for (let j = 0; j < numSessions; j++) {
      const dur = durations[Math.floor(Math.random() * durations.length)];
      const cls = classes[Math.floor(Math.random() * classes.length)];
      sessions.push({
        id: uid(),
        date: dateStr,
        duration: dur,
        flightClass: cls,
        from: "New York",
        to: "London",
        xpEarned: dur * 2 * (cls === "economy" ? 1 : cls === "business" ? 1.5 : 2),
        completed: true,
        focusMode: "warning",
      });
    }
  }
  return sessions;
};
