/**
 * HomeView.jsx — Main dashboard
 * Shows: greeting, today's stats, XP chart, streak, recent sessions, quick-start CTA.
 */

import { formatMinutes, getGreeting } from "../utils/utils.js";

export function HomeView({
  sessions, totalXP, totalSessions, totalMinutes,
  todayMinutes, todaySessions, currentStreak, level, levelPct,
  setActiveView, activeSession,
}) {
  const todayCount = todaySessions.length;

  // Build 14-day chart
  const chartDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const ds = d.toISOString().split("T")[0];
    const mins = sessions
      .filter((s) => s.date === ds && s.completed)
      .reduce((sum, s) => sum + s.duration, 0);
    return { ds, mins, day: ["S","M","T","W","T","F","S"][d.getDay()] };
  });
  const maxMins = Math.max(...chartDays.map((d) => d.mins), 1);

  const today = new Date().toISOString().split("T")[0];

  const S = {
    wrap: { padding: "32px 36px", minHeight: "100%", animation: "fadeUp 0.35s ease" },
    greeting: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 900,
      fontSize: 28,
      color: "#E8EEF8",
      marginBottom: 4,
      letterSpacing: "-0.5px",
    },
    sub: { fontSize: 13, color: "#4A6080", marginBottom: 32 },
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 28,
      flexWrap: "wrap",
      gap: 16,
    },
    startBtn: {
      padding: "14px 30px",
      borderRadius: 12,
      background: "linear-gradient(135deg, #8A6020, #D4A853, #F0C060)",
      color: "#0A1020",
      fontSize: 15,
      fontWeight: 700,
      boxShadow: "0 6px 24px rgba(212,168,83,0.35)",
      letterSpacing: "0.3px",
      animation: "goldPulse 2.5s ease-in-out infinite",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 14,
      marginBottom: 20,
    },
    card: {
      background: "linear-gradient(135deg, #0D1828, #0A1320)",
      border: "1px solid #1A2840",
      borderRadius: 14,
      padding: "20px",
    },
    chartCard: {
      background: "linear-gradient(135deg, #0D1828, #0A1320)",
      border: "1px solid #1A2840",
      borderRadius: 14,
      padding: "22px",
      marginBottom: 20,
    },
    chartRow: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: 16,
      marginBottom: 20,
    },
    sectionTitle: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 600,
      fontSize: 14,
      color: "#8A9BB8",
      marginBottom: 18,
      letterSpacing: "0.3px",
    },
    barArea: {
      display: "flex",
      alignItems: "flex-end",
      gap: 5,
      height: 80,
      marginTop: 8,
    },
    recentCard: {
      background: "linear-gradient(135deg, #0D1828, #0A1320)",
      border: "1px solid #1A2840",
      borderRadius: 14,
      padding: "22px",
    },
    viewAll: {
      background: "transparent",
      border: "1px solid #1A2840",
      color: "#4A90D9",
      borderRadius: 8,
      padding: "6px 14px",
      fontSize: 12,
    },
    sessionRow: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 0",
      borderBottom: "1px solid #0E1825",
    },
    emptyText: {
      fontSize: 13,
      color: "#2A4060",
      textAlign: "center",
      padding: "24px 0",
    },
  };

  const recentSessions = [...sessions].filter((s) => s.completed).slice(-5).reverse();

  return (
    <div style={S.wrap}>
      {/* Header row */}
      <div style={S.topRow}>
        <div>
          <h1 style={S.greeting}>{getGreeting()} 👋</h1>
          <p style={S.sub}>
            {activeSession ? "Session in progress — stay focused! 🎯" : "Ready for your next flight?"}
          </p>
        </div>
        <button style={S.startBtn} onClick={() => setActiveView("focus")}>
          {activeSession ? "▶ Resume Session" : "🛫 Start Session"}
        </button>
      </div>

      {/* Stats grid */}
      <div style={S.statsGrid}>
        <StatCard icon="⏱️" label="Today's Focus" value={formatMinutes(todayMinutes)} color="#4A90D9" />
        <StatCard icon="✈️" label="Today's Flights" value={todayCount} color="#52C97A" />
        <StatCard icon="🔥" label="Day Streak" value={`${currentStreak}d`} color="#F0A030" />
        <StatCard icon="⭐" label="Total XP" value={totalXP.toLocaleString()} color="#D4A853" />
      </div>

      {/* Charts row */}
      <div style={S.chartRow}>
        {/* Bar chart */}
        <div style={S.chartCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={S.sectionTitle}>Focus Activity — Last 14 Days</span>
            <span style={{ fontSize: 12, color: "#2A4060" }}>minutes / day</span>
          </div>
          <div style={S.barArea}>
            {chartDays.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div style={{
                    width: "100%",
                    height: `${Math.max((d.mins / maxMins) * 100, d.mins > 0 ? 5 : 0)}%`,
                    borderRadius: "3px 3px 0 0",
                    background: d.ds === today
                      ? "linear-gradient(to top, #A07830, #D4A853)"
                      : d.mins > 0
                        ? "linear-gradient(to top, #1E3A5A, #2A5080)"
                        : "transparent",
                    transition: "height 0.5s ease",
                    minHeight: d.mins > 0 ? 3 : 0,
                  }} />
                </div>
                <span style={{ fontSize: 8, color: d.ds === today ? "#D4A853" : "#2A4060" }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Streak/Level card */}
        <div style={S.chartCard}>
          <span style={S.sectionTitle}>Your Journey</span>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{
              fontSize: 52,
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              color: "#D4A853",
              lineHeight: 1,
              marginBottom: 4,
            }}>
              {currentStreak}
            </div>
            <div style={{ fontSize: 12, color: "#4A6080", marginBottom: 20 }}>day streak 🔥</div>
            <div style={{ fontSize: 13, color: "#6A8AA8", marginBottom: 8 }}>
              Level {level} Pilot
            </div>
            <div style={{ height: 4, background: "#0E1828", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${levelPct * 100}%`,
                background: "linear-gradient(90deg, #A07830, #D4A853)",
                transition: "width 0.6s ease",
              }} />
            </div>
            <div style={{ fontSize: 11, color: "#2A4060", marginTop: 6 }}>
              {Math.round((1 - levelPct) * 500)} XP to lv {level + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Recent sessions */}
      <div style={S.recentCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={S.sectionTitle}>Recent Flights</span>
          <button style={S.viewAll} onClick={() => setActiveView("history")}>View log →</button>
        </div>
        {recentSessions.length === 0 && (
          <p style={S.emptyText}>No flights yet. Start your first session! ✈️</p>
        )}
        {recentSessions.map((s) => (
          <SessionRowMini key={s.id} session={s} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0D1828, #0A1320)",
      border: "1px solid #1A2840",
      borderRadius: 14,
      padding: "18px 20px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700,
        fontSize: 22,
        color,
        marginBottom: 4,
      }}>{value}</div>
      <div style={{ fontSize: 11, color: "#3A5070", letterSpacing: "0.3px" }}>{label}</div>
    </div>
  );
}

function SessionRowMini({ session }) {
  const classColors = { economy: "#4A90D9", business: "#F0C060", first: "#CE93D8", private: "#52C97A" };
  const color = classColors[session.flightClass] || "#4A90D9";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 0", borderBottom: "1px solid #0E1825",
    }}>
      <span style={{ fontSize: 18 }}>✈️</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: "#C8D8EC" }}>
          {session.from} → {session.to}
        </div>
        <div style={{ fontSize: 11, color: "#3A5070" }}>
          {new Date(session.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 13, color, fontWeight: 600 }}>{session.duration}m</div>
        <div style={{ fontSize: 11, color: "#D4A853" }}>+{Math.round(session.xpEarned)} XP</div>
      </div>
    </div>
  );
}
