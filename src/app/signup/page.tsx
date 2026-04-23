
"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import Logo from "../components/ui/Logo";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    } else {
      // Direct the user to a page that tells them to check their email
      // For now, just redirect to login
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page">
      <div className="max-w-md w-full mx-auto p-4">
        <div className="text-center mb-6">
          <Logo />
        </div>
        <div className="gl-card p-8">
          <h1 className="text-2xl font-bold text-center text-text-primary mb-6">
            アカウントを作成
          </h1>

          <form onSubmit={handleSignUp}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  メールアドレス
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="gl-input"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  パスワード
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="gl-input"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  パスワード（確認）
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="gl-input"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-6 gl-btn gl-btn-primary"
            >
              会員登録
            </button>
          </form>
          <p className="text-center mt-4 text-sm text-text-muted">
            アカウントをお持ちですか？{" "}
            <a
              href="/login"
              className="font-semibold text-accent-primary hover:underline"
            >
              ログイン
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
