/**
 * styles.js — Design system & CSS injection for FocusFlight
 * Aesthetic: Luxury aviation — deep midnight blues, warm gold accents,
 * crisp whites. Fonts: "Playfair Display" (display) + "Outfit" (body).
 * Mood: first-class lounge meets mission control.
 */

export function injectStyles() {
  // Google Fonts
  const fonts = document.createElement("link");
  fonts.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Outfit:wght@300;400;500;600;700&display=swap";
  fonts.rel = "stylesheet";
  document.head.appendChild(fonts);

  const css = document.createElement("style");
  css.textContent = `
    :root {
      --bg:         #070C18;
      --bg2:        #0C1425;
      --surface:    #101A2E;
      --surface2:   #162035;
      --border:     #1E2E4A;
      --border2:    #243550;
      --gold:       #D4A853;
      --gold2:      #F0C060;
      --blue:       #4A90D9;
      --blue2:      #6BAEE8;
      --teal:       #3EC6C6;
      --green:      #52C97A;
      --red:        #E05555;
      --amber:      #F0A030;
      --purple:     #9B7FD4;
      --text:       #E8EEF8;
      --text2:      #8A9BB8;
      --text3:      #4A5E7A;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Outfit', sans-serif;
      background: var(--bg, #070C18);
      color: var(--text);
      overflow: hidden;
      height: 100vh;
    }

    #root { height: 100vh; width: 100vw; display: flex; overflow: hidden; }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--bg2); }
    ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }

    /* ── Buttons ── */
    button { cursor: pointer; border: none; font-family: 'Outfit', sans-serif; transition: all 0.18s ease; }
    button:active { transform: scale(0.96); }

    /* ── Range input ── */
    input[type=range] {
      -webkit-appearance: none; width: 100%; height: 3px;
      border-radius: 2px; background: var(--border2); outline: none; cursor: pointer;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none; width: 14px; height: 14px;
      border-radius: 50%; background: var(--gold); cursor: pointer;
    }

    /* ── Select ── */
    select {
      font-family: 'Outfit', sans-serif; background: var(--surface2);
      color: var(--text); border: 1px solid var(--border2);
      border-radius: 8px; padding: 8px 12px; cursor: pointer; outline: none;
    }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes popIn {
      0%   { opacity: 0; transform: scale(0.5) rotate(-5deg); }
      70%  { transform: scale(1.08) rotate(1deg); }
      100% { opacity: 1; transform: scale(1) rotate(0deg); }
    }
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(60px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(-3deg); }
      50%       { transform: translateY(-10px) rotate(3deg); }
    }
    @keyframes planeFly {
      0%   { transform: translateX(-5%) translateY(0); }
      50%  { transform: translateX(50%) translateY(-8px); }
      100% { transform: translateX(105%) translateY(0); }
    }
    @keyframes xpFloat {
      0%   { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-60px); }
    }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    @keyframes goldPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(212,168,83,0); }
      50%       { box-shadow: 0 0 20px 4px rgba(212,168,83,0.3); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); } to { transform: rotate(360deg); }
    }
    @keyframes glow {
      0%, 100% { opacity: 0.6; }
      50%       { opacity: 1; }
    }
    @keyframes ripple {
      0%   { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(2);   opacity: 0; }
    }
    @keyframes streak {
      from { background-position: 200% 0; }
      to   { background-position: -200% 0; }
    }

    .animate-fadeUp    { animation: fadeUp 0.4s ease forwards; }
    .animate-popIn     { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    .animate-slideRight{ animation: slideRight 0.35s ease forwards; }
    .animate-float     { animation: float 4s ease-in-out infinite; }
    .animate-goldPulse { animation: goldPulse 2.5s ease-in-out infinite; }
    .animate-glow      { animation: glow 2s ease-in-out infinite; }
  `;
  document.head.appendChild(css);
}
