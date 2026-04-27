/**
 * useAppState.js — Central state management hook for FocusFlight
 * Now supports: multi-user auth, localStorage persistence per user,
 * color themes, map styles, dark/light mode.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { ACHIEVEMENT_DEFS } from "../data/achievements.js";
import { FLIGHT_CLASSES, calcSessionXP } from "../data/flights.js";
import { applyTheme } from "../data/themes.js";
import { uid, todayStr, computeStreak, calcLevel, generateSeedHistory } from "../utils/utils.js";
import { loadUserData, saveUserData } from "./useAuth.js";

const DEFAULT_SETTINGS = {
  theme: "dark",
  colorTheme: "midnight",
  mapStyle: "dark",
  soundEnabled: true,
  notificationsOn: true,
  defaultFocusMode: "warning",
  defaultFlightClass: "economy",
  defaultDuration: 25,
  defaultFrom: "New York",
  defaultTo: "London",
};

export function useAppState(currentUser) {
  const username = currentUser?.username;

  // ── Load persisted data for this user ─────────────────────────────
  const loadInitial = (key, fallback) => {
    const data = loadUserData(username);
    // New users (no data) get fresh state; returning users get their data
    if (data && data[key] !== undefined) return data[key];
    return typeof fallback === "function" ? fallback() : fallback;
  };

  // ── Navigation ─────────────────────────────────────────────────────
  const [activeView, setActiveView]       = useState("home");
  const [showOnboarding, setShowOnboarding] = useState(() => loadInitial("showOnboarding", true));
  const [onboardStep, setOnboardStep]     = useState(0);

  // ── Sessions ───────────────────────────────────────────────────────
  const [sessions, setSessions] = useState(() => {
    const data = loadUserData(username);
    // Returning user: load their real history. New user: empty.
    if (data && Array.isArray(data.sessions)) return data.sessions;
    // Demo: seed data for first-ever load if no account system used
    return username ? [] : generateSeedHistory();
  });

  // ── Timer ──────────────────────────────────────────────────────────
  const [activeSession, setActiveSession] = useState(() => loadInitial("activeSession", null));
  const [timerSeconds, setTimerSeconds]   = useState(() => loadInitial("timerSeconds", 0));
  const [timerRunning, setTimerRunning]   = useState(false); // We don't auto-run on load for safety
  const timerRef = useRef(null);

  // ── XP ─────────────────────────────────────────────────────────────
  const [totalXP, setTotalXP] = useState(() => {
    const data = loadUserData(username);
    if (data && typeof data.totalXP === "number") return data.totalXP;
    return username ? 0 : generateSeedHistory().reduce((s, x) => s + (x.xpEarned || 0), 0);
  });
  const [xpAnimation, setXpAnimation] = useState(null);

  // ── Achievements ───────────────────────────────────────────────────
  const [unlocked, setUnlocked] = useState(() => loadInitial("unlocked", []));
  const [pendingAchieve, setPendingAchieve] = useState(null);

  // ── Toasts ─────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);

  // ── Settings ───────────────────────────────────────────────────────
  const [settings, setSettings] = useState(() => {
    const data = loadUserData(username);
    return data?.settings ? { ...DEFAULT_SETTINGS, ...data.settings } : DEFAULT_SETTINGS;
  });

  // ── History filter ─────────────────────────────────────────────────
  const [historyFilter, setHistoryFilter] = useState("week");

  // ── Apply theme on settings change ────────────────────────────────
  useEffect(() => {
    applyTheme(settings.colorTheme || "midnight");
  }, [settings.colorTheme]);

  // Apply initial theme on mount
  useEffect(() => {
    applyTheme(settings.colorTheme || "midnight");
  }, []);

  // ── Persist to localStorage whenever key state changes ───────────
  useEffect(() => {
    if (!username) return;
    saveUserData(username, { 
      sessions, totalXP, unlocked, settings, showOnboarding, 
      activeSession, timerSeconds 
    });
  }, [sessions, totalXP, unlocked, settings, showOnboarding, username, activeSession, timerSeconds]);

  // ── Derived stats ──────────────────────────────────────────────────
  const completedSessions = sessions.filter(s => s.completed);
  const totalSessions     = completedSessions.length;
  const totalMinutes      = completedSessions.reduce((s, x) => s + x.duration, 0);
  const longestSession    = completedSessions.reduce((m, x) => Math.max(m, x.duration), 0);
  const currentStreak     = computeStreak(sessions);
  const level             = calcLevel(totalXP);
  const levelPct          = (totalXP % 500) / 500;
  const todaySessions     = completedSessions.filter(s => s.date === todayStr());
  const todayMinutes      = todaySessions.reduce((s, x) => s + x.duration, 0);

  const userStats = { totalSessions, totalMinutes, totalXP, currentStreak, longestSession, level,
    earlyBird: sessions.some(s => s.earlyBird),
    nightOwl:  sessions.some(s => s.nightOwl) };

  // ── Timer countdown ────────────────────────────────────────────────
  useEffect(() => {
    if (timerRunning && timerSeconds > 0) {
      let lastTime = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const delta = Math.floor((now - lastTime) / 1000);
        
        if (delta >= 1) {
          lastTime = now;
          setTimerSeconds(prev => {
            const next = prev - delta;
            if (next <= 0) {
              clearInterval(timerRef.current);
              handleSessionComplete();
              return 0;
            }
            return next;
          });
        }
      }, 100); // Poll frequently but only update on full seconds
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning, handleSessionComplete]);

  const timerProgress = activeSession
    ? Math.round(((activeSession.totalSeconds - timerSeconds) / activeSession.totalSeconds) * 100)
    : 0;

  // ── Session actions ────────────────────────────────────────────────
  const startSession = useCallback((opts) => {
    const { duration = settings.defaultDuration, flightClass = settings.defaultFlightClass,
      focusMode = settings.defaultFocusMode, from, to } = opts;
    const hour = new Date().getHours();
    const session = {
      id: uid(), date: todayStr(), duration,
      flightClass, focusMode,
      from: from || settings.defaultFrom,
      to:   to   || settings.defaultTo,
      totalSeconds: duration * 60, xpEarned: 0,
      completed: false,
      earlyBird: hour < 8, nightOwl: hour >= 22,
    };
    setActiveSession(session);
    setTimerSeconds(duration * 60);
    setTimerRunning(true);
    setActiveView("focus");
    addToast(`✈️ Flight to ${session.to} departed!`, "info");
  }, [settings]);

  const togglePause = () => {
    setTimerRunning(p => !p);
    addToast(timerRunning ? "⏸ Session paused" : "▶️ Resumed", "info");
  };

  const abandonSession = () => {
    clearInterval(timerRef.current);
    setTimerRunning(false);
    setActiveSession(null);
    setTimerSeconds(0);
    addToast("Session abandoned. You've got this next time! 💪", "warning");
    setActiveView("home");
  };

  const handleSessionComplete = useCallback(() => {
    setTimerRunning(false);
    setActiveSession(prev => {
      if (!prev) return null;
      const xpEarned = calcSessionXP(prev.duration, prev.flightClass);
      const done = { ...prev, completed: true, xpEarned };
      setSessions(s => [...s, done]);
      setTotalXP(x => {
        const newXP = x + xpEarned;
        animateXP(xpEarned);
        setTimeout(() => checkAchievements(newXP, done), 400);
        return newXP;
      });
      addToast(`🏁 Landed! +${xpEarned} XP earned!`, "success");
      setActiveView("home");
      return null;
    });
  }, []);

  // ── Achievements ───────────────────────────────────────────────────
  const checkAchievements = useCallback((newXP, lastSession) => {
    const stats = {
      totalSessions: totalSessions + 1,
      totalMinutes:  totalMinutes + (lastSession?.duration || 0),
      totalXP:       newXP,
      currentStreak, longestSession: Math.max(longestSession, lastSession?.duration || 0),
      earlyBird: lastSession?.earlyBird || userStats.earlyBird,
      nightOwl:  lastSession?.nightOwl  || userStats.nightOwl,
    };
    ACHIEVEMENT_DEFS.forEach(ach => {
      if (!unlocked.includes(ach.id) && ach.condition(stats)) {
        setUnlocked(prev => [...prev, ach.id]);
        setPendingAchieve(ach);
        if (ach.xp > 0) setTotalXP(x => x + ach.xp);
        addToast(`🏆 Achievement: ${ach.title}!`, "achievement");
        setTimeout(() => setPendingAchieve(null), 4500);
      }
    });
  }, [unlocked, totalSessions, totalMinutes, longestSession, currentStreak, userStats]);

  const animateXP = (amount) => {
    const id = uid();
    setXpAnimation({ amount, id });
    setTimeout(() => setXpAnimation(null), 2000);
  };

  // ── Toasts ─────────────────────────────────────────────────────────
  const addToast = (message, type = "info") => {
    const id = uid();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  };

  // ── Settings ───────────────────────────────────────────────────────
  const updateSetting = (key, val) => setSettings(p => ({ ...p, [key]: val }));
  const resetSettings = () => { setSettings(DEFAULT_SETTINGS); applyTheme("midnight"); addToast("Settings reset.", "info"); };

  // ── Filtered history ───────────────────────────────────────────────
  const filteredSessions = completedSessions.filter(s => {
    const d = new Date(s.date), now = new Date();
    if (historyFilter === "day")  return s.date === todayStr();
    if (historyFilter === "week") { const w = new Date(now); w.setDate(now.getDate()-7); return d>=w; }
    const m = new Date(now); m.setDate(now.getDate()-30); return d>=m;
  });

  const availableClasses = FLIGHT_CLASSES.filter(c => totalXP >= c.unlockXP);

  return {
    activeView, setActiveView,
    showOnboarding, setShowOnboarding,
    onboardStep, setOnboardStep,
    sessions, activeSession, timerSeconds, timerRunning, timerProgress,
    startSession, togglePause, abandonSession,
    totalXP, level, levelPct, totalSessions, totalMinutes,
    todayMinutes, todaySessions, currentStreak, longestSession, userStats,
    unlocked, pendingAchieve, xpAnimation,
    toasts, addToast,
    settings, updateSetting, resetSettings,
    historyFilter, setHistoryFilter, filteredSessions,
    availableClasses,
  };
}
