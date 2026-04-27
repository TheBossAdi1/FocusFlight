/**
 * FocusView.jsx — Focus session with real Leaflet map + animated plane route
 * Pre-session: config panel. Active: full-screen map with plane animation.
 */

import { useState, useEffect, useRef } from "react";
import { FLIGHT_CLASSES, FOCUS_MODES, getRouteForDuration, CITIES } from "../data/flights.js";
import { formatTime, getFlightPhaseLabel } from "../utils/utils.js";
import { MAP_STYLES } from "../data/themes.js";

const DURATIONS = [15, 25, 30, 45, 60, 90, 120, 180, 240];

// ── City coordinates for map ──────────────────────────────────────────────────
const CITY_COORDS = {
  "Amsterdam":    [52.37, 4.90],  "Atlanta":      [33.75, -84.39],
  "Bangkok":      [13.75, 100.52],"Barcelona":    [41.39, 2.15],
  "Beijing":      [39.91, 116.39],"Berlin":       [52.52, 13.41],
  "Boston":       [42.36, -71.06],"Buenos Aires": [-34.60, -58.38],
  "Cairo":        [30.04, 31.24], "Cape Town":    [-33.93, 18.42],
  "Chicago":      [41.88, -87.63],"Delhi":        [28.61, 77.21],
  "Dubai":        [25.20, 55.27], "Frankfurt":    [50.11, 8.68],
  "Hong Kong":    [22.32, 114.17],"Istanbul":     [41.01, 28.98],
  "Jakarta":      [-6.21, 106.85],"Johannesburg": [-26.20, 28.04],
  "Kuala Lumpur": [3.14, 101.69], "Lagos":        [6.45, 3.40],
  "Las Vegas":    [36.17, -115.14],"Lima":        [-12.05, -77.04],
  "Lisbon":       [38.72, -9.14], "London":       [51.51, -0.13],
  "Los Angeles":  [34.05, -118.24],"Madrid":      [40.42, -3.70],
  "Melbourne":    [-37.81, 144.96],"Mexico City":  [19.43, -99.13],
  "Miami":        [25.77, -80.19],"Milan":        [45.46, 9.19],
  "Moscow":       [55.75, 37.62], "Mumbai":       [19.08, 72.88],
  "Munich":       [48.14, 11.58], "Nairobi":      [-1.29, 36.82],
  "New York":     [40.71, -74.01],"Osaka":        [34.69, 135.50],
  "Paris":        [48.86, 2.35],  "Rome":         [41.90, 12.49],
  "San Francisco":[37.77, -122.42],"São Paulo":   [-23.55, -46.63],
  "Seoul":        [37.57, 126.98],"Shanghai":     [31.23, 121.47],
  "Singapore":    [1.35, 103.82], "Sydney":       [-33.87, 151.21],
  "Tokyo":        [35.68, 139.69],"Toronto":      [43.65, -79.38],
  "Vienna":       [48.21, 16.37], "Warsaw":       [52.23, 21.01],
  "Zurich":       [47.38, 8.54],  "Detroit":      [42.33, -83.05],
};

const getCoords = (city) => CITY_COORDS[city] || [0, 0];

// Inject Leaflet CSS + keyframes once
const _inject = (() => {
  let done = false;
  return () => {
    if (done) return; done = true;
    // Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const s = document.createElement("style");
    s.textContent = `
      .leaflet-container { background: #0A1020 !important; }
      .leaflet-tile-pane { filter: var(--lf-filter, brightness(0.45) saturate(0.5) hue-rotate(190deg)); }
      .leaflet-control-attribution { display: none !important; }
      .leaflet-control-zoom { display: none !important; }
      .plane-icon { font-size: 28px; filter: drop-shadow(0 0 10px rgba(212,168,83,0.95)); transition: all 0.9s linear; }
      @keyframes ringPulse {
        0%   { transform: scale(1);   opacity: 0.6; }
        100% { transform: scale(2.2); opacity: 0; }
      }
      @keyframes dotPing {
        0%,100% { transform: scale(1); opacity:1; }
        50%      { transform: scale(1.5); opacity:0.6; }
      }
    `;
    document.head.appendChild(s);
  };
})();

