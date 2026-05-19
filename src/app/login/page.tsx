"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import Logo from "../components/ui/Logo";
import HologramCard from "./HologramCard";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen flex bg-page">

      {/* ── 左パネル：カード ── */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #071a10 0%, #0F3D2E 60%, #0a2a1a 100%)" }}
      >
        {/* 背景ドット模様 */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #00D26A 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-8">
          <HologramCard />
          <p className="text-white/40 text-xs tracking-widest uppercase">
            Goal Labo — Soccer Intelligence Platform
          </p>
        </div>
      </div>

      {/* ── 右パネル：フォーム ── */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 py-12 max-w-xl">

        {/* ロゴ */}
        <div className="mb-12">
          <Logo />
        </div>

        {/* 見出し */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-text-primary leading-tight tracking-tight">
            ようこそ
          </h1>
          <div className="w-10 h-1 rounded-full mt-3 mb-4" style={{ background: "#00D26A" }} />
          <p className="text-text-secondary text-sm">
            Goal Labo にサインインして、サッカー情報の最前線へ
          </p>
        </div>

        {/* Google ログイン */}
        <button
          onClick={handleSignInWithGoogle}
          className="w-full flex items-center justify-center gap-3 border border-[var(--color-border)] rounded-xl py-3 text-sm font-semibold text-text-primary hover:border-[#00D26A] hover:bg-[#00D26A]/5 transition-all duration-200 mb-6"
        >
          {/* Google SVGアイコン */}
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Google でログイン
        </button>

        {/* 区切り */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
          <span className="text-xs text-text-secondary whitespace-nowrap">またはメールで</span>
          <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
        </div>

        {/* メールフォーム */}
        <form onSubmit={handleSignInWithEmail} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="gl-input w-full"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1.5">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="gl-input w-full"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60"
            style={{ background: loading ? "#0F3D2E" : "linear-gradient(135deg, #0F3D2E 0%, #1a5c42 100%)" }}
          >
            {loading ? "ログイン中…" : "ログイン →"}
          </button>
        </form>

        {/* 新規登録 */}
        <p className="mt-6 text-xs text-text-secondary text-center">
          アカウントをお持ちでない方は{" "}
          <a href="/signup" className="font-bold underline underline-offset-2 hover:text-[#00D26A] transition-colors" style={{ color: "var(--fg-1)" }}>
            新規登録
          </a>
        </p>
      </div>
    </div>
  );
}
