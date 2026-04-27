/**
 * Sidebar.jsx — Left navigation. Fully theme-aware via CSS variables.
 */

export function Sidebar({ activeView, setActiveView, level, levelPct, totalXP, hasActive, currentUser, onLogout, accentColor, isLight }) {
  const nav = [
    { id:"home",         label:"Dashboard",   icon:"⊞" },
    { id:"focus",        label:"Focus Flight", icon:"✈" },
    { id:"achievements", label:"Achievements", icon:"★" },
    { id:"history",      label:"Flight Log",   icon:"≡" },
    { id:"settings",     label:"Settings",     icon:"⚙" },
  ];

  const bg      = isLight ? "#E0E8F0"  : "var(--sidebar, #0A1020)";
  const bdr     = isLight ? "#C8D8E8"  : "rgba(255,255,255,0.07)";
  const txt     = isLight ? "#1A2A3A"  : "#E8EEF8";
  const txt2    = isLight ? "#4A6080"  : "#5A7090";
  const navBg   = (a) => a ? (isLight ? `${accentColor}18` : `${accentColor}18`) : "transparent";
  const navClr  = (a) => a ? accentColor : txt2;
  const navBdr  = (a) => a ? `2px solid ${accentColor}` : "2px solid transparent";

  return (
    <aside style={{
      width:220, minWidth:220, height:"100vh",
      background: bg,
      borderRight:`1px solid ${bdr}`,
      display:"flex", flexDirection:"column",
      position:"relative", zIndex:20, flexShrink:0,
    }}>
      {/* Logo */}
      <div style={{ padding:"22px 20px 18px", borderBottom:`1px solid ${bdr}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
          <span style={{ fontSize:24, filter:`drop-shadow(0 0 8px ${accentColor}90)`, animation:"float 4s ease-in-out infinite" }}>✈️</span>
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:17, color:txt, letterSpacing:"-0.3px" }}>
            FocusFlight
          </span>
        </div>
        <div style={{ fontSize:9, color:accentColor, letterSpacing:"2.5px", textTransform:"uppercase", marginLeft:36 }}>
          Productivity at altitude
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"14px 12px", display:"flex", flexDirection:"column", gap:2 }}>
        {nav.map(item => (
          <button key={item.id} onClick={() => setActiveView(item.id)} style={{
            display:"flex", alignItems:"center", gap:10,
            padding:"10px 12px", borderRadius:8,
            background: navBg(activeView===item.id),
            color: navClr(activeView===item.id),
            fontSize:13, fontWeight:activeView===item.id?600:400,
            width:"100%", textAlign:"left",
            borderLeft: navBdr(activeView===item.id),
            border:"none", cursor:"pointer",
            transition:"all 0.18s",
          }}>
            <span style={{ fontSize:15, width:22, textAlign:"center" }}>{item.icon}</span>
            {item.label}
            {item.id==="focus" && hasActive && (
              <span style={{
                marginLeft:"auto", background:"#E05555", color:"#fff",
                fontSize:8, fontWeight:700, padding:"2px 6px", borderRadius:4,
                letterSpacing:"1px", animation:"glow 2s ease-in-out infinite",
              }}>LIVE</span>
            )}
          </button>
        ))}
      </nav>

      {/* Level card */}
      <div style={{ margin:"0 12px 16px", padding:"14px 16px", background:`${accentColor}10`, border:`1px solid ${accentColor}30`, borderRadius:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:14, color:accentColor }}>
            Level {level}
          </span>
          <span style={{ fontSize:11, color:txt2 }}>{totalXP.toLocaleString()} XP</span>
        </div>
        <div style={{ height:3, background:isLight?"#C8D8E8":"#1A2640", borderRadius:2, overflow:"hidden", marginBottom:6 }}>
          <div style={{
            height:"100%", width:`${levelPct*100}%`,
            background:`linear-gradient(90deg, ${accentColor}80, ${accentColor})`,
            transition:"width 0.6s ease",
          }}/>
        </div>
        <div style={{ fontSize:10, color:txt2 }}>
          {Math.round((1-levelPct)*500)} XP to Level {level+1}
        </div>
      </div>
    </aside>
  );
}
