/**
 * useAuth.js — Authentication system for FocusFlight
 * Handles: user accounts, login, signup, logout, persistent storage per user.
 * Storage: localStorage keyed by username — no backend needed.
 */

import { useState, useCallback } from "react";
import { generateSeedHistory } from "../utils/utils.js";

const USERS_KEY  = "ff_users";
const SESSION_KEY = "ff_current_user";

/** Read all registered users from localStorage */
const loadUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); }
  catch { return {}; }
};

/** Save users map to localStorage */
const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/** Load a specific user's app data */
export const loadUserData = (username) => {
  try {
    const raw = localStorage.getItem(`ff_data_${username}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

/** Save a specific user's app data */
export const saveUserData = (username, data) => {
  localStorage.setItem(`ff_data_${username}`, JSON.stringify(data));
};

/** Simple hash (not crypto-secure, fine for local app) */
const hashPass = (pw) => {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = ((h << 5) - h + pw.charCodeAt(i)) | 0;
  }
  return h.toString(36);
};

export function useAuth() {
  // Check if already logged in this session
  const [currentUser, setCurrentUser] = useState(() => {
    const u = sessionStorage.getItem(SESSION_KEY);
    return u ? JSON.parse(u) : null;
  });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  /** Sign up a new user */
  const signup = useCallback((username, password, displayName) => {
    setAuthError("");
    if (!username.trim() || username.length < 3) {
      setAuthError("Username must be at least 3 characters."); return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setAuthError("Username can only contain letters, numbers, and underscores."); return false;
    }
    if (!password || password.length < 6) {
      setAuthError("Password must be at least 6 characters."); return false;
    }

    const users = loadUsers();
    if (users[username.toLowerCase()]) {
      setAuthError("Username already taken. Try another."); return false;
    }

    // Create new user record
    const user = {
      username: username.toLowerCase(),
      displayName: displayName || username,
      passwordHash: hashPass(password),
      createdAt: new Date().toISOString(),
      avatar: username[0].toUpperCase(),
    };
    users[username.toLowerCase()] = user;
    saveUsers(users);

    // Create fresh data for this user (no seed history)
    saveUserData(username.toLowerCase(), {
      sessions: [],
      totalXP: 0,
      unlocked: [],
      settings: {
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
      },
      showOnboarding: true,
    });

    // Log in immediately
    const sessionUser = { username: user.username, displayName: user.displayName, avatar: user.avatar };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);
    return true;
  }, []);

  /** Log in an existing user */
  const login = useCallback((username, password) => {
    setAuthError("");
    const users = loadUsers();
    const user  = users[username.toLowerCase()];

    if (!user) {
      setAuthError("No account found with that username."); return false;
    }
    if (user.passwordHash !== hashPass(password)) {
      setAuthError("Incorrect password. Try again."); return false;
    }

    const sessionUser = { username: user.username, displayName: user.displayName, avatar: user.avatar };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);
    return true;
  }, []);

  /** Log out current user */
  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setAuthError("");
  }, []);

  return { currentUser, authError, setAuthError, login, signup, logout };
}
