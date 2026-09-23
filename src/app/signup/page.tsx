"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

/* ── logo ── */
function Logo({ light = false }: { light?: boolean }) {
  const strong = light ? "rgba(255,255,255,0.9)" : "#0F3D2E";
  const soft = light ? "rgba(255,255,255,0.7)" : "#1A2B4A";
  const line = light ? "rgba(255,255,255,0.4)" : "#0F3D2E";
  return (
    <svg height="26" viewBox="0 0 158 28" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
      <rect x="0" y="1" width="28" height="26" fill="none" stroke={light ? "rgba(255,255,255,0.7)" : "#0F3D2E"} strokeWidth="2" strokeLinejoin="round" />
      {[7, 14, 21].map(x => <line key={x} x1={x} y1="1" x2={x} y2="27" stroke={line} strokeWidth="0.5" opacity="0.3" />)}
      {[8, 14, 20].map(y => <line key={y} x1="0" y1={y} x2="28" y2={y} stroke={line} strokeWidth="0.5" opacity="0.3" />)}
      <circle cx="14" cy="14" r="5" fill="#00D26A" />
      <circle cx="14" cy="14" r="5" fill="none" stroke={light ? "rgba(255,255,255,0.5)" : "#0F3D2E"} strokeWidth="1" />
      <polygon points="14,9.5 17,11.5 16,17 12,17 11,11.5" fill={light ? "#0F3D2E" : "#fff"} />
      <text x="36" y="20" fontFamily="system-ui,-apple-system,sans-serif" fontSize="16" fontWeight="900" fill={strong} letterSpacing="-0.5">GOAL</text>
      <rect x="82" y="5" width="2.5" height="16" fill="#00D26A" />
      <text x="89" y="20" fontFamily="system-ui,-apple-system,sans-serif" fontSize="16" fontWeight="300" fill={soft} letterSpacing="-0.5">LABO</text>
    </svg>
  );
}

