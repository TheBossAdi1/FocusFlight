/**
 * AuthScreen.jsx — Login / Signup screen for FocusFlight
 * Clean, on-brand design with smooth tab switching between login and signup.
 */

import { useState } from "react";

export function AuthScreen({ onLogin, onSignup, error, setError }) {
  const [tab, setTab]         = useState("login"); // "login" | "signup"
  const [username, setUser]   = useState("");
  const [displayName, setDN]  = useState("");
  const [password, setPass]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowP]  = useState(false);

  const handleSubmit = () => {
    setError("");
    if (tab === "login") {
      onLogin(username, password);
    } else {
      if (password !== confirm) { setError("Passwords don't match."); return; }
      onSignup(username, password, displayName);
    }
  };

  const inputStyle = {
    width: "100%",
    background: "#0A1320",
    border: "1px solid #1E3050",
    borderRadius: 10,
    color: "#E8EEF8",
    padding: "13px 16px",
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "linear-gradient(135deg, #060A14 0%, #080E1C 50%, #060A14 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Outfit', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background grid pattern */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: `linear-gradient(#D4A853 1px, transparent 1px), linear-gradient(90deg, #D4A853 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }}/>

      {/* Glow orbs */}
      <div style={{ position:"absolute", top:"-10%", left:"20%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"-10%", right:"15%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(74,144,217,0.05) 0%, transparent 70%)", pointerEvents:"none" }}/>

      {/* Card */}
      <div style={{
        background: "linear-gradient(145deg, #0C1A2E, #080F1E)",
        border: "1px solid rgba(212,168,83,0.2)",
        borderRadius: 22,
        padding: "44px 48px",
        width: 420,
        boxShadow: "0 32px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,168,83,0.05)",
        position: "relative",
        animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 10, filter: "drop-shadow(0 0 16px rgba(212,168,83,0.6))" }}>✈️</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 24, color: "#E8EEF8", letterSpacing: "-0.5px" }}>
            FocusFlight
          </div>
          <div style={{ fontSize: 11, color: "#D4A853", letterSpacing: "3px", textTransform: "uppercase", marginTop: 4 }}>
            Productivity at Altitude
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: "flex", background: "#060C18",
          borderRadius: 12, padding: 4, marginBottom: 28,
          border: "1px solid #1A2840",
        }}>
          {["login", "signup"].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} style={{
              flex: 1, padding: "10px",
              borderRadius: 9,
              background: tab === t ? "linear-gradient(135deg, #0F2540, #0C1E38)" : "transparent",
              border: tab === t ? "1px solid rgba(212,168,83,0.2)" : "1px solid transparent",
              color: tab === t ? "#D4A853" : "#4A6080",
              fontSize: 13, fontWeight: tab === t ? 600 : 400,
              cursor: "pointer", transition: "all 0.2s",
              fontFamily: "'Outfit', sans-serif",
            }}>
              {t === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tab === "signup" && (
            <div>
              <label style={{ fontSize: 11, color: "#4A6080", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Display Name
              </label>
              <input
                placeholder="Captain Jack"
                value={displayName}
                onChange={e => setDN(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, color: "#4A6080", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Username
            </label>
            <input
              placeholder="pilot_name"
              value={username}
              onChange={e => setUser(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={inputStyle}
              autoComplete="username"
            />
          </div>

          <div>
            <label style={{ fontSize: 11, color: "#4A6080", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={{ ...inputStyle, paddingRight: 44 }}
                autoComplete={tab === "login" ? "current-password" : "new-password"}
              />
              <button onClick={() => setShowP(!showPass)} style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "#4A6080", fontSize: 16, cursor: "pointer",
              }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {tab === "signup" && (
            <div>
              <label style={{ fontSize: 11, color: "#4A6080", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={inputStyle}
                autoComplete="new-password"
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 14,
            background: "rgba(224,85,85,0.1)",
            border: "1px solid rgba(224,85,85,0.3)",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 13,
            color: "#E05555",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} style={{
          width: "100%",
          marginTop: 22,
          padding: "14px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #8A6020, #D4A853, #F0C060)",
          color: "#0A1020",
          fontSize: 15,
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          fontFamily: "'Outfit', sans-serif",
          boxShadow: "0 6px 24px rgba(212,168,83,0.3)",
          letterSpacing: "0.3px",
        }}>
          {tab === "login" ? "🛫 Sign In & Take Off" : "🚀 Create Account & Fly"}
        </button>

        {/* Footer hint */}
        <div style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: "#2A4060" }}>
          {tab === "login"
            ? <>New pilot? <button onClick={() => setTab("signup")} style={{ background:"none", border:"none", color:"#D4A853", cursor:"pointer", fontSize:12, fontFamily:"'Outfit',sans-serif" }}>Create an account →</button></>
            : <>Already flying? <button onClick={() => setTab("login")} style={{ background:"none", border:"none", color:"#D4A853", cursor:"pointer", fontSize:12, fontFamily:"'Outfit',sans-serif" }}>Sign in →</button></>
          }
        </div>
      </div>
    </div>
  );
}
