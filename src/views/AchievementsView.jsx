/**
 * AchievementsView.jsx — All achievements, filterable by category.
 * Shows unlocked/locked state, XP rewards, and progress hints.
 */

import { useState } from "react";
import { ACHIEVEMENT_DEFS, ACHIEVEMENT_CATEGORIES } from "../data/achievements.js";

export function AchievementsView({ unlocked, totalXP, level, levelPct }) {
  const [catFilter, setCatFilter] = useState("all");

  const shown = catFilter === "all"
    ? ACHIEVEMENT_DEFS
    : ACHIEVEMENT_DEFS.filter((a) => a.category === catFilter);

  const unlockedCount = ACHIEVEMENT_DEFS.filter((a) => unlocked.includes(a.id)).length;

  const S = {
    wrap: { padding: "32px 36px", minHeight: "100%", animation: "fadeUp 0.35s ease" },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 28,
      flexWrap: "wrap",
      gap: 16,
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 900, fontSize: 28,
      color: "#E8EEF8", letterSpacing: "-0.5px",
    },
    sub: { fontSize: 13, color: "#4A6080", marginTop: 4 },
    levelBadge: {
      background: "rgba(212,168,83,0.08)",
      border: "1px solid rgba(212,168,83,0.2)",
      borderRadius: 12,
      padding: "14px 20px",
      minWidth: 170,
    },
    cats: {
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      marginBottom: 24,
    },
    catBtn: (active) => ({
      padding: "7px 16px",
      borderRadius: 20,
      background: active ? "rgba(212,168,83,0.15)" : "#0A1320",
      border: active ? "1px solid rgba(212,168,83,0.4)" : "1px solid #1A2840",
      color: active ? "#D4A853" : "#4A6080",
      fontSize: 12,
      fontWeight: active ? 600 : 400,
    }),
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
      gap: 14,
    },
    card: (isUnlocked) => ({
      background: isUnlocked
        ? "linear-gradient(145deg, #0E2035, #0A1828)"
        : "#080D18",
      border: isUnlocked
        ? "1px solid rgba(212,168,83,0.3)"
        : "1px solid #121E30",
      borderRadius: 14,
      padding: "22px 18px",
      textAlign: "center",
      opacity: isUnlocked ? 1 : 0.55,
      filter: isUnlocked ? "none" : "grayscale(0.4)",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s",
    }),
    glow: {
      position: "absolute", inset: 0,
      background: "radial-gradient(circle at 50% 0%, rgba(212,168,83,0.08) 0%, transparent 70%)",
      pointerEvents: "none",
    },
    icon: { fontSize: 40, marginBottom: 10 },
    achTitle: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700, fontSize: 14,
      color: "#C8D8EC", marginBottom: 6,
    },
    achDesc: { fontSize: 11, color: "#3A5070", lineHeight: 1.5, marginBottom: 10 },
    xpBadge: (isUnlocked) => ({
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: 12,
      background: isUnlocked ? "rgba(212,168,83,0.15)" : "#0A1320",
      border: isUnlocked ? "1px solid rgba(212,168,83,0.3)" : "1px solid #1A2840",
      fontSize: 12,
      fontWeight: 600,
      color: isUnlocked ? "#D4A853" : "#2A4060",
    }),
    unlockedStamp: {
      position: "absolute",
      top: 10, right: 10,
      fontSize: 10,
      color: "#52C97A",
      fontWeight: 600,
      letterSpacing: "0.5px",
    },
  };

  return (
    <div style={S.wrap}>
      {/* Header */}
      <div style={S.headerRow}>
        <div>
          <h1 style={S.title}>Achievements 🏆</h1>
          <p style={S.sub}>{unlockedCount} / {ACHIEVEMENT_DEFS.length} unlocked</p>
        </div>
        <div style={S.levelBadge}>
          <div style={{ fontSize: 11, color: "#4A6080", marginBottom: 6 }}>PILOT RANK</div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700, fontSize: 20, color: "#D4A853", marginBottom: 8,
          }}>
            Level {level}
          </div>
          <div style={{ height: 3, background: "#0E1828", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${levelPct * 100}%`,
              background: "linear-gradient(90deg, #A07830, #D4A853)",
            }} />
          </div>
          <div style={{ fontSize: 10, color: "#2A4060", marginTop: 5 }}>
            {totalXP.toLocaleString()} XP total
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div style={S.cats}>
        {ACHIEVEMENT_CATEGORIES.map((c) => (
          <button
            key={c.id}
            style={S.catBtn(catFilter === c.id)}
            onClick={() => setCatFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Achievement grid */}
      <div style={S.grid}>
        {shown.map((ach) => {
          const isUnlocked = unlocked.includes(ach.id);
          return (
            <div key={ach.id} style={S.card(isUnlocked)} className={isUnlocked ? "animate-fadeUp" : ""}>
              {isUnlocked && <div style={S.glow} />}
              {isUnlocked && <div style={S.unlockedStamp}>✓ EARNED</div>}
              <div style={S.icon}>{isUnlocked ? ach.icon : "🔒"}</div>
              <div style={S.achTitle}>{ach.title}</div>
              <div style={S.achDesc}>
                {isUnlocked ? ach.desc : "Complete more sessions to reveal this achievement"}
              </div>
              <span style={S.xpBadge(isUnlocked)}>
                {ach.xp > 0 ? `+${ach.xp} XP` : isUnlocked ? "✓ Unlocked" : "Hidden"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
