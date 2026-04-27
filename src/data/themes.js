/**
 * themes.js — Color themes and map styles for FocusFlight
 * Each theme defines CSS variable overrides injected at runtime.
 */

/** App color themes */
export const COLOR_THEMES = [
  {
    id: "midnight",
    label: "Midnight Gold",
    emoji: "🌙",
    preview: ["#070C18", "#D4A853", "#4A90D9"],
    vars: {
      "--bg":      "#070C18",
      "--bg2":     "#0C1425",
      "--surface": "#0D1828",
      "--border":  "#1A2840",
      "--accent":  "#D4A853",
      "--accent2": "#F0C060",
      "--blue":    "#4A90D9",
      "--text":    "#E8EEF8",
      "--text2":   "#8A9BB8",
      "--text3":   "#4A5E7A",
      "--sidebar": "#0A1020",
    },
  },
  {
    id: "arctic",
    label: "Arctic Blue",
    emoji: "🧊",
    preview: ["#08111E", "#4FC3F7", "#81D4FA"],
    vars: {
      "--bg":      "#08111E",
      "--bg2":     "#0A1628",
      "--surface": "#0C1A30",
      "--border":  "#142238",
      "--accent":  "#4FC3F7",
      "--accent2": "#81D4FA",
      "--blue":    "#4FC3F7",
      "--text":    "#E0F0FF",
      "--text2":   "#7AACCC",
      "--text3":   "#3A6888",
      "--sidebar": "#060E1A",
    },
  },
  {
    id: "emerald",
    label: "Emerald Skies",
    emoji: "🌿",
    preview: ["#061410", "#52C97A", "#38A360"],
    vars: {
      "--bg":      "#061410",
      "--bg2":     "#091A14",
      "--surface": "#0B2018",
      "--border":  "#122A20",
      "--accent":  "#52C97A",
      "--accent2": "#78D898",
      "--blue":    "#38A360",
      "--text":    "#E0F5EC",
      "--text2":   "#7ABFA0",
      "--text3":   "#3A7060",
      "--sidebar": "#040E0A",
    },
  },
  {
    id: "aurora",
    label: "Aurora",
    emoji: "🌌",
    preview: ["#0A0818", "#9B7FD4", "#E070C0"],
    vars: {
      "--bg":      "#0A0818",
      "--bg2":     "#0E0C22",
      "--surface": "#120E2A",
      "--border":  "#1E1840",
      "--accent":  "#9B7FD4",
      "--accent2": "#C09AE8",
      "--blue":    "#E070C0",
      "--text":    "#F0E8FF",
      "--text2":   "#9A88CC",
      "--text3":   "#5A4888",
      "--sidebar": "#080618",
    },
  },
  {
    id: "sunset",
    label: "Sunset",
    emoji: "🌅",
    preview: ["#180A06", "#F0703A", "#F0A030"],
    vars: {
      "--bg":      "#180A06",
      "--bg2":     "#200C08",
      "--surface": "#280E08",
      "--border":  "#3A1810",
      "--accent":  "#F0A030",
      "--accent2": "#F0C060",
      "--blue":    "#F0703A",
      "--text":    "#FFF0E8",
      "--text2":   "#CC9070",
      "--text3":   "#885040",
      "--sidebar": "#100806",
    },
  },
  {
    id: "light",
    label: "Light Mode",
    emoji: "☀️",
    preview: ["#F5F7FA", "#1565C0", "#D4A853"],
    vars: {
      "--bg":      "#F0F4F8",
      "--bg2":     "#E8EEF5",
      "--surface": "#FFFFFF",
      "--border":  "#D0DCE8",
      "--accent":  "#1565C0",
      "--accent2": "#1976D2",
      "--blue":    "#1565C0",
      "--text":    "#0A1828",
      "--text2":   "#4A6080",
      "--text3":   "#8AA0B8",
      "--sidebar": "#E0E8F0",
    },
  },
];

/** Map tile styles for Leaflet */
export const MAP_STYLES = [
  {
    id: "dark",
    label: "Dark Terrain",
    emoji: "🌑",
    tileUrl: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    filter: "brightness(0.45) saturate(0.5) hue-rotate(190deg)",
    preview: "#070C18",
  },
  {
    id: "satellite",
    label: "Satellite",
    emoji: "🛰️",
    tileUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    filter: "brightness(0.7) saturate(0.8)",
    preview: "#1A2A10",
  },
  {
    id: "topo",
    label: "Terrain",
    emoji: "⛰️",
    tileUrl: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    filter: "brightness(0.5) saturate(0.6) hue-rotate(10deg)",
    preview: "#1A2A18",
  },
  {
    id: "ocean",
    label: "Ocean Blue",
    emoji: "🌊",
    tileUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
    filter: "brightness(0.55) hue-rotate(180deg) saturate(1.2)",
    preview: "#051428",
  },
  {
    id: "green",
    label: "Green Earth",
    emoji: "🌍",
    tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    filter: "brightness(0.4) saturate(1.2) hue-rotate(80deg)",
    preview: "#0A1808",
  },
  {
    id: "minimal",
    label: "Minimal",
    emoji: "🗺️",
    tileUrl: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    filter: "brightness(0.3) saturate(0.3) invert(1) hue-rotate(180deg)",
    preview: "#101820",
  },
];

/**
 * Apply a color theme by injecting CSS variable overrides on :root
 * @param {string} themeId
 */
export function applyTheme(themeId) {
  const theme = COLOR_THEMES.find(t => t.id === themeId) || COLOR_THEMES[0];
  const root  = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
}
