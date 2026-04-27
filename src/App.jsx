/**
 * App.jsx — Root component. Handles auth gate, theme, and all view routing.
 */

import { injectStyles } from "./styles.js";
import { useAuth } from "./hooks/useAuth.js";
import { useAppState } from "./hooks/useAppState.js";
import { AuthScreen } from "./components/AuthScreen.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { Onboarding } from "./components/Onboarding.jsx";
import { ToastStack, AchievementOverlay, XPFloater } from "./components/Overlays.jsx";
import { HomeView } from "./views/HomeView.jsx";
import { FocusView } from "./views/FocusView.jsx";
import { AchievementsView } from "./views/AchievementsView.jsx";
import { HistoryView } from "./views/HistoryView.jsx";
import { SettingsView } from "./views/SettingsView.jsx";
import { COLOR_THEMES } from "./data/themes.js";

injectStyles();

export default function App() {
  const auth  = useAuth();
  const state = useAppState(auth.currentUser);

  // ── Auth gate ──────────────────────────────────────────────────────
  if (!auth.currentUser) {
    return (
      <AuthScreen
        onLogin={auth.login}
        onSignup={auth.signup}
        error={auth.authError}
        setError={auth.setAuthError}
      />
    );
  }

  const isLight = (state.settings.colorTheme === "light");
  const bg      = isLight ? "#F0F4F8" : "var(--bg)";
  const accentColor = COLOR_THEMES.find(t => t.id === state.settings.colorTheme)?.vars["--accent"] || "#D4A853";

  return (
    <div style={{ display:"flex", width:"100vw", height:"100vh", overflow:"hidden", background: bg }}>
      {/* Onboarding */}
      {state.showOnboarding && (
        <Onboarding
          step={state.onboardStep}
          setStep={state.setOnboardStep}
          onClose={() => state.setShowOnboarding(false)}
        />
      )}

      <AchievementOverlay achievement={state.pendingAchieve} />
      <XPFloater xpAnimation={state.xpAnimation} />
      <ToastStack toasts={state.toasts} />

      {/* Sidebar */}
      <Sidebar
        activeView={state.activeView}
        setActiveView={state.setActiveView}
        level={state.level}
        levelPct={state.levelPct}
        totalXP={state.totalXP}
        hasActive={!!state.activeSession}
        currentUser={auth.currentUser}
        onLogout={auth.logout}
        accentColor={accentColor}
        isLight={isLight}
      />

      {/* Main area */}
      <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>
        {/* Top bar */}
        <div style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0 24px",
          borderBottom: `1px solid ${isLight ? "#D0DCE8" : "var(--border)"}`,
          background: isLight ? "#FFFFFF" : "var(--bg2)",
          gap: 10,
          flexShrink: 0,
        }}>
          {/* Active session indicator */}
          {state.activeSession && (
            <button onClick={() => state.setActiveView("focus")} style={{
              display:"flex", alignItems:"center", gap:6,
              background: "rgba(224,85,85,0.12)",
              border: "1px solid rgba(224,85,85,0.3)",
              borderRadius: 20, padding: "5px 14px",
              color: "#E05555", fontSize: 12, fontWeight:600, cursor:"pointer",
              animation: "glow 2s ease-in-out infinite",
            }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#E05555", display:"inline-block" }}/>
              Session Live
            </button>
          )}

          {/* Theme quick-toggle (cycle through themes) */}
          <div style={{ display:"flex", gap:4 }}>
            {["midnight","arctic","emerald","aurora","sunset","light"].map(tid => {
              const t = COLOR_THEMES.find(x => x.id === tid);
              const isActive = state.settings.colorTheme === tid;
              return (
                <button key={tid}
                  title={t?.label}
                  onClick={() => state.updateSetting("colorTheme", tid)}
                  style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: t?.vars["--accent"],
                    border: isActive ? "2px solid #fff" : "2px solid transparent",
                    cursor: "pointer",
                    boxShadow: isActive ? `0 0 8px ${t?.vars["--accent"]}` : "none",
                    transition: "all 0.2s",
                    padding: 0,
                  }}
                />
              );
            })}
          </div>

          {/* User avatar + name */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:8 }}>
            <div style={{
              width:32, height:32, borderRadius:"50%",
              background: `linear-gradient(135deg, ${accentColor}60, ${accentColor})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:13, fontWeight:700, color:"#fff",
              border: `1px solid ${accentColor}60`,
            }}>
              {auth.currentUser.avatar}
            </div>
            <span style={{ fontSize:13, color: isLight ? "#4A6080" : "var(--text2)" }}>
              {auth.currentUser.displayName}
            </span>
          </div>

          {/* Logout */}
          <button onClick={auth.logout} title="Sign out" style={{
            background:"transparent",
            border:`1px solid ${isLight ? "#D0DCE8" : "var(--border)"}`,
            color: isLight ? "#8AA0B8" : "var(--text3)",
            borderRadius:8, padding:"6px 12px",
            fontSize:12, cursor:"pointer",
          }}>
            Sign out
          </button>
        </div>

        {/* Scrollable view content */}
        <div style={{ flex:1, overflowY:"auto", overflowX:"hidden", position:"relative" }}>
          {state.activeView === "home" && (
            <HomeView
              sessions={state.sessions}
              totalXP={state.totalXP}
              totalSessions={state.totalSessions}
              totalMinutes={state.totalMinutes}
              todayMinutes={state.todayMinutes}
              todaySessions={state.todaySessions}
              currentStreak={state.currentStreak}
              level={state.level}
              levelPct={state.levelPct}
              setActiveView={state.setActiveView}
              activeSession={state.activeSession}
              accentColor={accentColor}
              isLight={isLight}
            />
          )}
          {state.activeView === "focus" && (
            <FocusView
              activeSession={state.activeSession}
              timerSeconds={state.timerSeconds}
              timerRunning={state.timerRunning}
              timerProgress={state.timerProgress}
              startSession={state.startSession}
              togglePause={state.togglePause}
              abandonSession={state.abandonSession}
              settings={state.settings}
              availableClasses={state.availableClasses}
              mapStyle={state.settings.mapStyle || "dark"}
            />
          )}
          {state.activeView === "achievements" && (
            <AchievementsView
              unlocked={state.unlocked}
              totalXP={state.totalXP}
              level={state.level}
              levelPct={state.levelPct}
              accentColor={accentColor}
            />
          )}
          {state.activeView === "history" && (
            <HistoryView
              sessions={state.filteredSessions}
              filter={state.historyFilter}
              setFilter={state.setHistoryFilter}
              accentColor={accentColor}
            />
          )}
          {state.activeView === "settings" && (
            <SettingsView
              settings={state.settings}
              updateSetting={state.updateSetting}
              resetSettings={state.resetSettings}
              accentColor={accentColor}
              isLight={isLight}
            />
          )}
        </div>
      </div>
    </div>
  );
}
