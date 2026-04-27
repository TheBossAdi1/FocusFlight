/**
 * HistoryView.jsx — Flight Log with boarding pass cards styled like the reference image.
 * Clean white-card aesthetic with airport codes, world map watermark, barcode, and all flight details.
 */

import { useState } from "react";
import { FLIGHT_CLASSES } from "../data/flights.js";
import { formatMinutes } from "../utils/utils.js";

const _injectStyles = (() => {
  let done = false;
  return () => {
    if (done) return; done = true;
    const s = document.createElement("style");
    s.textContent = `
      @keyframes ticketIn {
        from { opacity:0; transform:translateY(18px); }
        to   { opacity:1; transform:translateY(0); }
      }
      .bp-card { transition: transform 0.22s ease, box-shadow 0.22s ease; cursor: default; }
      .bp-card:hover { transform: translateY(-5px) rotate(0.4deg); }
    `;
    document.head.appendChild(s);
  };
})();

// Class accent colors
const CLASS_COLOR = {
  economy:  { accent:"#1A73E8", bg:"#EAF2FF", label:"ECONOMY" },
  business: { accent:"#B8860B", bg:"#FFF8E6", label:"BUSINESS" },
  first:    { accent:"#7B3FA0", bg:"#F5EEFF", label:"FIRST CLASS" },
  private:  { accent:"#1B7A4A", bg:"#EAFAF1", label:"PRIVATE JET" },
};

// Deterministic fake flight details
const hashId = (id) => id.split("").reduce((a,c) => a + c.charCodeAt(0), 0);
const flightNum = (id) => `FF${1000 + (hashId(id) % 8999)}`;
const gate      = (id) => `${"ABCDE"[hashId(id) % 5]}${10 + (hashId(id) % 24)}`;
const seat      = (id) => `${1 + (hashId(id) % 30)}${"ABCDEF"[hashId(id) % 6]}`;
const fakeTime  = (id) => { const h = 6 + (hashId(id) % 16); const m = [0,15,30,45][hashId(id)%4]; return `${h%12||12}:${String(m).padStart(2,"0")} ${h<12?"AM":"PM"}`; };

// Approximate distance in km between two city coords (rough)
const CITY_COORDS = {
  "London":[51.5,-0.1],"Paris":[48.9,2.4],"New York":[40.7,-74],"Los Angeles":[34,-118.2],
  "Tokyo":[35.7,139.7],"Dubai":[25.2,55.3],"Singapore":[1.4,103.8],"Sydney":[-33.9,151.2],
  "Chicago":[41.9,-87.6],"Amsterdam":[52.4,4.9],"Berlin":[52.5,13.4],"Madrid":[40.4,-3.7],
  "Rome":[41.9,12.5],"Istanbul":[41,29],"Mumbai":[19.1,72.9],"Hong Kong":[22.3,114.2],
  "Toronto":[43.7,-79.4],"Miami":[25.8,-80.2],"Boston":[42.4,-71.1],"Atlanta":[33.7,-84.4],
};
const distKm = (a, b) => {
  const ca = CITY_COORDS[a], cb = CITY_COORDS[b];
  if (!ca || !cb) return Math.floor(500 + Math.random()*4000);
  const R=6371, dLat=(cb[0]-ca[0])*Math.PI/180, dLon=(cb[1]-ca[1])*Math.PI/180;
  const x=Math.sin(dLat/2)**2+Math.cos(ca[0]*Math.PI/180)*Math.cos(cb[0]*Math.PI/180)*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)));
};

// Barcode SVG
function Barcode({ seed }) {
  const bars = Array.from({length:44}, (_,i) => {
    const v = (hashId(seed) * (i+7) * 13) % 100;
    return { w: v%5===0?3:v%3===0?1:2, h: 28+((v*i)%20) };
  });
  return (
    <svg width="100%" height="48" viewBox={`0 0 ${bars.reduce((s,b)=>s+b.w+1.5,0)} 48`} preserveAspectRatio="none">
      {bars.reduce((acc,b,i) => {
        const x = acc.x;
        acc.els.push(<rect key={i} x={x} y={(48-b.h)/2} width={b.w} height={b.h} fill="#111" rx="0.5"/>);
        acc.x += b.w + 1.5;
        return acc;
      }, { x:0, els:[], result: null }).els}
    </svg>
  );
}

