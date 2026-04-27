/**
 * Overlays.jsx — Toast notifications and Achievement unlock overlay
 */

/** Toast notification stack (bottom-right) */
export function ToastStack({ toasts }) {
  const typeStyle = {
    info:        { border: "#4A90D9", icon: "ℹ️" },
    success:     { border: "#52C97A", icon: "✅" },
    warning:     { border: "#F0A030", icon: "⚠️" },
    achievement: { border: "#D4A853", icon: "🏆" },
  };

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      zIndex: 9000,
      maxWidth: 320,
    }}>
      {toasts.map((t) => {
        const ts = typeStyle[t.type] || typeStyle.info;
        return (
          <div key={t.id} className="animate-slideRight" style={{
            background: "linear-gradient(135deg, #0E1828, #0C1420)",
            border: "1px solid #1E2E4A",
            borderLeft: `3px solid ${ts.border}`,
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 13,
            color: "#C8D8EC",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>{ts.icon}</span>
            {t.message}
          </div>
        );
      })}
    </div>
  );
}

/** Full-screen achievement unlock overlay */
export function AchievementOverlay({ achievement }) {
  if (!achievement) return null;
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 8000,
      pointerEvents: "none",
    }}>
      <div className="animate-popIn" style={{
        background: "linear-gradient(145deg, #0E1F38, #0A1628)",
        border: "1px solid rgba(212,168,83,0.5)",
        borderRadius: 20,
        padding: "48px 56px",
        textAlign: "center",
        boxShadow: "0 0 80px rgba(212,168,83,0.25), 0 32px 80px rgba(0,0,0,0.6)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow bg */}
        <div style={{
          position: "absolute", inset: -60,
          background: "radial-gradient(circle at 50% 50%, rgba(212,168,83,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ fontSize: 72, marginBottom: 16, position: "relative" }}>
          {achievement.icon}
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "3px",
          color: "#D4A853", textTransform: "uppercase", marginBottom: 10,
        }}>
          Achievement Unlocked
        </div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700, fontSize: 26,
          color: "#E8EEF8", marginBottom: 8,
        }}>
          {achievement.title}
        </div>
        <div style={{ fontSize: 14, color: "#6A8AA8", marginBottom: 20 }}>
          {achievement.desc}
        </div>
        {achievement.xp > 0 && (
          <div style={{
            display: "inline-block",
            background: "rgba(212,168,83,0.15)",
            border: "1px solid rgba(212,168,83,0.3)",
            borderRadius: 20,
            padding: "6px 20px",
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700, fontSize: 18,
            color: "#D4A853",
          }}>
            +{achievement.xp} XP
          </div>
        )}
      </div>
    </div>
  );
}

/** Floating XP gain animation */
export function XPFloater({ xpAnimation }) {
  if (!xpAnimation) return null;
  return (
    <div key={xpAnimation.id} style={{
      position: "fixed",
      top: "40%",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 7000,
      pointerEvents: "none",
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      fontSize: 32,
      color: "#D4A853",
      textShadow: "0 0 20px rgba(212,168,83,0.8)",
      animation: "xpFloat 2s ease-out forwards",
    }}>
      +{xpAnimation.amount} XP
    </div>
  );
}