/* ── feature row ── */
function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "22px" }}>
      <div style={{
        width: "38px", height: "38px", borderRadius: "10px", flexShrink: 0,
        background: "rgba(0,210,106,0.12)", border: "1px solid rgba(0,210,106,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.92)", marginBottom: "3px" }}>{title}</p>
        <p style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{desc}</p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUpWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert(`会員登録に失敗しました: ${error.message}`);
      } else {
        alert("確認メールを送信しました。メール内のリンクから登録を完了してください。");
        router.push("/login");
      }
    } catch (err) {
      alert(`エラーが発生しました: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#FAFAF7" }}>

      {/* 左パネル */}
      <div
        className="hidden lg:flex lg:flex-col relative overflow-hidden"
        style={{ flex: "0 0 42%", minHeight: "100vh", padding: "48px 48px" }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(160deg, #0d2b1a 0%, #1a4a2e 30%, #0f3a22 55%, #071a0e 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0, opacity: 0.06,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div style={{
          position: "absolute", top: "30%", left: "60%",
          width: "420px", height: "420px",
          background: "radial-gradient(circle, rgba(0,210,106,0.08) 0%, transparent 70%)",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <Logo light />
        </div>

        <div style={{ position: "relative", zIndex: 2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ fontSize: "34px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.3, marginBottom: "16px" }}>
            もっと、<br />サッカーが深くなる。
          </h1>
          <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.8, marginBottom: "36px" }}>
            Goal Laboに無料登録して、AI分析・監督シミュレーター・掲示板など、すべての機能を使いましょう。
          </p>

          <Feature
            title="AI監督シミュレーター"
            desc="架空の対戦カードをAIが実況生成。あなたの戦術で90分を戦う。"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="#00D26A" strokeWidth="1.4" />
                <path d="M9 5v4l2.5 1.5" stroke="#00D26A" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            }
          />
          <Feature
            title="リアルタイムデータ"
            desc="最新ニュース、試合結果、リーグ順位をいつでもチェック。"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 14V9M8 14V4M13 14v-6" stroke="#00D26A" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            }
          />
          <Feature
            title="掲示板でつながる"
            desc="お気に入りのチームの掲示板で、ファン同士が交流できる。"
            icon={
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 4h12v7H7l-4 3v-3H3V4z" stroke="#00D26A" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            }
          />
        </div>

        <p style={{ position: "relative", zIndex: 2, fontSize: "10px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em" }}>
          © 2025 GOAL LABO, Inc.
        </p>
      </div>

      {/* 右パネル */}
      <div
        className="flex-1 flex flex-col justify-center overflow-y-auto"
        style={{ background: "#FAFAF7", minHeight: "100vh" }}
      >
        <div style={{ maxWidth: "440px", width: "100%", margin: "0 auto", padding: "48px 24px" }}>

          <div className="lg:hidden mb-10">
            <Logo />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#0F3D2E", letterSpacing: "-0.5px", marginBottom: "8px" }}>
              アカウントを作成
            </h1>
            <p style={{ fontSize: "13px", color: "#5A6B66", lineHeight: 1.6 }}>
              今すぐ無料で登録して、Goal Laboを始めましょう。
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignUpWithGoogle}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              padding: "11px 20px", borderRadius: "10px",
              background: "#fff", border: "1.5px solid #E2DDD6",
              fontSize: "14px", fontWeight: 600, color: "#0F3D2E",
              cursor: "pointer", transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              marginBottom: "20px",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#0F3D2E"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2DDD6"; }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            Google で登録する
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "#E8E4DC" }} />
            <span style={{ fontSize: "12px", color: "#8B9994", whiteSpace: "nowrap" }}>またはメールアドレスで登録</span>
            <div style={{ flex: 1, height: "1px", background: "#E8E4DC" }} />
          </div>

          <form onSubmit={handleSignUp} style={{ marginBottom: "20px" }}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#0F3D2E", marginBottom: "6px" }}>
                メールアドレス
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email" placeholder="you@example.com"
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "#fff", border: "1.5px solid #E2DDD6",
                  borderRadius: "9px", fontSize: "14px", color: "#0F3D2E", outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "#00D26A"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,210,106,0.12)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "#E2DDD6"; e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#0F3D2E", marginBottom: "6px" }}>
                パスワード
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  required minLength={6} autoComplete="new-password" placeholder="••••••••••••"
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
              <p style={{ fontSize: "11px", color: "#8B9994", marginTop: "6px" }}>6文字以上で設定してください。</p>
            </div>

            <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer", margin: "16px 0 18px" }}>
              <div
                onClick={() => setAgreed(a => !a)}
                style={{
                  width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0, marginTop: "1px",
                  border: `1.5px solid ${agreed ? "#00D26A" : "#C8C3BC"}`,
                  background: agreed ? "#00D26A" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s ease", cursor: "pointer",
                }}
              >
                {agreed && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5l2.5 2.5L8 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: "12px", color: "#5A6B66", lineHeight: 1.5 }}>
                <a href="/privacy" target="_blank" style={{ color: "#00B85B", fontWeight: 700, textDecoration: "none" }}>プライバシーポリシー</a>
                に同意します。
              </span>
            </label>

            <button
              type="submit" disabled={loading || !agreed}
              style={{
                width: "100%", padding: "12px 20px",
                background: loading || !agreed ? "#B7C7BF" : "#0F3D2E",
                color: "#fff", border: "none", borderRadius: "10px",
                fontSize: "14px", fontWeight: 700, cursor: loading || !agreed ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                boxShadow: loading || !agreed ? "none" : "0 2px 8px rgba(15,61,46,0.3)",
                letterSpacing: "0.02em",
              }}
              onMouseEnter={e => { if (!loading && agreed) (e.currentTarget as HTMLButtonElement).style.background = "#1A5A43"; }}
              onMouseLeave={e => { if (!loading && agreed) (e.currentTarget as HTMLButtonElement).style.background = "#0F3D2E"; }}
            >
              {loading ? "登録中…" : "会員登録 →"}
            </button>
          </form>

          <p style={{ fontSize: "12px", color: "#8B9994", textAlign: "center" }}>
            すでにアカウントをお持ちの方は{" "}
            <a href="/login" style={{ color: "#00B85B", fontWeight: 700, textDecoration: "none" }}>
              ログイン
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