// World map SVG watermark (simplified continents outline)
function WorldMapWatermark() {
  return (
    <svg viewBox="0 0 360 180" style={{ width:"100%", height:"100%", opacity:0.06 }} xmlns="http://www.w3.org/2000/svg">
      {/* Very simplified continent blobs */}
      <ellipse cx="90" cy="80" rx="40" ry="35" fill="#000"/>
      <ellipse cx="80" cy="120" rx="25" ry="30" fill="#000"/>
      <ellipse cx="185" cy="70" rx="35" ry="25" fill="#000"/>
      <ellipse cx="200" cy="110" rx="20" ry="28" fill="#000"/>
      <ellipse cx="270" cy="75" rx="28" ry="20" fill="#000"/>
      <ellipse cx="290" cy="120" rx="22" ry="18" fill="#000"/>
      <ellipse cx="330" cy="100" rx="18" ry="22" fill="#000"/>
      <ellipse cx="185" cy="140" rx="15" ry="20" fill="#000"/>
      <circle cx="155" cy="130" r="12" fill="#000"/>
    </svg>
  );
}

/** Single boarding pass card — styled like the reference image */
function BoardingPass({ session, idx, accentColor }) {
  const cls   = FLIGHT_CLASSES.find(c => c.id === session.flightClass) || FLIGHT_CLASSES[0];
  const theme = CLASS_COLOR[session.flightClass] || CLASS_COLOR.economy;
  const fn    = flightNum(session.id);
  const g     = gate(session.id);
  const s     = seat(session.id);
  const t     = fakeTime(session.id);
  const km    = distKm(session.from, session.to).toLocaleString();
  const dateStr = new Date(session.date).toLocaleDateString("en-GB", { year:"numeric", month:"2-digit", day:"2-digit" }).replace(/\//g, "/");
  const fromCode = (session.from||"???").substring(0,3).toUpperCase();
  const toCode   = (session.to  ||"???").substring(0,3).toUpperCase();
  const modeColors = { warning:"#E67E22", partial:"#E74C3C", full:"#C0392B" };
  const modeColor  = modeColors[session.focusMode] || "#E67E22";

  return (
    <div className="bp-card" style={{
      background:"#FFFFFF",
      borderRadius:16,
      overflow:"hidden",
      boxShadow:"0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.1)",
      animation:`ticketIn 0.35s ease ${idx*0.05}s both`,
      display:"flex",
      maxWidth:680,
      width:"100%",
      margin:"0 auto",
      position:"relative",
    }}>
      {/* Left main ticket body */}
      <div style={{ flex:1, padding:"24px 22px 0 24px", position:"relative", overflow:"hidden" }}>
        {/* World map watermark behind content */}
        <div style={{ position:"absolute", inset:0, top:"-10%", pointerEvents:"none" }}>
          <WorldMapWatermark />
        </div>

        {/* Top row: class badge + flight number */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, position:"relative", zIndex:1 }}>
          <div style={{
            background:theme.bg, border:`1px solid ${theme.accent}40`,
            borderRadius:6, padding:"3px 10px",
            fontSize:10, fontWeight:700, color:theme.accent, letterSpacing:"1.5px",
          }}>
            {cls.emoji} {theme.label}
          </div>
          <div style={{ fontSize:10, color:"#999", letterSpacing:"0.5px" }}>
            Flight No. <span style={{ fontWeight:700, color:"#333" }}>{fn}</span>
          </div>
        </div>

        {/* BIG airport codes row — LHR ✈ CDG */}
        <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:4, position:"relative", zIndex:1 }}>
          {/* From */}
          <div style={{ flex:1 }}>
            <div style={{
              fontFamily:"'Playfair Display',serif",
              fontWeight:900, fontSize:52, color:"#111",
              letterSpacing:"-2px", lineHeight:1,
            }}>
              {fromCode}
            </div>
            <div style={{ fontSize:13, color:"#555", marginTop:4 }}>{session.from}</div>
          </div>

          {/* Center flight path */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"0 12px", minWidth:100 }}>
            <div style={{ fontSize:11, color:"#999", marginBottom:6 }}>
              {session.duration < 60 ? `${session.duration}m` : `${Math.floor(session.duration/60)}h ${session.duration%60>0?session.duration%60+"m":""}`}
            </div>
            <div style={{ display:"flex", alignItems:"center", width:"100%", gap:3 }}>
              <div style={{ flex:1, height:1, background:"#CCC" }}/>
              <div style={{ fontSize:18, color:"#555", transform:"rotate(0deg)" }}>✈</div>
              <div style={{ flex:1, height:1, background:"#CCC" }}/>
            </div>
            <div style={{ fontSize:9, color:"#BBB", marginTop:5, letterSpacing:"0.5px" }}>NONSTOP</div>
          </div>

          {/* To */}
          <div style={{ flex:1, textAlign:"right" }}>
            <div style={{
              fontFamily:"'Playfair Display',serif",
              fontWeight:900, fontSize:52, color:"#111",
              letterSpacing:"-2px", lineHeight:1,
            }}>
              {toCode}
            </div>
            <div style={{ fontSize:13, color:"#555", marginTop:4 }}>{session.to}</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:"#EBEBEB", margin:"14px 0" }}/>

        {/* Details grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:"10px 0", marginBottom:0, position:"relative", zIndex:1 }}>
          {[
            ["Flight No.", fn],
            ["Distance",  `${km} km`],
            ["Boarding",  t],
            ["Date",      dateStr],
            ["Gate",      g],
            ["Seat",      s],
            ["Mode",      session.focusMode, modeColor],
            ["XP Earned", `+${Math.round(session.xpEarned)}`, "#D4A853"],
          ].map(([k,v,c]) => (
            <div key={k}>
              <div style={{ fontSize:10, color:"#AAA", marginBottom:2, letterSpacing:"0.3px" }}>{k}</div>
              <div style={{ fontSize:13, fontWeight:700, color: c || "#222" }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Barcode */}
        <div style={{ marginTop:14, marginBottom:0 }}>
          <Barcode seed={session.id} />
          <div style={{ fontSize:8, color:"#BBB", letterSpacing:"2px", textAlign:"center", marginTop:2 }}>
            {session.id.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Tear perforation */}
      <div style={{ width:22, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", background:"#FAFAFA", position:"relative" }}>
        {/* Top half-circle notch */}
        <div style={{ width:18, height:18, borderRadius:"50%", background:"#F0F0F0", border:"1px solid #E0E0E0", marginTop:-9, flexShrink:0 }}/>
        {/* Dashed line */}
        <div style={{ flex:1, borderLeft:"1.5px dashed #DDD", margin:"4px 0" }}/>
        {/* Bottom half-circle notch */}
        <div style={{ width:18, height:18, borderRadius:"50%", background:"#F0F0F0", border:"1px solid #E0E0E0", marginBottom:-9, flexShrink:0 }}/>
      </div>

      {/* Right stub */}
      <div style={{
        width:130, padding:"22px 14px 22px 10px",
        display:"flex", flexDirection:"column",
        justifyContent:"space-between", alignItems:"center",
        background:"#FAFAFA",
      }}>
        {/* Stub header */}
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:9, color:"#AAA", letterSpacing:"1px", textTransform:"uppercase", marginBottom:6 }}>FocusFlight</div>
          <div style={{
            fontFamily:"'Playfair Display',serif",
            fontWeight:900, fontSize:22, color:"#111", lineHeight:1, marginBottom:3,
          }}>
            {fromCode}
          </div>
          <div style={{ fontSize:8, color:"#CCC" }}>→</div>
          <div style={{
            fontFamily:"'Playfair Display',serif",
            fontWeight:900, fontSize:22, color:"#111", lineHeight:1, marginTop:3,
          }}>
            {toCode}
          </div>
        </div>

        {/* XP Stamp circle */}
        <div style={{
          width:72, height:72, borderRadius:"50%",
          border:`3px solid ${theme.accent}`,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          background:theme.bg,
          position:"relative",
        }}>
          <div style={{ fontSize:9, color:theme.accent, letterSpacing:"0.5px", textTransform:"uppercase" }}>XP</div>
          <div style={{
            fontFamily:"'Playfair Display',serif",
            fontWeight:900, fontSize:18, color:theme.accent, lineHeight:1,
          }}>
            +{Math.round(session.xpEarned)}
          </div>
          <div style={{ fontSize:8, color:`${theme.accent}80` }}>earned</div>
        </div>

        {/* Stub details */}
        <div style={{ textAlign:"center", width:"100%" }}>
          <div style={{ fontSize:9, color:"#BBB", marginBottom:2 }}>SEAT</div>
          <div style={{ fontSize:20, fontWeight:800, color:"#333" }}>{s}</div>
          <div style={{ fontSize:9, color:"#CCC", marginTop:6 }}>{cls.label}</div>
        </div>
      </div>
    </div>
  );
}

