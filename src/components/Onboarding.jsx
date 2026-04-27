/**
 * Onboarding.jsx — 5-step onboarding modal shown on first launch
 */

const STEPS = [
  {
    icon: "✈️",
    title: "Welcome to FocusFlight",
    body: "Turn every focus session into a virtual flight. The longer you focus, the farther you fly — earning XP and unlocking premium flight classes along the way.",
  },
  {
    icon: "⏱️",
    title: "Choose Your Flight",
    body: "Pick a focus duration — or select a real-world route. We'll match your session to an actual flight path. A 25-minute session? That's London to Paris!",
  },
  {
    icon: "🛡️",
    title: "Focus Mode Protection",
    body: "Choose how strict you want to be: Warning Only shows alerts, Partial Block filters distractions, and Full Block locks everything out for maximum focus.",
  },
  {
    icon: "🏆",
    title: "Earn XP & Achievements",
    body: "Completing sessions earns XP. Accumulate enough and you'll unlock Business, First Class, and Private Jet — each giving bigger XP multipliers.",
  },
  {
    icon: "🚀",
    title: "Ready for Takeoff?",
    body: "Your flight plan is set. Head to the Dashboard to see your stats, then hit Focus Flight to begin your first session. The sky is yours!",
  },
];

export function Onboarding({ step, setStep, onClose }) {
  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  const S = {
    overlay: {
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 10000,
    },
    modal: {
      background: "linear-gradient(145deg, #0C1A30, #080F1E)",
      border: "1px solid rgba(212,168,83,0.25)",
      borderRadius: 20,
      padding: "48px 52px",
      maxWidth: 500,
      width: "90%",
      textAlign: "center",
      boxShadow: "0 32px 100px rgba(0,0,0,0.7)",
      animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      position: "relative",
    },
    icon: {
      fontSize: 72,
      marginBottom: 24,
      display: "block",
      animation: "float 3s ease-in-out infinite",
    },
    title: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      fontSize: 24,
      color: "#E8EEF8",
      marginBottom: 14,
    },
    body: {
      fontSize: 15,
      color: "#6A8AA8",
      lineHeight: 1.7,
      marginBottom: 36,
      maxWidth: 380,
      margin: "0 auto 36px",
    },
    dots: {
      display: "flex",
      justifyContent: "center",
      gap: 8,
      marginBottom: 28,
    },
    dot: (active) => ({
      width: active ? 20 : 8,
      height: 8,
      borderRadius: 4,
      background: active ? "#D4A853" : "#1E2E4A",
      transition: "all 0.25s",
    }),
    btns: {
      display: "flex",
      gap: 10,
      justifyContent: "center",
    },
    primaryBtn: {
      padding: "12px 32px",
      borderRadius: 10,
      background: "linear-gradient(135deg, #A07830, #D4A853)",
      color: "#0A1020",
      fontSize: 14,
      fontWeight: 700,
      boxShadow: "0 4px 20px rgba(212,168,83,0.3)",
    },
    ghostBtn: {
      padding: "12px 24px",
      borderRadius: 10,
      background: "transparent",
      color: "#4A6080",
      fontSize: 14,
      border: "1px solid #1E2E4A",
    },
    skip: {
      position: "absolute",
      top: 16, right: 20,
      background: "transparent",
      color: "#3A5070",
      fontSize: 12,
      border: "none",
      padding: "4px 8px",
    },
  };

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <button style={S.skip} onClick={onClose}>Skip ✕</button>
        <span style={S.icon}>{current.icon}</span>
        <h2 style={S.title}>{current.title}</h2>
        <p style={S.body}>{current.body}</p>
        <div style={S.dots}>
          {STEPS.map((_, i) => <div key={i} style={S.dot(i === step)} />)}
        </div>
        <div style={S.btns}>
          {step > 0 && (
            <button style={S.ghostBtn} onClick={() => setStep((s) => s - 1)}>← Back</button>
          )}
          <button
            style={S.primaryBtn}
            onClick={() => isLast ? onClose() : setStep((s) => s + 1)}
          >
            {isLast ? "🛫 Let's Fly!" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