/** Interpolate between two lat/lng points at fraction t (0–1) with great-circle arc */
function interpolate(from, to, t) {
  // Simple linear for now — good enough for short/medium routes
  const lat = from[0] + (to[0] - from[0]) * t;
  const lng = from[1] + (to[1] - from[1]) * t;
  return [lat, lng];
}

/** Compute bearing angle between two points (for plane rotation) */
function bearing(from, to) {
  const dLng = (to[1] - from[1]) * Math.PI / 180;
  const lat1 = from[0] * Math.PI / 180;
  const lat2 = to[0]   * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

/** Map component — renders Leaflet map with animated plane */
function FlightMap({ from, to, progress, mapStyle = "dark" }) {
  const styleConfig = MAP_STYLES.find(m => m.id === mapStyle) || MAP_STYLES[0];
  // Apply map filter via CSS variable
  document.documentElement.style.setProperty("--lf-filter", styleConfig.filter || "brightness(0.45) saturate(0.5) hue-rotate(190deg)");
  const mapRef  = useRef(null);
  const leafRef = useRef(null);
  const planeRef = useRef(null);
  const pathRef  = useRef(null);
  const trailRef = useRef(null);

  const fromCoords = getCoords(from);
  const toCoords   = getCoords(to);

  useEffect(() => {
    // Load Leaflet dynamically
    if (window.L) { initMap(); return; }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = initMap;
    document.head.appendChild(script);

    function initMap() {
      if (leafRef.current || !mapRef.current) return;
      const L = window.L;

      // Center between from/to
      const centerLat = (fromCoords[0] + toCoords[0]) / 2;
      const centerLng = (fromCoords[1] + toCoords[1]) / 2;

      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: 4,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      });

      // Dark tile layer
      L.tileLayer(styleConfig.tileUrl, {
        maxZoom: 19,
      }).addTo(map);

      // Full route dashed line
      const routeLine = L.polyline([fromCoords, toCoords], {
        color: "rgba(212,168,83,0.25)",
        weight: 2,
        dashArray: "8 6",
      }).addTo(map);

      // Fit map to route
      map.fitBounds(routeLine.getBounds(), { padding: [80, 80] });

      // Completed trail (solid gold)
      const trail = L.polyline([fromCoords], {
        color: "rgba(212,168,83,0.7)",
        weight: 2.5,
      }).addTo(map);
      trailRef.current = trail;

      // From marker
      const fromIcon = L.divIcon({
        html: `<div style="width:10px;height:10px;background:#D4A853;border-radius:50%;border:2px solid #F0C060;box-shadow:0 0 8px rgba(212,168,83,0.8)"></div>`,
        iconSize: [10, 10], iconAnchor: [5, 5], className: "",
      });
      L.marker(fromCoords, { icon: fromIcon }).addTo(map);

      // To marker
      const toIcon = L.divIcon({
        html: `<div style="width:10px;height:10px;background:#2A4060;border-radius:50%;border:2px solid #4A90D9;box-shadow:0 0 6px rgba(74,144,217,0.5)" id="dest-dot"></div>`,
        iconSize: [10, 10], iconAnchor: [5, 5], className: "",
      });
      L.marker(toCoords, { icon: toIcon }).addTo(map);

      // City name labels
      [{ city: from, coords: fromCoords }, { city: to, coords: toCoords }].forEach(({ city, coords }) => {
        const label = L.divIcon({
          html: `<div style="color:#D4A853;font-family:'Outfit',sans-serif;font-size:11px;font-weight:700;white-space:nowrap;text-shadow:0 0 8px rgba(0,0,0,0.9)">${city}</div>`,
          iconSize: [120, 20], iconAnchor: [-6, 10], className: "",
        });
        L.marker(coords, { icon: label }).addTo(map);
      });

      // Plane marker
      const planeIcon = L.divIcon({
        html: `<div class="plane-icon">✈️</div>`,
        iconSize: [32, 32], iconAnchor: [16, 16], className: "",
      });
      const plane = L.marker(fromCoords, { icon: planeIcon, zIndexOffset: 1000 }).addTo(map);
      planeRef.current = plane;

      leafRef.current = map;
    }

    return () => {
      if (leafRef.current) { leafRef.current.remove(); leafRef.current = null; }
    };
  }, [from, to]);

  // Update plane position when progress changes
  useEffect(() => {
    if (!planeRef.current || !trailRef.current) return;
    const t = Math.min(progress / 100, 0.999);
    const pos = interpolate(fromCoords, toCoords, t);
    const angle = bearing(fromCoords, toCoords);

    // Move plane
    planeRef.current.setLatLng(pos);

    // Rotate plane emoji to face direction
    const el = planeRef.current.getElement();
    if (el) {
      const inner = el.querySelector(".plane-icon");
      if (inner) inner.style.transform = `rotate(${angle - 45}deg)`;
    }

    // Update trail — build points from 0 to t
    const steps = Math.max(Math.round(t * 40), 2);
    const trailPoints = Array.from({ length: steps + 1 }, (_, i) =>
      interpolate(fromCoords, toCoords, (i / steps) * t)
    );
    trailRef.current.setLatLngs(trailPoints);
  }, [progress, fromCoords, toCoords]);

  return (
    <div ref={mapRef} style={{
      width: "100%", height: "100%",
      background: "#070C18",
    }} />
  );
}