export function HistoryView({ sessions, filter, setFilter, accentColor }) {
  _injectStyles();

  const [sortBy, setSortBy] = useState("date");
  const [view,   setView]   = useState("tickets");

  const totalMins = sessions.reduce((s,x) => s+x.duration, 0);
  const totalXP   = sessions.reduce((s,x) => s+(x.xpEarned||0), 0);
  const avgDur    = sessions.length ? Math.round(totalMins/sessions.length) : 0;

  const sorted = [...sessions].reverse().sort((a,b) => {
    if (sortBy==="xp")       return b.xpEarned - a.xpEarned;
    if (sortBy==="duration") return b.duration  - a.duration;
    return 0;
  });

  const pill = (active, label, onClick) => (
    <button onClick={onClick} style={{
      padding:"7px 16px", borderRadius:20,
      background: active ? `${accentColor}22` : "transparent",
      border: active ? `1px solid ${accentColor}60` : "1px solid #1A2840",
      color: active ? accentColor : "#4A6080",
      fontSize:12, fontWeight:active?600:400, cursor:"pointer",
    }}>{label}</button>
  );

  return (
    <div style={{ padding:"32px 36px", minHeight:"100%", animation:"fadeUp 0.35s ease" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:28, color:"var(--text)", letterSpacing:"-0.5px" }}>
            Flight Log 🎫
          </h1>
          <p style={{ fontSize:13, color:"var(--text2)", marginTop:4 }}>{sessions.length} boarding passes collected</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" }}>
          <div style={{ display:"flex", gap:6 }}>
            {[["day","Today"],["week","This Week"],["month","This Month"]].map(([id,lbl]) =>
              pill(filter===id, lbl, () => setFilter(id))
            )}
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <span style={{ fontSize:11, color:"#3A5070", alignSelf:"center" }}>Sort:</span>
            {[["date","Latest"],["xp","Most XP"],["duration","Longest"]].map(([id,lbl]) =>
              pill(sortBy===id, lbl, () => setSortBy(id))
            )}
            <div style={{ width:1, background:"#1A2840", margin:"0 2px" }}/>
            {pill(view==="tickets","🎫 Cards",() => setView("tickets"))}
            {pill(view==="compact","☰ List",  () => setView("compact"))}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        {[
          ["✈️","Flights",      sessions.length,                   accentColor],
          ["⏱️","Total Focus",  formatMinutes(totalMins),          "#52C97A"],
          ["⭐","XP Earned",   Math.round(totalXP).toLocaleString(),"#D4A853"],
          ["⚡","Avg Session", sessions.length?`${avgDur}m`:"—",  "#CE93D8"],
        ].map(([icon,lbl,val,clr]) => (
          <div key={lbl} style={{
            background:"linear-gradient(135deg,var(--surface),var(--bg2))",
            border:"1px solid var(--border)", borderRadius:12, padding:"16px", textAlign:"center",
          }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:20, color:clr, marginBottom:4 }}>{val}</div>
            <div style={{ fontSize:10, color:"var(--text3)", letterSpacing:"0.5px" }}>{lbl}</div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {sessions.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 0", color:"#2A4060", fontSize:14 }}>
          No flights yet — start a session to collect your first boarding pass! 🎫
        </div>
      )}

      {/* Ticket grid */}
      {view === "tickets" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {sorted.map((s,i) => <BoardingPass key={s.id} session={s} idx={i} accentColor={accentColor} />)}
        </div>
      )}

      {/* Compact list */}
      {view === "compact" && (
        <div style={{ background:"linear-gradient(135deg,var(--surface),var(--bg2))", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 70px 100px 80px", padding:"10px 20px", borderBottom:"1px solid var(--border)", fontSize:9, fontWeight:700, letterSpacing:"1.5px", color:"var(--text3)", textTransform:"uppercase" }}>
            <span>Route</span><span>Date</span><span>Duration</span><span>Class</span><span>XP</span>
          </div>
          {sorted.map(s => {
            const cls   = FLIGHT_CLASSES.find(c=>c.id===s.flightClass);
            const theme = CLASS_COLOR[s.flightClass]||CLASS_COLOR.economy;
            return (
              <div key={s.id} style={{ display:"grid", gridTemplateColumns:"1fr 100px 70px 100px 80px", padding:"13px 20px", borderBottom:"1px solid var(--border)", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:13, color:"var(--text)", fontWeight:500 }}>{s.from} → {s.to}</div>
                  <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>
                    {flightNum(s.id)} · Gate {gate(s.id)} · Seat {seat(s.id)}
                  </div>
                </div>
                <div style={{ fontSize:12, color:"var(--text2)" }}>
                  {new Date(s.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                </div>
                <div style={{ fontSize:13, color:accentColor, fontWeight:600 }}>{s.duration}m</div>
                <div style={{ fontSize:10, fontWeight:700, color:theme.accent, background:`${theme.accent}18`, border:`1px solid ${theme.accent}30`, borderRadius:6, padding:"3px 8px", display:"inline-block" }}>
                  {cls?.emoji} {cls?.label}
                </div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:14, color:"#D4A853" }}>
                  +{Math.round(s.xpEarned)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
