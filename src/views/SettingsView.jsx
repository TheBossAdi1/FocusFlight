/**
 * SettingsView.jsx — Full settings panel with color themes, map styles, mode toggle.
 */

import { COLOR_THEMES, MAP_STYLES } from "../data/themes.js";
import { FLIGHT_CLASSES, FOCUS_MODES, CITIES } from "../data/flights.js";

export function SettingsView({ settings, updateSetting, resetSettings, accentColor, isLight }) {
  const txt  = isLight ? "#1A2A3A" : "#C8D8EC";
  const txt2 = isLight ? "#4A6080" : "#6A8AA8";
  const txt3 = isLight ? "#8AA0B8" : "#3A5070";
  const bg   = isLight ? "#FFFFFF" : "linear-gradient(135deg,#0D1828,#0A1320)";
  const bdr  = isLight ? "#D0DCE8" : "#1A2840";

  const Card = ({ children, style = {} }) => (
    <div style={{
      background: bg, border: `1px solid ${bdr}`,
      borderRadius: 14, padding: "22px 24px", ...style,
    }}>
      {children}
    </div>
  );

  const SectionLabel = ({ children }) => (
    <div style={{ fontSize:11, fontWeight:700, letterSpacing:"1.5px", color:txt3, textTransform:"uppercase", marginBottom:16 }}>
      {children}
    </div>
  );

  const Row = ({ children }) => (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 0", borderBottom:`1px solid ${bdr}`, gap:16 }}>
      {children}
    </div>
  );

  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)} style={{
      width:44, height:24, borderRadius:12,
      background: value ? accentColor : (isLight ? "#D0DCE8" : "#1A2840"),
      position:"relative", border:"none", cursor:"pointer", flexShrink:0, padding:0,
      transition:"background 0.25s",
    }}>
      <div style={{
        width:20, height:20, borderRadius:"50%", background:"#fff",
        position:"absolute", top:2, left: value ? 22 : 2,
        transition:"left 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.3)",
      }}/>
    </button>
  );

  return (
    <div style={{ padding:"32px 36px", minHeight:"100%", animation:"fadeUp 0.35s ease" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:28, color:txt, letterSpacing:"-0.5px" }}>
            Settings ⚙️
          </h1>
          <p style={{ fontSize:13, color:txt2, marginTop:4 }}>Customize your flight experience</p>
        </div>
        <button onClick={resetSettings} style={{
          padding:"10px 20px", borderRadius:8,
          background:"rgba(224,85,85,0.1)", color:"#E05555",
          border:"1px solid rgba(224,85,85,0.2)", fontSize:13, cursor:"pointer",
        }}>↺ Reset Defaults</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>

        {/* ── Color Themes ── */}
        <Card style={{ gridColumn:"1 / -1" }}>
          <SectionLabel>🎨 App Theme</SectionLabel>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10 }}>
            {COLOR_THEMES.map(t => {
              const active = settings.colorTheme === t.id;
              return (
                <button key={t.id} onClick={() => updateSetting("colorTheme", t.id)} style={{
                  borderRadius:12, padding:"14px 8px",
                  background: active ? `${t.vars["--accent"]}18` : (isLight ? "#F0F4F8" : "#0A1320"),
                  border: active ? `2px solid ${t.vars["--accent"]}` : `1px solid ${bdr}`,
                  cursor:"pointer", textAlign:"center",
                  transition:"all 0.2s",
                  boxShadow: active ? `0 4px 16px ${t.vars["--accent"]}30` : "none",
                }}>
                  {/* Color dots */}
                  <div style={{ display:"flex", justifyContent:"center", gap:4, marginBottom:8 }}>
                    {t.preview.map((c, i) => (
                      <div key={i} style={{ width:12, height:12, borderRadius:"50%", background:c, border:`1px solid ${c}80` }}/>
                    ))}
                  </div>
                  <div style={{ fontSize:16, marginBottom:4 }}>{t.emoji}</div>
                  <div style={{ fontSize:10, color: active ? t.vars["--accent"] : txt3, fontWeight: active ? 700 : 400 }}>
                    {t.label}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* ── Map Styles ── */}
        <Card style={{ gridColumn:"1 / -1" }}>
          <SectionLabel>🗺️ Map Style</SectionLabel>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10 }}>
            {MAP_STYLES.map(m => {
              const active = settings.mapStyle === m.id;
              return (
                <button key={m.id} onClick={() => updateSetting("mapStyle", m.id)} style={{
                  borderRadius:12, padding:"14px 8px",
                  background: active ? `${accentColor}18` : (isLight ? "#F0F4F8" : "#0A1320"),
                  border: active ? `2px solid ${accentColor}` : `1px solid ${bdr}`,
                  cursor:"pointer", textAlign:"center",
                  transition:"all 0.2s",
                }}>
                  {/* Color preview swatch */}
                  <div style={{
                    width:40, height:28, borderRadius:6, margin:"0 auto 8px",
                    background: m.preview,
                    border:`1px solid ${accentColor}30`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:16,
                  }}>
                    {m.emoji}
                  </div>
                  <div style={{ fontSize:11, color: active ? accentColor : txt3, fontWeight: active?700:400 }}>
                    {m.label}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* ── App Preferences ── */}
        <Card>
          <SectionLabel>⚡ Preferences</SectionLabel>
          <Row>
            <div>
              <div style={{ fontSize:14, color:txt }}>Sound Effects</div>
              <div style={{ fontSize:11, color:txt3 }}>Play audio cues</div>
            </div>
            <Toggle value={settings.soundEnabled} onChange={v => updateSetting("soundEnabled", v)} />
          </Row>
          <Row>
            <div>
              <div style={{ fontSize:14, color:txt }}>Notifications</div>
              <div style={{ fontSize:11, color:txt3 }}>Session alerts</div>
            </div>
            <Toggle value={settings.notificationsOn} onChange={v => updateSetting("notificationsOn", v)} />
          </Row>
        </Card>

        {/* ── Session Defaults ── */}
        <Card>
          <SectionLabel>⏱️ Session Defaults</SectionLabel>
          <Row>
            <div style={{ fontSize:14, color:txt }}>Duration</div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <input type="range" min={5} max={120} step={5} value={settings.defaultDuration}
                onChange={e => updateSetting("defaultDuration", Number(e.target.value))}
                style={{ width:100 }}/>
              <span style={{ fontSize:13, color:accentColor, minWidth:36 }}>{settings.defaultDuration}m</span>
            </div>
          </Row>
          <div style={{ paddingTop:12 }}>
            <div style={{ fontSize:11, color:txt3, letterSpacing:"1px", textTransform:"uppercase", marginBottom:10 }}>Focus Mode</div>
            <div style={{ display:"flex", gap:6 }}>
              {FOCUS_MODES.map(m => (
                <button key={m.id} onClick={() => updateSetting("defaultFocusMode", m.id)} style={{
                  flex:1, padding:"8px 4px", borderRadius:8, textAlign:"center", cursor:"pointer",
                  background: settings.defaultFocusMode===m.id ? `${m.color}20` : (isLight?"#F0F4F8":"#0A1320"),
                  border: settings.defaultFocusMode===m.id ? `1px solid ${m.color}60` : `1px solid ${bdr}`,
                  color: settings.defaultFocusMode===m.id ? m.color : txt3, fontSize:11,
                }}>
                  <div style={{ fontSize:16, marginBottom:2 }}>{m.emoji}</div>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Default Route ── */}
        <Card style={{ gridColumn:"1 / -1" }}>
          <SectionLabel>✈️ Default Flight Route</SectionLabel>
          <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
            {[["From", "defaultFrom"], ["To", "defaultTo"]].map(([lbl, key]) => (
              <div key={key} style={{ flex:1, minWidth:160 }}>
                <div style={{ fontSize:11, color:txt3, marginBottom:6 }}>{lbl}</div>
                <select value={settings[key]}
                  onChange={e => updateSetting(key, e.target.value)}
                  style={{ width:"100%", background: isLight?"#F0F4F8":"#0A1320", color:txt, border:`1px solid ${bdr}`, borderRadius:8, padding:"10px 12px", fontSize:13 }}>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            ))}
            <div style={{ fontSize:22, paddingTop:18 }}>✈️</div>
            <div style={{ flex:1, minWidth:160 }}>
              <div style={{ fontSize:11, color:txt3, marginBottom:6 }}>Default Class</div>
              <div style={{ display:"flex", gap:6 }}>
                {FLIGHT_CLASSES.map(c => (
                  <button key={c.id} onClick={() => updateSetting("defaultFlightClass", c.id)} style={{
                    flex:1, padding:"8px 4px", borderRadius:8, textAlign:"center", cursor:"pointer",
                    background: settings.defaultFlightClass===c.id ? `${c.color}20` : (isLight?"#F0F4F8":"#0A1320"),
                    border: settings.defaultFlightClass===c.id ? `1px solid ${c.color}60` : `1px solid ${bdr}`,
                    color: settings.defaultFlightClass===c.id ? c.color : txt3, fontSize:10,
                  }}>
                    <div style={{ fontSize:14, marginBottom:2 }}>{c.emoji}</div>
                    {c.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
