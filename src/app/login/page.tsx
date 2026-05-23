"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import HologramCard from "./HologramCard";

/* ── small inline analytics panels ── */
function MatchOverviewPanel() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.93)",
      borderRadius: "12px",
      padding: "16px 20px",
      width: "240px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
      border: "1px solid rgba(255,255,255,0.6)",
    }}>
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#5A6B66", letterSpacing: "0.08em", marginBottom: "10px" }}>Match Overview</div>
      <div style={{ fontSize: "10px", color: "#8B9994", marginBottom: "8px" }}>2025 J1 League</div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#0F3D2E", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#fff" strokeWidth="1.2"/><path d="M7 3v4l2.5 1.5" stroke="#00D26A" strokeWidth="1.2" strokeLinecap="round"/></svg>
        </div>
        <div style={{ fontSize: "22px", fontWeight: 900, color: "#0F3D2E", letterSpacing: "-1px" }}>2 – 1</div>
        <span style={{ fontSize: "9px", fontWeight: 700, color: "#00D26A", background: "rgba(0,210,106,0.1)", padding: "2px 6px", borderRadius: "4px" }}>WIN</span>
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1A2B4A", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polygon points="7,2 12,11 2,11" stroke="#fff" strokeWidth="1.2" fill="none"/></svg>
        </div>
      </div>
      <div style={{ fontSize: "9px", color: "#8B9994", marginBottom: "4px" }}>GOAL FC vs TOKYO UNITED</div>
      {[
        { label: "Possession", a: 58, b: 42 },
        { label: "Shots", a: 12, b: 6 },
        { label: "Shots on Target", a: 7, b: 3 },
        { label: "Passes", a: 546, b: 412 },
      ].map(({ label, a, b }) => (
        <div key={label} style={{ marginBottom: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "#5A6B66", marginBottom: "2px" }}>
            <span style={{ fontWeight: 700, color: "#0F3D2E" }}>{a}</span>
            <span style={{ color: "#8B9994" }}>{label}</span>
            <span>{b}</span>
          </div>
          <div style={{ height: "3px", background: "#F0EDE6", borderRadius: "2px", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(a / (a + b)) * 100}%`, background: "#00D26A", borderRadius: "2px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function HeatmapPanel() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.90)",
      borderRadius: "12px",
      padding: "14px 16px",
      width: "200px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      border: "1px solid rgba(255,255,255,0.5)",
    }}>
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#5A6B66", letterSpacing: "0.08em", marginBottom: "10px" }}>Heat Map</div>
      <div style={{ position: "relative", width: "100%", height: "90px", background: "#1a3a1a", borderRadius: "6px", overflow: "hidden" }}>
        {/* pitch lines */}
        <div style={{ position: "absolute", inset: "4px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", left: "50%", top: "4px", bottom: "4px", width: "1px", background: "rgba(255,255,255,0.2)" }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "20px", height: "20px", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%" }} />
        {/* heat blobs */}
        {[
          { cx: "65%", cy: "35%", r: 22, c: "rgba(255,80,0,0.55)" },
          { cx: "75%", cy: "55%", r: 18, c: "rgba(255,160,0,0.45)" },
          { cx: "55%", cy: "50%", r: 14, c: "rgba(255,220,0,0.35)" },
          { cx: "30%", cy: "45%", r: 10, c: "rgba(0,210,106,0.25)" },
        ].map((b, i) => (
          <div key={i} style={{
            position: "absolute", left: b.cx, top: b.cy,
            width: b.r * 2, height: b.r * 2,
            background: `radial-gradient(circle, ${b.c} 0%, transparent 70%)`,
            transform: "translate(-50%,-50%)",
            borderRadius: "50%",
          }} />
        ))}
      </div>
    </div>
  );
}

function KeyMetricsPanel() {
  const size = 90;
  const cx = size / 2, cy = size / 2, r = 32;
  const labels = ["Attack", "Pass", "Speed", "Defense", "Technique"];
  const values = [0.75, 0.65, 0.55, 0.50, 0.60];
  const points = labels.map((_, i) => {
    const angle = (i / labels.length) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * values[i] * Math.cos(angle), y: cy + r * values[i] * Math.sin(angle) };
  });
  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");
  const gridPoints = labels.map((_, i) => {
    const angle = (i / labels.length) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const grid = gridPoints.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div style={{
      background: "rgba(255,255,255,0.90)",
      borderRadius: "12px",
      padding: "14px 16px",
      width: "180px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      border: "1px solid rgba(255,255,255,0.5)",
    }}>
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#5A6B66", letterSpacing: "0.08em", marginBottom: "8px" }}>Key Metrics</div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <polygon points={grid} fill="none" stroke="rgba(15,61,46,0.12)" strokeWidth="0.8" />
          {[0.33, 0.66].map((f, i) => {
            const inner = gridPoints.map((_, j) => {
              const angle = (j / labels.length) * 2 * Math.PI - Math.PI / 2;
              return `${cx + r * f * Math.cos(angle)},${cy + r * f * Math.sin(angle)}`;
            }).join(" ");
            return <polygon key={i} points={inner} fill="none" stroke="rgba(15,61,46,0.08)" strokeWidth="0.6" />;
          })}
          {gridPoints.map((p, i) => (
            <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(15,61,46,0.08)" strokeWidth="0.6" />
          ))}
          <polygon points={polyline} fill="rgba(0,210,106,0.18)" stroke="#00D26A" strokeWidth="1.4" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2" fill="#00D26A" />
          ))}
          {gridPoints.map((p, i) => (
            <text key={i} x={p.x + (p.x > cx + 2 ? 3 : p.x < cx - 2 ? -3 : 0)} y={p.y + (p.y < cy ? -3 : 4)}
              fontSize="5" fill="#5A6B66" textAnchor={p.x > cx + 2 ? "start" : p.x < cx - 2 ? "end" : "middle"} fontWeight="500">
              {labels[i]}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

/* ── logo ── */
function Logo() {
  return (
    <svg height="26" viewBox="0 0 158 28" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect x="0" y="1" width="28" height="26" fill="none" stroke="#0F3D2E" strokeWidth="2" strokeLinejoin="round" />
      {[7, 14, 21].map(x => <line key={x} x1={x} y1="1" x2={x} y2="27" stroke="#0F3D2E" strokeWidth="0.5" opacity="0.3" />)}
      {[8, 14, 20].map(y => <line key={y} x1="0" y1={y} x2="28" y2={y} stroke="#0F3D2E" strokeWidth="0.5" opacity="0.3" />)}
      <circle cx="14" cy="14" r="5" fill="#00D26A" />
      <circle cx="14" cy="14" r="5" fill="none" stroke="#0F3D2E" strokeWidth="1" />
      <polygon points="14,9.5 17,11.5 16,17 12,17 11,11.5" fill="#fff" />
      <text x="36" y="20" fontFamily="system-ui,-apple-system,sans-serif" fontSize="16" fontWeight="900" fill="#0F3D2E" letterSpacing="-0.5">GOAL</text>
      <rect x="82" y="5" width="2.5" height="16" fill="#00D26A" />
      <text x="89" y="20" fontFamily="system-ui,-apple-system,sans-serif" fontSize="16" fontWeight="300" fill="#1A2B4A" letterSpacing="-0.5">LABO</text>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  const handleSignInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(`ログインに失敗しました: ${error.message}`);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      alert(`エラーが発生しました: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#FAFAF7" }}>

      {/* ════════════════════════════════════════
          LEFT — analytics visual area
          ════════════════════════════════════════ */}
      <div
        className="hidden lg:block relative overflow-hidden"
        style={{ flex: "0 0 42%", minHeight: "100vh" }}
      >
        {/* Stadium photo simulation — layered gradients */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, #0d2b1a 0%, #1a4a2e 30%, #0f3a22 55%, #071a0e 100%)",
        }} />
        {/* subtle noise texture */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }} />
        {/* subtle grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.06,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        {/* top vignette */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(7,26,14,0.6) 0%, transparent 30%, transparent 70%, rgba(7,26,14,0.7) 100%)" }} />

        {/* green accent light from center */}
        <div style={{
          position: "absolute", top: "40%", left: "55%",
          width: "400px", height: "400px",
          background: "radial-gradient(circle, rgba(0,210,106,0.07) 0%, transparent 70%)",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }} />

        {/* ── top left logo ── */}
        <div style={{ position: "absolute", top: "28px", left: "32px", zIndex: 10 }}>
          <svg height="24" viewBox="0 0 158 28" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
            <rect x="0" y="1" width="28" height="26" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinejoin="round" />
            {[7, 14, 21].map(x => <line key={x} x1={x} y1="1" x2={x} y2="27" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" opacity="0.5" />)}
            {[8, 14, 20].map(y => <line key={y} x1="0" y1={y} x2="28" y2={y} stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" opacity="0.5" />)}
            <circle cx="14" cy="14" r="5" fill="#00D26A" />
            <circle cx="14" cy="14" r="5" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            <polygon points="14,9.5 17,11.5 16,17 12,17 11,11.5" fill="#0F3D2E" />
            <text x="36" y="20" fontFamily="system-ui,-apple-system,sans-serif" fontSize="16" fontWeight="900" fill="rgba(255,255,255,0.9)" letterSpacing="-0.5">GOAL</text>
            <rect x="82" y="5" width="2.5" height="16" fill="#00D26A" />
            <text x="89" y="20" fontFamily="system-ui,-apple-system,sans-serif" fontSize="16" fontWeight="300" fill="rgba(255,255,255,0.7)" letterSpacing="-0.5">LABO</text>
          </svg>
        </div>

        {/* ── lang badge ── */}
        <div style={{
          position: "absolute", top: "26px", right: "24px", zIndex: 10,
          display: "flex", alignItems: "center", gap: "6px",
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "20px", padding: "5px 12px",
          fontSize: "12px", color: "rgba(255,255,255,0.65)", cursor: "pointer",
          backdropFilter: "blur(4px)",
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.7 }}>
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
            <ellipse cx="7" cy="7" rx="3" ry="6" stroke="currentColor" strokeWidth="1.2" />
            <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          日本語
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5 }}>
            <path d="M2.5 4L5 6.5 7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* ── floating analytics panels ── */}
        <div style={{ position: "absolute", inset: 0, zIndex: 5 }}>

          {/* Match overview — top left area */}
          <div style={{
            position: "absolute", top: "13%", left: "6%",
            opacity: 0.92, transform: "rotate(-1.5deg)",
          }}>
            <MatchOverviewPanel />
          </div>

          {/* Heatmap — top right area */}
          <div style={{
            position: "absolute", top: "10%", right: "6%",
            opacity: 0.88, transform: "rotate(1.2deg)",
          }}>
            <HeatmapPanel />
          </div>

          {/* Key metrics — bottom right */}
          <div style={{
            position: "absolute", bottom: "18%", right: "4%",
            opacity: 0.85, transform: "rotate(-0.8deg)",
          }}>
            <KeyMetricsPanel />
          </div>

          {/* small data tag */}
          <div style={{
            position: "absolute", bottom: "9%", left: "8%",
            background: "rgba(0,210,106,0.10)", border: "1px solid rgba(0,210,106,0.25)",
            borderRadius: "8px", padding: "8px 14px",
            backdropFilter: "blur(6px)",
          }}>
            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: "3px" }}>LIVE DATA</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#00D26A" }}>J1 2025 節18</div>
            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>Matchday analytics</div>
          </div>
        </div>

        {/* ── center CARD HERO ── */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 6,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: "20px",
        }}>
          <HologramCard />
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            Goal Labo — Football Intelligence
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════
          RIGHT — login form panel
          ════════════════════════════════════════ */}
      <div
        className="flex-1 flex flex-col justify-between overflow-y-auto"
        style={{ background: "#FAFAF7", minHeight: "100vh" }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "48px 48px 32px" }}>

          {/* logo (mobile only) */}
          <div className="lg:hidden mb-10">
            <Logo />
          </div>

          {/* heading */}
          <div style={{ marginBottom: "32px" }}>
            {/* desktop: no logo — it's shown on left panel */}
            <div className="hidden lg:block mb-8">
              <Logo />
            </div>
            <h1 style={{ fontSize: "30px", fontWeight: 900, color: "#0F3D2E", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: "8px" }}>
              ようこそ
            </h1>
            <p style={{ fontSize: "13px", color: "#5A6B66", lineHeight: 1.6 }}>
              アカウントにサインインして、すべての機能を利用しましょう。
            </p>
          </div>

          {/* Google button */}
          <button
            onClick={handleSignInWithGoogle}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              padding: "11px 20px", borderRadius: "10px",
              background: "#fff", border: "1.5px solid #E2DDD6",
              fontSize: "14px", fontWeight: 600, color: "#0F3D2E",
              cursor: "pointer", transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              marginBottom: "20px",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#0F3D2E"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2DDD6"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            Google でログイン
          </button>

          {/* divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "#E8E4DC" }} />
            <span style={{ fontSize: "12px", color: "#8B9994", whiteSpace: "nowrap" }}>またはメールアドレスでログイン</span>
            <div style={{ flex: 1, height: "1px", background: "#E8E4DC" }} />
          </div>

          {/* form */}
          <form onSubmit={handleSignInWithEmail} style={{ marginBottom: "20px" }}>
            {/* email */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#0F3D2E", marginBottom: "6px" }}>
                メールアドレス
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoComplete="email" placeholder="you@example.com"
                  style={{
                    width: "100%", padding: "10px 40px 10px 14px",
                    background: "#fff", border: "1.5px solid #E2DDD6",
                    borderRadius: "9px", fontSize: "14px", color: "#0F3D2E", outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#00D26A"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,210,106,0.12)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E2DDD6"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <svg style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", opacity: 0.3 }} width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="#0F3D2E" strokeWidth="1.3" />
                  <path d="M1 5l7 5 7-5" stroke="#0F3D2E" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* password */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#0F3D2E", marginBottom: "6px" }}>
                パスワード
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required autoComplete="current-password" placeholder="••••••••••••"
                  style={{
                    width: "100%", padding: "10px 40px 10px 14px",
                    background: "#fff", border: "1.5px solid #E2DDD6",
                    borderRadius: "9px", fontSize: "14px", color: "#0F3D2E", outline: "none",
                    letterSpacing: showPassword ? "normal" : "0.1em",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#00D26A"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,210,106,0.12)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E2DDD6"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button
                  type="button" onClick={() => setShowPassword(s => !s)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "2px", opacity: 0.35 }}
                >
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#0F3D2E" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="#0F3D2E" strokeWidth="1.3"/><line x1="2" y1="2" x2="14" y2="14" stroke="#0F3D2E" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="#0F3D2E" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="#0F3D2E" strokeWidth="1.3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* remember + forgot */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "7px", cursor: "pointer" }}>
                <div
                  onClick={() => setRememberMe(r => !r)}
                  style={{
                    width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0,
                    border: `1.5px solid ${rememberMe ? "#00D26A" : "#C8C3BC"}`,
                    background: rememberMe ? "#00D26A" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s ease", cursor: "pointer",
                  }}
                >
                  {rememberMe && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5l2.5 2.5L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: "12px", color: "#5A6B66", userSelect: "none" }}>ログインしたままにする</span>
              </label>
              <a href="/forgot-password" style={{ fontSize: "12px", color: "#5A6B66", textDecoration: "none" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#0F3D2E"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#5A6B66"; }}>
                パスワードをお忘れですか？
              </a>
            </div>

            {/* submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "12px 20px",
                background: loading ? "#6B8F7E" : "#0F3D2E",
                color: "#fff", border: "none", borderRadius: "10px",
                fontSize: "14px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                boxShadow: loading ? "none" : "0 2px 8px rgba(15,61,46,0.3)",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#1A5A43"; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#0F3D2E"; }}
            >
              {loading ? "ログイン中…" : "ログイン →"}
            </button>
          </form>

          {/* signup */}
          <p style={{ fontSize: "12px", color: "#8B9994", textAlign: "center", marginBottom: "28px" }}>
            アカウントをお持ちでない方は{" "}
            <a href="/signup" style={{ color: "#00B85B", fontWeight: 700, textDecoration: "none" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; }}>
              新規登録
            </a>
          </p>

          {/* notice panel */}
          <div style={{
            background: "#fff", border: "1px solid #EDE9E0", borderRadius: "10px",
            padding: "14px 16px", marginBottom: "0",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#0F3D2E" }}>お知らせ</span>
              <a href="/news" style={{ fontSize: "11px", color: "#5A6B66", textDecoration: "none", display: "flex", alignItems: "center", gap: "3px" }}>
                すべて見る
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 2.5L6.5 5l-3 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
            {[
              "Jリーグ2025 データ更新（5/25）",
              "新機能：セットプレー分析をリリース",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: i === 0 ? "6px" : 0 }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#00D26A", marginTop: "6px", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "#5A6B66", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: "16px 48px 24px", borderTop: "1px solid #EDE9E0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L2 4v4c0 3 2.5 4.5 5 5 2.5-.5 5-2 5-5V4L7 1z" stroke="#8B9994" strokeWidth="1.1" fill="none" />
                <path d="M4.5 7l1.5 1.5L9 5.5" stroke="#8B9994" strokeWidth="1.1" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: "11px", color: "#8B9994" }}>信頼されているクラブ数 <strong style={{ color: "#5A6B66" }}>120+</strong></span>
            </div>
            <span style={{ fontSize: "11px", color: "#B0A89E" }}>© 2025 GOAL LABO, Inc.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