export function FocusView({
  activeSession, timerSeconds, timerRunning, timerProgress,
  startSession, togglePause, abandonSession,
  settings, availableClasses, mapStyle,
}) {
  const resolvedMapStyle = mapStyle || "dark";
  _inject();

  const [duration, setDuration]       = useState(settings.defaultDuration || 25);
  const [flightClass, setFlightClass] = useState(settings.defaultFlightClass || "economy");
  const [focusMode, setFocusMode]     = useState(settings.defaultFocusMode || "warning");
  const [useCustomRoute, setCustom]   = useState(false);
  const [fromCity, setFrom]           = useState(settings.defaultFrom || "New York");
  const [toCity, setTo]               = useState(settings.defaultTo || "London");

  const suggestedRoute = getRouteForDuration(duration);
  const activeRoute = useCustomRoute ? { from: fromCity, to: toCity } : suggestedRoute;
  const selectedClass = FLIGHT_CLASSES.find((c) => c.id === flightClass) || FLIGHT_CLASSES[0];
  const xpPreview = Math.round(duration * 2 * selectedClass.multiplier);
  const phase = getFlightPhaseLabel(timerProgress);

  const C = 2 * Math.PI * 88;

  // ── ACTIVE SESSION ────────────────────────────────────────────────────────
  if (activeSession) {
    const sessionClass = FLIGHT_CLASSES.find(c => c.id === activeSession.flightClass);
    const sessionXP = Math.round(activeSession.duration * 2 * (sessionClass?.multiplier || 1));

    return (
      <div style={{ width:"100%", height:"100vh", position:"relative", overflow:"hidden", background:"#070C18" }}>

        {/* ── Full-screen map ── */}
        <div style={{ position:"absolute", inset:0, zIndex:1 }}>
          <FlightMap
            mapStyle={resolvedMapStyle}
            from={activeSession.from}
            to={activeSession.to}
            progress={timerProgress}
          />
        </div>

        {/* Dark gradient overlay — bottom half for UI legibility */}
        <div style={{
          position:"absolute", inset:0, zIndex:2, pointerEvents:"none",
          background:"linear-gradient(to bottom, transparent 35%, rgba(5,8,18,0.6) 60%, rgba(5,8,18,0.92) 100%)",
        }}/>

        {/* ── Top HUD bar ── */}
        <div style={{
          position:"absolute", top:0, left:0, right:0, zIndex:10,
          padding:"14px 28px",
          background:"linear-gradient(to bottom,rgba(5,8,18,0.85),transparent)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
        }}>
          {/* Route */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:700, color:"#D4A853", fontFamily:"'Playfair Display',serif" }}>
                {activeSession.from}
              </div>
              <div style={{ fontSize:9, color:"#3A5070", letterSpacing:"1px" }}>ORIGIN</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ fontSize:11, color:"#4A6080" }}>──── ✈️ ────</div>
              <div style={{
                fontSize:10, color:"#C8A855",
                background:"rgba(212,168,83,0.1)",
                border:"1px solid rgba(212,168,83,0.2)",
                borderRadius:10, padding:"2px 10px",
              }}>
                {phase.emoji} {phase.label}
              </div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:700, color: timerProgress >= 98 ? "#52C97A" : "#6A8AA8", fontFamily:"'Playfair Display',serif", transition:"color 1s" }}>
                {activeSession.to}
              </div>
              <div style={{ fontSize:9, color:"#3A5070", letterSpacing:"1px" }}>DESTINATION</div>
            </div>
          </div>

          {/* Flight class badge */}
          <div style={{
            display:"flex", alignItems:"center", gap:8,
            background:"rgba(212,168,83,0.08)",
            border:"1px solid rgba(212,168,83,0.2)",
            borderRadius:20, padding:"6px 16px",
          }}>
            <span style={{ fontSize:16 }}>{sessionClass?.emoji}</span>
            <span style={{ fontSize:12, color:"#D4A853", fontWeight:600 }}>{sessionClass?.label}</span>
            <span style={{ fontSize:10, color:"#4A6080" }}>· {activeSession.focusMode} mode</span>
          </div>
        </div>

        {/* ── Bottom UI Panel ── */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, zIndex:10,
          padding:"20px 32px 24px",
          display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:24,
        }}>

          {/* Phase steps (left) */}
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            {[
              {pct:0,  emoji:"🔧", label:"Pre-flight"},
              {pct:15, emoji:"🚕", label:"Taxi"},
              {pct:25, emoji:"🛫", label:"Takeoff"},
              {pct:50, emoji:"✈️", label:"Cruise"},
              {pct:75, emoji:"📉", label:"Descent"},
              {pct:90, emoji:"🛬", label:"Land"},
              {pct:99, emoji:"🏁", label:"Arrived"},
            ].map(p => {
              const done = timerProgress >= p.pct;
              return (
                <div key={p.pct} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <div style={{
                    width:36, height:36, borderRadius:"50%",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:16, flexShrink:0,
                    background: done ? "rgba(212,168,83,0.2)" : "rgba(10,20,40,0.7)",
                    border: done ? "1px solid rgba(212,168,83,0.6)" : "1px solid rgba(30,50,70,0.8)",
                    boxShadow: done ? "0 0 10px rgba(212,168,83,0.4)" : "none",
                    transition:"all 0.5s",
                    backdropFilter:"blur(4px)",
                  }}>
                    {p.emoji}
                  </div>
                  <span style={{ fontSize:9, color: done ? "#A08040" : "#2A4060", letterSpacing:"0.5px" }}>
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Timer (center) */}
          <div style={{ position:"relative", width:180, height:180, flexShrink:0 }}>
            {timerRunning && [0,1].map(i=>(
              <div key={i} style={{
                position:"absolute", inset:`${-8-i*8}px`, borderRadius:"50%",
                border:"1px solid rgba(212,168,83,0.2)",
                animation:"ringPulse 2s ease-out infinite",
                animationDelay:`${i*0.5}s`,
              }}/>
            ))}
            <svg width="180" height="180" style={{ position:"absolute", top:0, left:0 }}>
              <defs>
                <linearGradient id="gGold2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8A6020"/>
                  <stop offset="55%" stopColor="#D4A853"/>
                  <stop offset="100%" stopColor="#F0C060"/>
                </linearGradient>
              </defs>
              <circle cx="90" cy="90" r="72" fill="rgba(5,8,18,0.7)" stroke="#0D1828" strokeWidth="10"/>
              <circle cx="90" cy="90" r="72" fill="none"
                stroke={timerRunning ? "url(#gGold2)" : "#2A4060"}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={2*Math.PI*72}
                strokeDashoffset={2*Math.PI*72*(1-timerProgress/100)}
                transform="rotate(-90 90 90)"
                style={{ transition:"stroke-dashoffset 1s linear, stroke 0.4s" }}/>
            </svg>
            <div style={{
              position:"absolute", inset:0,
              display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center",
              gap:3,
            }}>
              <div style={{
                fontFamily:"'Playfair Display',serif", fontWeight:900,
                fontSize:36, color:"#E8EEF8", letterSpacing:"-2px", lineHeight:1,
              }}>{formatTime(timerSeconds)}</div>
              <div style={{ fontSize:11, color:"#4A90D9" }}>{timerProgress}%</div>
              {!timerRunning && <div style={{ fontSize:9, color:"#F0A030", fontWeight:700, letterSpacing:"2px" }}>PAUSED</div>}
            </div>
          </div>

          {/* Controls + info (right) */}
          <div style={{ display:"flex", flexDirection:"column", gap:10, minWidth:200 }}>
            <div style={{
              background:"rgba(5,10,20,0.8)", backdropFilter:"blur(8px)",
              border:"1px solid rgba(212,168,83,0.15)",
              borderRadius:12, padding:"12px 16px",
              display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 14px",
            }}>
              {[
                ["Duration", `${activeSession.duration}m`],
                ["XP Reward", `+${sessionXP}`],
                ["Class",    sessionClass?.label],
                ["Mode",     activeSession.focusMode],
              ].map(([k,v])=>(
                <div key={k}>
                  <div style={{ fontSize:9, color:"#3A5070", letterSpacing:"1px", textTransform:"uppercase" }}>{k}</div>
                  <div style={{ fontSize:12, color:"#C8A855", fontWeight:600 }}>{v}</div>
                </div>
              ))}
            </div>
            <button onClick={togglePause} style={{
              padding:"12px", borderRadius:10,
              background: timerRunning ? "rgba(74,144,217,0.15)" : "linear-gradient(135deg,#8A6020,#D4A853)",
              color: timerRunning ? "#4A90D9" : "#0A1020",
              fontSize:14, fontWeight:700,
              border: timerRunning ? "1px solid rgba(74,144,217,0.35)" : "none",
              cursor:"pointer", backdropFilter:"blur(4px)",
            }}>
              {timerRunning ? "⏸  Pause Flight" : "▶  Resume Flight"}
            </button>
            <button onClick={abandonSession} style={{
              padding:"9px", borderRadius:10,
              background:"rgba(224,85,85,0.08)", color:"#E05555",
              fontSize:12, border:"1px solid rgba(224,85,85,0.2)",
              cursor:"pointer", backdropFilter:"blur(4px)",
            }}>✕  Abandon Flight</button>
          </div>
        </div>
      </div>
    );
  }

  // ── PRE-SESSION CONFIG ─────────────────────────────────────────────────────
  const S = {
    wrap:{ padding:"32px 36px", minHeight:"100%", animation:"fadeUp 0.35s ease" },
    title:{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:28, color:"#E8EEF8", marginBottom:4, letterSpacing:"-0.5px" },
    sub:{ fontSize:13, color:"#4A6080", marginBottom:32 },
    grid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 },
    card:{ background:"linear-gradient(135deg,#0D1828,#0A1320)", border:"1px solid #1A2840", borderRadius:14, padding:"22px 24px" },
    lbl:{ fontSize:11, fontWeight:600, letterSpacing:"1.5px", color:"#4A6080", textTransform:"uppercase", marginBottom:14 },
    durBtn:(a)=>({ padding:"10px 4px", borderRadius:8, background:a?"rgba(212,168,83,0.15)":"#0A1320", border:a?"1px solid rgba(212,168,83,0.5)":"1px solid #1A2840", color:a?"#D4A853":"#4A6080", fontSize:13, fontWeight:a?700:400, cursor:"pointer" }),
    classCard:(a,u)=>({ padding:"12px 14px", borderRadius:10, background:a?"rgba(212,168,83,0.1)":"#0A1320", border:a?"1px solid rgba(212,168,83,0.4)":"1px solid #1A2840", cursor:u?"pointer":"not-allowed", opacity:u?1:0.4, transition:"all 0.18s" }),
    modeBtn:(a,c)=>({ padding:"10px 14px", borderRadius:8, background:a?`${c}18`:"#0A1320", border:a?`1px solid ${c}60`:"1px solid #1A2840", color:a?c:"#4A6080", fontSize:12, cursor:"pointer", flex:1, textAlign:"center" }),
  };

  return (
    <div style={S.wrap}>
      <h1 style={S.title}>Plan Your Flight ✈️</h1>
      <p style={S.sub}>Configure your focus session and take off when ready.</p>
      <div style={S.grid}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={S.card}>
            <div style={S.lbl}>Session Duration</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {DURATIONS.map(d=>(
                <button key={d} style={S.durBtn(duration===d)} onClick={()=>setDuration(d)}>
                  {d<60?`${d}m`:`${d/60}h`}
                </button>
              ))}
            </div>
            <div style={{marginTop:12,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:"#3A5070"}}>Custom:</span>
              <input type="number" min={5} max={480} value={duration}
                onChange={e=>setDuration(Number(e.target.value))}
                style={{background:"#0A1320",border:"1px solid #1A2840",borderRadius:6,color:"#C8D8EC",padding:"6px 10px",fontSize:13,width:70,outline:"none"}}/>
              <span style={{fontSize:12,color:"#3A5070"}}>min</span>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.lbl}>Focus Mode</div>
            <div style={{display:"flex",gap:8}}>
              {FOCUS_MODES.map(m=>(
                <button key={m.id} style={S.modeBtn(focusMode===m.id,m.color)} onClick={()=>setFocusMode(m.id)} title={m.desc}>
                  <div style={{fontSize:18,marginBottom:4}}>{m.emoji}</div>
                  <div style={{fontSize:11}}>{m.label}</div>
                </button>
              ))}
            </div>
            <div style={{fontSize:11,color:"#2A4060",marginTop:10}}>
              {FOCUS_MODES.find(m=>m.id===focusMode)?.desc}
            </div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={S.card}>
            <div style={S.lbl}>Flight Route</div>
            <div style={{background:"rgba(74,144,217,0.08)",border:"1px solid rgba(74,144,217,0.2)",borderRadius:10,padding:"14px 18px",textAlign:"center",marginBottom:12}}>
              <div style={{fontSize:20,marginBottom:6}}>{activeRoute.from} ✈️ {activeRoute.to}</div>
              <div style={{fontSize:12,color:"#3A5070"}}>{useCustomRoute?`Custom route`:`Equivalent to a ~${duration}min flight`}</div>
            </div>
            <button style={{background:"transparent",color:"#4A90D9",fontSize:12,border:"none",padding:"4px 0",marginBottom:10,cursor:"pointer"}} onClick={()=>setCustom(!useCustomRoute)}>
              {useCustomRoute?"← Use suggested route":"✏️ Choose custom route"}
            </button>
            {useCustomRoute&&(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[["From",fromCity,setFrom],["To",toCity,setTo]].map(([lbl,val,setter])=>(
                  <div key={lbl} style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:12,color:"#3A5070",minWidth:30}}>{lbl}</span>
                    <select value={val} onChange={e=>setter(e.target.value)} style={{flex:1,fontSize:12}}>
                      {CITIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={S.card}>
            <div style={S.lbl}>Flight Class</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {FLIGHT_CLASSES.map(cls=>{
                const unlocked=availableClasses.some(c=>c.id===cls.id);
                return (
                  <div key={cls.id} style={S.classCard(flightClass===cls.id,unlocked)} onClick={()=>unlocked&&setFlightClass(cls.id)}>
                    <div style={{fontSize:20,marginBottom:4}}>{cls.emoji}</div>
                    <div style={{fontSize:12,fontWeight:600,color:unlocked?cls.color:"#3A5070"}}>{cls.label}</div>
                    <div style={{fontSize:10,color:"#2A4060",marginTop:2}}>{unlocked?`×${cls.multiplier} XP`:`🔒 ${cls.unlockXP} XP`}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div style={{textAlign:"center"}}>
        <button style={{
          width:"100%",padding:"15px",borderRadius:12,
          background:"linear-gradient(135deg,#8A6020,#D4A853,#F0C060)",
          color:"#0A1020",fontSize:16,fontWeight:700,marginTop:20,
          boxShadow:"0 6px 24px rgba(212,168,83,0.3)",cursor:"pointer",
        }} onClick={()=>startSession({duration,flightClass,focusMode,from:activeRoute.from,to:activeRoute.to})}>
          🛫 Begin {duration<60?`${duration}m`:`${duration/60}h`} Focus Flight
        </button>
        <div style={{textAlign:"center",marginTop:10,fontSize:13,color:"#D4A853"}}>
          Earn approximately <strong style={{color:"#D4A853"}}>+{xpPreview} XP</strong> on completion
        </div>
      </div>
    </div>
  );
}
